import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { CustomerRole, PrismaClient } from '@prisma/client';
import { app, prisma } from './server.js';

const suffix = `test-${Date.now()}`;
const password = 'Correct-Horse-Battery-42!';
let customerToken = '';
let secondCustomerToken = '';
let estateId = '';
let plotId = '';

async function register(email: string) {
  const response = await request(app).post('/api/auth/register').send({
    fullName: 'Boatswain Test Customer', email, phone: '+2348030000000', password
  });
  expect(response.status).toBe(201);
  return response.body.accessToken as string;
}

beforeAll(async () => {
  const estate = await prisma.estate.create({ data: {
    name: 'Automated Test Estate', slug: suffix, location: 'Ibadan, Oyo State', published: true
  }});
  estateId = estate.id;
  const plot = await prisma.plot.create({ data: {
    estateId, plotCode: 'TEST-001', sizeSqm: 300, priceKobo: 350000000n
  }});
  plotId = plot.id;
  customerToken = await register(`${suffix}-one@example.test`);
  secondCustomerToken = await register(`${suffix}-two@example.test`);
});

afterAll(async () => {
  await prisma.reservation.deleteMany({ where: { plotId } });
  await prisma.enquiry.deleteMany({ where: { email: { contains: suffix } } });
  await prisma.plot.deleteMany({ where: { estateId } });
  await prisma.estate.deleteMany({ where: { id: estateId } });
  await prisma.customer.deleteMany({ where: { email: { contains: suffix } } });
  await prisma.$disconnect();
});

describe('Boatswain Property API', () => {
  it('reports liveness and database readiness', async () => {
    expect((await request(app).get('/health')).status).toBe(200);
    expect((await request(app).get('/ready')).status).toBe(200);
  });

  it('authenticates customers and scopes the profile to the token', async () => {
    const response = await request(app).get('/api/me').set('Authorization', `Bearer ${customerToken}`);
    expect(response.status).toBe(200);
    expect(response.body.customer.email).toBe(`${suffix}-one@example.test`);
    expect((await request(app).get('/api/me')).status).toBe(401);
  });

  it('publishes estate plots and serializes Naira amounts safely', async () => {
    const estates = await request(app).get('/api/estates');
    expect(estates.status).toBe(200);
    expect(estates.body.estates.some((e: { slug: string }) => e.slug === suffix)).toBe(true);
    const plots = await request(app).get(`/api/estates/${suffix}/plots`);
    expect(plots.status).toBe(200);
    expect(plots.body.plots[0].priceKobo).toBe('350000000');
  });

  it('requires explicit consent and stores a valid enquiry', async () => {
    const body = { fullName: 'Test Buyer', email: `${suffix}-enquiry@example.test`, phone: '+2348030000000', interest: 'Property', message: 'Please contact me about a plot.' };
    expect((await request(app).post('/api/enquiries').send({ ...body, contactConsent: false })).status).toBe(400);
    const accepted = await request(app).post('/api/enquiries').send({ ...body, contactConsent: true });
    expect(accepted.status).toBe(201);
  });

  it('does not allow customer tokens into staff-only enquiries', async () => {
    const response = await request(app).get('/api/staff/enquiries').set('Authorization', `Bearer ${customerToken}`);
    expect(response.status).toBe(403);
  });

  it('allows only one customer to hold a plot at a time', async () => {
    const attempts = await Promise.all([
      request(app).post(`/api/plots/${plotId}/reservations`).set('Authorization', `Bearer ${customerToken}`),
      request(app).post(`/api/plots/${plotId}/reservations`).set('Authorization', `Bearer ${secondCustomerToken}`)
    ]);
    expect(attempts.map(r => r.status).sort()).toEqual([201, 409]);
    expect(attempts.find(r => r.status === 201)?.body.reservation.status).toBe('ACTIVE');
    const ownReservations = await request(app).get('/api/me/reservations').set('Authorization', `Bearer ${customerToken}`);
    const otherReservations = await request(app).get('/api/me/reservations').set('Authorization', `Bearer ${secondCustomerToken}`);
    expect(ownReservations.status).toBe(200);
    expect(ownReservations.body.reservations).toHaveLength(1);
    expect(ownReservations.body.reservations[0].plot.estate.name).toBe('Automated Test Estate');
    expect(otherReservations.body.reservations).toHaveLength(0);
  });
});

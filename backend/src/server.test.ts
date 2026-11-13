import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { CustomerRole, PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { createHash } from 'node:crypto';
import { app, prisma, setPasswordResetEmailSenderForTests } from './server.js';

const suffix = `test-${Date.now()}`;
const password = 'Correct-Horse-Battery-42!';
let customerToken = '';
let secondCustomerToken = '';
let estateId = '';
let plotId = '';
let adminToken = '';
let managedEstateId = '';

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
  const admin = await prisma.customer.create({ data: {
    fullName: 'Boatswain Test Admin', email: `${suffix}-admin@example.test`, phone: '+2348030000001',
    passwordHash: await bcrypt.hash(password, 12), role: CustomerRole.ADMIN
  }});
  const adminSession = await prisma.session.create({ data: { customerId: admin.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
  adminToken = jwt.sign({ sid: adminSession.id }, process.env.JWT_SECRET!, { subject: admin.id, expiresIn: '1h', issuer: 'boatswain-property-api', audience: 'boatswain-web' });
});

afterAll(async () => {
  await prisma.installment.deleteMany({ where: { paymentPlan: { reservation: { plotId } } } });
  await prisma.paymentPlan.deleteMany({ where: { reservation: { plotId } } });
  await prisma.reservation.deleteMany({ where: { OR: [{ plotId }, { plot: { estateId: managedEstateId } }] } });
  if (managedEstateId) await prisma.plot.deleteMany({ where: { estateId: managedEstateId } });
  if (managedEstateId) await prisma.estate.deleteMany({ where: { id: managedEstateId } });
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


  it('restricts inventory management to administrators and supports verified plot records', async () => {
    const denied = await request(app).post('/api/staff/estates').set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Forbidden Estate', slug: `${suffix}-forbidden`, location: 'Ibadan, Oyo State' });
    expect(denied.status).toBe(403);

    const created = await request(app).post('/api/staff/estates').set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Managed Test Estate', slug: `${suffix}-managed`, location: 'Ibadan, Oyo State', published: true });
    expect(created.status).toBe(201);
    managedEstateId = created.body.estate.id;

    const plot = await request(app).post(`/api/staff/estates/${managedEstateId}/plots`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ plotCode: 'A-001', sizeSqm: 300, priceKobo: '350000000' });
    expect(plot.status).toBe(201);
    expect(plot.body.plot.priceKobo).toBe('350000000');

    const updated = await request(app).patch(`/api/staff/plots/${plot.body.plot.id}`)
      .set('Authorization', `Bearer ${adminToken}`).send({ priceKobo: '375000000' });
    expect(updated.status).toBe(200);
    expect(updated.body.plot.priceKobo).toBe('375000000');

    const publicPlots = await request(app).get(`/api/estates/${suffix}-managed/plots`);
    expect(publicPlots.status).toBe(200);
    expect(publicPlots.body.plots).toHaveLength(1);
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

    const reservationId = attempts.find(r => r.status === 201)!.body.reservation.id as string;
    const customerPlanDenied = await request(app).post(`/api/staff/reservations/${reservationId}/payment-plan`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ depositKobo: '35000000', installmentCount: 6, intervalDays: 30 });
    expect(customerPlanDenied.status).toBe(403);

    const createdPlan = await request(app).post(`/api/staff/reservations/${reservationId}/payment-plan`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ depositKobo: '35000000', installmentCount: 6, intervalDays: 30 });
    expect(createdPlan.status).toBe(201);
    expect(createdPlan.body.paymentPlan.totalPriceKobo).toBe('350000000');
    expect(createdPlan.body.paymentPlan.depositDueKobo).toBe('35000000');
    expect(createdPlan.body.paymentPlan.installments).toHaveLength(6);
    expect(createdPlan.body.paymentPlan.installments.every((item: { amountKobo: string }) => item.amountKobo === '52500000')).toBe(true);

    const ownPlans = await request(app).get('/api/me/payment-plans').set('Authorization', `Bearer ${customerToken}`);
    const otherPlans = await request(app).get('/api/me/payment-plans').set('Authorization', `Bearer ${secondCustomerToken}`);
    expect(ownPlans.status).toBe(200);
    expect(ownPlans.body.paymentPlans).toHaveLength(1);
    expect(ownPlans.body.paymentPlans[0].installments).toHaveLength(6);
    expect(ownPlans.body.paymentPlans[0].ledgerEntries).toHaveLength(0);
    expect(otherPlans.body.paymentPlans).toHaveLength(0);
  });

  it('sends generic password reset responses and consumes a hashed one-time token', async () => {
    const email = `${suffix}-password-reset@example.test`;
    const oldSession = await register(email);
    let deliveredUrl = '';
    process.env.PASSWORD_RESET_URL = 'https://boatswaingroup.github.io/';
    setPasswordResetEmailSenderForTests(async (recipient, url) => {
      expect(recipient).toBe(email);
      deliveredUrl = url;
    });
    const known = await request(app).post('/api/auth/password-reset/request').send({ email });
    const unknown = await request(app).post('/api/auth/password-reset/request').send({ email: `${suffix}-unknown@example.test` });
    expect(known.status).toBe(202);
    expect(unknown.status).toBe(202);
    expect(known.body.message).toBe(unknown.body.message);
    const rawToken = new URLSearchParams(new URL(deliveredUrl).hash.slice(1)).get('passwordResetToken');
    expect(rawToken).toMatch(/^[a-f0-9]{64}$/);
    const tokenHash = createHash('sha256').update(rawToken!).digest('hex');
    const stored = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    expect(stored).not.toBeNull();
    expect(stored!.tokenHash).not.toBe(rawToken);
    const reset = await request(app).post('/api/auth/password-reset/confirm').send({ token: rawToken, password: 'New-Strong-Password-2026!' });
    expect(reset.status).toBe(200);
    expect((await request(app).get('/api/me').set('Authorization', `Bearer ${oldSession}`)).status).toBe(401);
    expect((await request(app).post('/api/auth/login').send({ email, password: 'New-Strong-Password-2026!' })).status).toBe(200);
    const reused = await request(app).post('/api/auth/password-reset/confirm').send({ token: rawToken, password: 'Another-Strong-Password-2026!' });
    expect(reused.status).toBe(400);
    setPasswordResetEmailSenderForTests(null);
  });

  it('rejects expired password reset links', async () => {
    const email = `${suffix}-expired-reset@example.test`;
    await register(email);
    let deliveredUrl = '';
    process.env.PASSWORD_RESET_URL = 'https://boatswaingroup.github.io/';
    setPasswordResetEmailSenderForTests(async (_recipient, url) => { deliveredUrl = url; });
    const requested = await request(app).post('/api/auth/password-reset/request').send({ email });
    expect(requested.status).toBe(202);
    const rawToken = new URLSearchParams(new URL(deliveredUrl).hash.slice(1)).get('passwordResetToken')!;
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    await prisma.passwordResetToken.update({ where: { tokenHash }, data: { expiresAt: new Date(Date.now() - 1000) } });
    const expired = await request(app).post('/api/auth/password-reset/confirm').send({ token: rawToken, password: 'New-Strong-Password-2026!' });
    expect(expired.status).toBe(400);
    setPasswordResetEmailSenderForTests(null);
  });

  it('returns generic password recovery responses and consumes a hashed one-time token', async () => {
    const email = `${suffix}-password-reset@example.test`;
    const oldSession = await register(email);
    let deliveredUrl = '';
    process.env.PASSWORD_RESET_URL = 'https://boatswaingroup.github.io/';
    setPasswordResetEmailSenderForTests(async (recipient, url) => { expect(recipient).toBe(email); deliveredUrl = url; });
    const known = await request(app).post('/api/auth/password-reset/request').send({ email });
    const unknown = await request(app).post('/api/auth/password-reset/request').send({ email: `${suffix}-unknown@example.test` });
    expect(known.status).toBe(202);
    expect(unknown.status).toBe(202);
    expect(known.body.message).toBe(unknown.body.message);
    const rawToken = new URL(deliveredUrl).searchParams.get('passwordResetToken');
    expect(rawToken).toMatch(/^[a-f0-9]{64}$/);
    const tokenHash = createHash('sha256').update(rawToken!).digest('hex');
    const stored = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    expect(stored).not.toBeNull();
    expect(stored!.tokenHash).not.toBe(rawToken);
    const reset = await request(app).post('/api/auth/password-reset/confirm').send({ token: rawToken, password: 'sample-value-123456' });
    expect(reset.status).toBe(200);
    expect((await request(app).get('/api/me').set('Authorization', `Bearer ${oldSession}`)).status).toBe(401);
    expect((await request(app).post('/api/auth/login').send({ email, password: 'sample-value-123456' })).status).toBe(200);
    const reused = await request(app).post('/api/auth/password-reset/confirm').send({ token: rawToken, password: 'another-sample-123456' });
    expect(reused.status).toBe(400);
    setPasswordResetEmailSenderForTests(null);
  });

  it('rejects expired password recovery links', async () => {
    const email = `${suffix}-expired-reset@example.test`;
    await register(email);
    let deliveredUrl = '';
    process.env.PASSWORD_RESET_URL = 'https://boatswaingroup.github.io/';
    setPasswordResetEmailSenderForTests(async (_recipient, url) => { deliveredUrl = url; });
    const requested = await request(app).post('/api/auth/password-reset/request').send({ email });
    expect(requested.status).toBe(202);
    const rawToken = new URL(deliveredUrl).searchParams.get('passwordResetToken')!;
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    await prisma.passwordResetToken.update({ where: { tokenHash }, data: { expiresAt: new Date(Date.now() - 1000) } });
    const expired = await request(app).post('/api/auth/password-reset/confirm').send({ token: rawToken, password: 'sample-value-123456' });
    expect(expired.status).toBe(400);
    setPasswordResetEmailSenderForTests(null);
  });
  it('revokes the current session and all sessions on request', async () => {
    const current = await register(`${suffix}-logout@example.test`);
    const logout = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${current}`);
    expect(logout.status).toBe(200);
    expect((await request(app).get('/api/me').set('Authorization', `Bearer ${current}`)).status).toBe(401);

    const first = await register(`${suffix}-logout-all@example.test`);
    const login = await request(app).post('/api/auth/login').send({ email: `${suffix}-logout-all@example.test`, password });
    expect(login.status).toBe(200);
    const second = login.body.accessToken as string;
    const revokeAll = await request(app).post('/api/auth/logout-all').set('Authorization', `Bearer ${first}`);
    expect(revokeAll.status).toBe(200);
    expect(revokeAll.body.revokedSessions).toBe(2);
    expect((await request(app).get('/api/me').set('Authorization', `Bearer ${second}`)).status).toBe(401);
  });

});

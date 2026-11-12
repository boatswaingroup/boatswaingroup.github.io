import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma, PrismaClient, CustomerRole, PlotStatus, ReservationStatus } from '@prisma/client';
import { z } from 'zod';
import { pathToFileURL } from 'node:url';

const required = ['DATABASE_URL', 'JWT_SECRET'] as const;
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}
if ((process.env.JWT_SECRET ?? '').length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');

export const prisma = new PrismaClient();
export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN ?? '').split(',').map(v => v.trim()).filter(Boolean), credentials: false }));
app.use(express.json({ limit: '32kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api/enquiries', rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false }));

type AuthUser = { id: string; role: CustomerRole };
type AuthedRequest = Request & { user?: AuthUser };
const asyncRoute = (fn: (req: AuthedRequest, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req as AuthedRequest, res)).catch(next);

function authenticate(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.header('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!, { issuer: 'boatswain-property-api', audience: 'boatswain-web' }) as jwt.JwtPayload;
    if (typeof decoded.sub !== 'string' || !Object.values(CustomerRole).includes(decoded.role as CustomerRole)) {
      return res.status(401).json({ error: 'Invalid access token' });
    }
    req.user = { id: decoded.sub, role: decoded.role as CustomerRole };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
}
function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== CustomerRole.ADMIN) return res.status(403).json({ error: 'Administrator access required' });
  next();
}
function requireStaff(req: AuthedRequest, res: Response, next: NextFunction) {
  const staffRoles = new Set<CustomerRole>([CustomerRole.ADMIN, CustomerRole.SALES, CustomerRole.FINANCE]);
  if (!req.user || !staffRoles.has(req.user.role)) {
    return res.status(403).json({ error: 'Staff access required' });
  }
  next();
}
const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  phone: z.string().trim().min(7).max(24),
  password: z.string().min(12).max(128)
});
const loginSchema = z.object({ email: z.string().email().transform(v => v.toLowerCase()), password: z.string().min(1).max(128) });
const estateCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  location: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).optional(),
  published: z.boolean().optional()
});
const plotCreateSchema = z.object({
  plotCode: z.string().trim().min(1).max(40),
  sizeSqm: z.number().int().positive().max(1000000).optional(),
  priceKobo: z.string().regex(/^\d{1,18}$/).optional()
});
const plotUpdateSchema = z.object({
  sizeSqm: z.number().int().positive().max(1000000).nullable().optional(),
  priceKobo: z.string().regex(/^\d{1,18}$/).nullable().optional(),
  status: z.nativeEnum(PlotStatus).optional()
}).refine(value => Object.keys(value).length > 0, 'At least one field is required');
const enquirySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(24),
  interest: z.string().trim().min(2).max(100),
  message: z.string().trim().min(5).max(3000),
  contactConsent: z.literal(true)
});

app.get('/health', (_req, res) => res.json({ ok: true, service: 'boatswain-property-api' }));
app.get('/ready', asyncRoute(async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true, database: 'connected' });
}));

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid registration details', details: parsed.error.flatten() });
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  try {
    const customer = await prisma.customer.create({ data: {
      fullName: parsed.data.fullName, email: parsed.data.email, phone: parsed.data.phone, passwordHash
    }, select: { id: true, fullName: true, email: true, role: true } });
    const token = jwt.sign({ role: customer.role }, process.env.JWT_SECRET!, { subject: customer.id, expiresIn: '1h', issuer: 'boatswain-property-api', audience: 'boatswain-web' });
    return res.status(201).json({ customer, accessToken: token, tokenType: 'Bearer', expiresIn: 3600 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return res.status(409).json({ error: 'An account with this email already exists' });
    throw error;
  }
}));

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid login details' });
  const customer = await prisma.customer.findUnique({ where: { email: parsed.data.email } });
  if (!customer || !(await bcrypt.compare(parsed.data.password, customer.passwordHash))) return res.status(401).json({ error: 'Email or password is incorrect' });
  const accessToken = jwt.sign({ role: customer.role }, process.env.JWT_SECRET!, { subject: customer.id, expiresIn: '1h', issuer: 'boatswain-property-api', audience: 'boatswain-web' });
  return res.json({ customer: { id: customer.id, fullName: customer.fullName, email: customer.email, role: customer.role }, accessToken, tokenType: 'Bearer', expiresIn: 3600 });
}));

app.get('/api/me', authenticate, asyncRoute(async (req, res) => {
  const customer = await prisma.customer.findUnique({ where: { id: req.user!.id }, select: { id: true, fullName: true, email: true, phone: true, role: true, createdAt: true } });
  if (!customer) return res.status(404).json({ error: 'Customer account not found' });
  return res.json({ customer });
}));

app.get('/api/me/reservations', authenticate, asyncRoute(async (req, res) => {
  const reservations = await prisma.reservation.findMany({
    where: { customerId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true, status: true, expiresAt: true, createdAt: true,
      plot: { select: { plotCode: true, sizeSqm: true, priceKobo: true, estate: { select: { name: true, location: true } } } }
    }
  });
  return res.json({ reservations: reservations.map(item => ({
    ...item,
    plot: { ...item.plot, priceKobo: item.plot.priceKobo?.toString() ?? null }
  })) });
}));

app.get('/api/estates', asyncRoute(async (_req, res) => {
  const estates = await prisma.estate.findMany({ where: { published: true }, orderBy: { name: 'asc' }, include: { _count: { select: { plots: { where: { status: PlotStatus.AVAILABLE } } } } } });
  return res.json({ estates });
}));

app.get('/api/estates/:slug/plots', asyncRoute(async (req, res) => {
  const estate = await prisma.estate.findUnique({ where: { slug: req.params.slug } });
  if (!estate || !estate.published) return res.status(404).json({ error: 'Estate not found' });
  const plots = await prisma.plot.findMany({ where: { estateId: estate.id, status: PlotStatus.AVAILABLE }, select: { id: true, plotCode: true, sizeSqm: true, priceKobo: true, status: true }, orderBy: { plotCode: 'asc' } });
  return res.json({ estate: { id: estate.id, name: estate.name, slug: estate.slug }, plots: plots.map(plot => ({ ...plot, priceKobo: plot.priceKobo?.toString() ?? null })) });
}));

app.post('/api/enquiries', asyncRoute(async (req, res) => {
  const parsed = enquirySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid enquiry details', details: parsed.error.flatten() });
  const customerId = (req as AuthedRequest).user?.id;
  const enquiry = await prisma.enquiry.create({ data: { ...parsed.data, customerId } });
  return res.status(201).json({ enquiry: { id: enquiry.id, createdAt: enquiry.createdAt }, message: 'Enquiry received' });
}));

app.get('/api/staff/estates', authenticate, requireAdmin, asyncRoute(async (_req, res) => {
  const estates = await prisma.estate.findMany({
    orderBy: { createdAt: 'desc' },
    include: { plots: { orderBy: { plotCode: 'asc' }, select: { id: true, plotCode: true, sizeSqm: true, priceKobo: true, status: true } } }
  });
  return res.json({ estates: estates.map(estate => ({
    ...estate, plots: estate.plots.map(plot => ({ ...plot, priceKobo: plot.priceKobo?.toString() ?? null }))
  })) });
}));

app.post('/api/staff/estates', authenticate, requireAdmin, asyncRoute(async (req, res) => {
  const parsed = estateCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid estate details', details: parsed.error.flatten() });
  try {
    const estate = await prisma.estate.create({ data: parsed.data });
    return res.status(201).json({ estate });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return res.status(409).json({ error: 'An estate with this slug already exists' });
    throw error;
  }
}));

app.post('/api/staff/estates/:estateId/plots', authenticate, requireAdmin, asyncRoute(async (req, res) => {
  const parsed = plotCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid plot details', details: parsed.error.flatten() });
  const estate = await prisma.estate.findUnique({ where: { id: req.params.estateId } });
  if (!estate) return res.status(404).json({ error: 'Estate not found' });
  try {
    const plot = await prisma.plot.create({ data: {
      estateId: estate.id, plotCode: parsed.data.plotCode, sizeSqm: parsed.data.sizeSqm,
      priceKobo: parsed.data.priceKobo === undefined ? null : BigInt(parsed.data.priceKobo)
    }, select: { id: true, estateId: true, plotCode: true, sizeSqm: true, priceKobo: true, status: true } });
    return res.status(201).json({ plot: { ...plot, priceKobo: plot.priceKobo?.toString() ?? null } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return res.status(409).json({ error: 'That plot code already exists in this estate' });
    throw error;
  }
}));

app.patch('/api/staff/plots/:plotId', authenticate, requireAdmin, asyncRoute(async (req, res) => {
  const parsed = plotUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid plot update', details: parsed.error.flatten() });
  const current = await prisma.plot.findUnique({ where: { id: req.params.plotId } });
  if (!current) return res.status(404).json({ error: 'Plot not found' });
  if (parsed.data.status && parsed.data.status !== current.status) {
    const activeReservation = await prisma.reservation.findFirst({
      where: { plotId: current.id, status: ReservationStatus.ACTIVE, expiresAt: { gt: new Date() } },
      select: { id: true }
    });
    if (activeReservation) return res.status(409).json({ error: 'A plot with an active customer reservation cannot change status' });
  }
  const data: Prisma.PlotUpdateInput = {};
  if (parsed.data.sizeSqm !== undefined) data.sizeSqm = parsed.data.sizeSqm;
  if (parsed.data.priceKobo !== undefined) data.priceKobo = parsed.data.priceKobo === null ? null : BigInt(parsed.data.priceKobo);
  if (parsed.data.status !== undefined) data.status = parsed.data.status;
  const plot = await prisma.plot.update({ where: { id: current.id }, data, select: { id: true, estateId: true, plotCode: true, sizeSqm: true, priceKobo: true, status: true } });
  return res.json({ plot: { ...plot, priceKobo: plot.priceKobo?.toString() ?? null } });
}));

app.get('/api/staff/enquiries', authenticate, requireStaff, asyncRoute(async (_req, res) => {
  const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  return res.json({ enquiries });
}));

app.post('/api/plots/:plotId/reservations', authenticate, asyncRoute(async (req, res) => {
  const plotId = req.params.plotId;
  const now = new Date();
  let result: { id: string; plotId: string; status: ReservationStatus; expiresAt: Date } | null;
  try {
    result = await prisma.$transaction(async tx => {
    const expired = await tx.reservation.findMany({ where: { status: ReservationStatus.ACTIVE, expiresAt: { lte: now } }, select: { id: true, plotId: true } });
    if (expired.length) {
      await tx.reservation.updateMany({ where: { id: { in: expired.map(r => r.id) } }, data: { status: ReservationStatus.EXPIRED } });
      await tx.plot.updateMany({ where: { id: { in: expired.map(r => r.plotId) }, status: PlotStatus.RESERVED }, data: { status: PlotStatus.AVAILABLE } });
    }
    const changed = await tx.plot.updateMany({ where: { id: plotId, status: PlotStatus.AVAILABLE, estate: { published: true } }, data: { status: PlotStatus.RESERVED } });
    if (changed.count !== 1) return null;
    return tx.reservation.create({ data: { plotId, customerId: req.user!.id, expiresAt: new Date(now.getTime() + 20 * 60 * 1000) }, select: { id: true, plotId: true, status: true, expiresAt: true } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return res.status(409).json({ error: 'This plot was reserved by another customer. Refresh the plot list.' });
    }
    throw error;
  }
  if (!result) return res.status(409).json({ error: 'This plot is not currently available. Refresh the plot list.' });
  return res.status(201).json({ reservation: result, message: 'Plot held for 20 minutes. No payment has been taken.' });
}));

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API request failed', error);
  return res.status(500).json({ error: 'An unexpected server error occurred' });
});

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 4000);
  const server = app.listen(port, () => console.log(`Boatswain Property API listening on ${port}`));
  const shutdown = async () => { server.close(); await prisma.$disconnect(); };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

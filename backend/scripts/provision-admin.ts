import 'dotenv/config';
import { PrismaClient, CustomerRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(\`Missing required environment variable: \${name}\`);
  return value;
}

async function main() {
  if (required('CONFIRM_ADMIN_PROVISIONING') !== 'YES') {
    throw new Error('Set CONFIRM_ADMIN_PROVISIONING=YES to confirm this one-time administrator creation.');
  }

  const fullName = required('ADMIN_FULL_NAME');
  const email = required('ADMIN_EMAIL').toLowerCase();
  const phone = required('ADMIN_PHONE');
  const password = required('ADMIN_PASSWORD');

  if (fullName.length < 2 || fullName.length > 120) throw new Error('ADMIN_FULL_NAME must be 2–120 characters.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error('ADMIN_EMAIL must be a valid email address.');
  if (phone.length < 7 || phone.length > 24) throw new Error('ADMIN_PHONE must be 7–24 characters.');
  if (password.length < 16 || password.length > 128) throw new Error('ADMIN_PASSWORD must be 16–128 characters.');

  const existing = await prisma.customer.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw new Error('That email already has an account. This bootstrap command never changes or elevates an existing account.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.customer.create({
    data: { fullName, email, phone, passwordHash, role: CustomerRole.ADMIN },
    select: { id: true, fullName: true, email: true, role: true, createdAt: true }
  });

  process.stdout.write(\`Administrator created: \${admin.email} (id: \${admin.id})\n\`);
  process.stdout.write('Store the credentials securely and remove the bootstrap environment variables.\n');
}

main()
  .catch(error => {
    process.stderr.write(\`Administrator provisioning failed: \${error instanceof Error ? error.message : 'Unknown error'}\n\`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

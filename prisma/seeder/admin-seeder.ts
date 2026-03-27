/* eslint-disable @typescript-eslint/no-explicit-any */

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function seedAdmin(prisma:any) {
  const email = 'admin@example.com';
  const password = 'Admin123!';
  const name = 'Super Admin';
  const role = 'admin';

  // Cek apakah user sudah ada
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log('✅ Admin sudah ada:', existing.email);
    return;
  }

  // Buat user lewat Better Auth API
  const result = await auth.api.createUser({
    body: { email, password, name, role: role as any },
  });

  console.log('🎉 Admin berhasil dibuat lewat Better Auth API!');
  console.log('Email:', result.user.email);
  console.log('Password:', password);

  return result
}


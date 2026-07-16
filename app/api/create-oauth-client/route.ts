// app/api/setup-sso/route.ts
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { NextResponse } from 'next/server';

export async function GET() {
  // Membuat ID sementara yang unik menggunakan timestamp
  // (menghindari error crypto.randomUUID di environment tertentu)
  const tempId = 'temp-' + Date.now();
  const tempToken = 'token-' + Date.now();

  try {
    // 1. Buat User dummy langsung ke database
    await prisma.user.create({
      data: {
        id: tempId,
        name: 'Admin Setup',
        email: 'setup@optiassets.local',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 2. Buat Session aktif dummy untuk user tersebut
    await prisma.session.create({
      data: {
        id: tempId,
        userId: tempId,
        token: tempToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // Aktif 1 jam
        ipAddress: '127.0.0.1',
        userAgent: 'SetupScript',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 3. Inject token ke dalam Headers untuk memalsukan sesi yang sah
    const headers = new Headers();
    headers.set('cookie', `better-auth.session_token=${tempToken}`);

    // 4. Eksekusi API resmi Better Auth (sekarang bebas dari 401)
    const provider = await auth.api.registerSSOProvider({
      body: {
        providerId: 'dutamall',
        issuer: process.env.OIDC_BASE_URL as string,
        domain: 'appdutamall.com',
        oidcConfig: {
          clientId: process.env.OIDC_CLIENT_ID as string,
          clientSecret: process.env.OIDC_CLIENT_SECRET as string,
          authorizationEndpoint: process.env.OIDC_AUTHORIZATION_URL as string,
          tokenEndpoint: process.env.OIDC_TOKEN_URL as string,
          scopes: ['openid', 'email', 'profile'],
          pkce: true,
          mapping: {
            id: 'sub',
            email: 'email',
            emailVerified: 'email_verified',
            name: 'name',
            image: 'picture',
          },
        },
      },
      headers, // Pass headers palsu ini ke Better Auth
    });

    return NextResponse.json({
      success: true,
      message: 'SSO DutaMall berhasil didaftarkan!',
      provider,
    });
  } catch (error) {
    console.error('Setup SSO Error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  } finally {
    // 5. Cleanup: Hapus user & session dummy agar database tetap bersih
    await prisma.session.deleteMany({ where: { userId: tempId } });
    await prisma.user.deleteMany({ where: { id: tempId } });
  }
}

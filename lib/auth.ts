import { prisma } from './prisma';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';

import { admin as adminPg, organization, username } from 'better-auth/plugins';
import { ac, owner, admin } from './auth-permission';
import { sendEmail } from './email';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mysql', // or "mysql", "postgresql", ...etc
  }),

  //...
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [process.env.BETTER_AUTH_URL!],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: false,
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendEmail(
        user.email,
        'Reset Password Anda',
        `<p>Halo ${user.name},</p><p>Silakan klik link berikut untuk mereset password Anda: <a href="${url}">${url}</a></p>`,
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail(
        user.email,
        'Verifikasi Email Anda',
        `<p>Halo ${user.name},</p><p>Silakan klik link berikut untuk memverifikasi email Anda: <a href="${url}">${url}</a></p>`,
      );
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: false,
    },
    additionalFields: {
      role: {
        type: 'string',
        input: false,
      },
      username: {
        type: 'string',
        input: true,
      },
      departmentId: {
        type: 'string',
        input: true,
      },
      divisiId: {
        type: 'string',
        input: true,
      },
    },
  },
  plugins: [
    nextCookies(),
    username(),
    adminPg(),
    organization({
      ac: ac,
      allowUserToCreateOrganization: true,
      roles: {
        owner,
        admin,
      },
      dynamicAccessControl: {
        enabled: true,
      },
      teams: {
        enabled: true,
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session
import { prisma } from './prisma';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { sso } from '@better-auth/sso';
import { admin as adminPg, organization, username } from 'better-auth/plugins';

import { ac, owner, admin } from './auth-permission';
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mysql', // or "mysql", "postgresql", ...etc
  }),

  //...
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL!,
    process.env.NEXT_PUBLIC_BASE_URL!,
    '10.223.232.47',
    '172.17.87.55',
    'optiasset.loca.lt',
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: false,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
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
    nextCookies(),
    sso(),
  ],
});

export type Session = typeof auth.$Infer.Session;

import { nextCookies } from 'better-auth/next-js';
import { createAuthClient } from 'better-auth/react';
import {
  adminClient,
  inferAdditionalFields,
  organizationClient,
  usernameClient,
} from 'better-auth/client/plugins';

import { auth } from './auth';
import { ac, owner, admin } from './auth-permission';

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    inferAdditionalFields<typeof auth>(),
    nextCookies(),
    usernameClient(),
    organizationClient({
      ac: ac,
      dynamicAccessControl: {
        enabled: true,
      },
      roles: {
        owner,
        admin,
      },
      teams: {
        enabled: true,
      },
    }),
  ],
});

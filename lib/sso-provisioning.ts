import { prisma } from './prisma';

const GUEST_ROLE = 'guest';

/**
 * Provisions a newly created SSO user as a guest and adds them to the default
 * organization so that the app has an active organization once an admin
 * verifies the account.
 *
 * New users normally arrive already set to "guest" because the admin plugin is
 * configured with defaultRole: "guest". The role check below is a safety net
 * for paths that leave the role empty.
 *
 * Also runs on every SSO login (provisionUserOnEveryLogin) to recover from a
 * previous failure without overwriting a role that an admin already set.
 */
export async function provisionSsoUser(user: {
  id: string;
  role?: string | null;
}) {
  if (!user.role) {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: GUEST_ROLE },
    });
  }

  await ensureDefaultOrganizationMembership(user.id);
}

async function ensureDefaultOrganizationMembership(userId: string) {
  try {
    const organizationId =
      process.env.SSO_DEFAULT_ORGANIZATION_ID ||
      (
        await prisma.organization.findFirst({
          select: { id: true },
          orderBy: { createdAt: 'asc' },
        })
      )?.id;

    if (!organizationId) {
      console.warn('[sso] No organization found for default membership');
      return;
    }

    const existing = await prisma.member.findFirst({
      where: { userId, organizationId },
      select: { id: true },
    });

    if (existing) return;

    await prisma.member.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        organizationId,
        role: process.env.SSO_DEFAULT_ORG_ROLE || 'member',
        createdAt: new Date(),
      },
    });
  } catch (error) {
    // Membership provisioning must not block sign-in. The admin can still add
    // the user from the members page if this fails.
    console.error('[sso] Failed to provision default organization membership', error);
  }
}

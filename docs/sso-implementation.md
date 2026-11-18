# SAML SSO (OptiGate) — Implementation Notes

Status: **Phase 1 implemented** (single logout deferred)
Last updated: 2026-11-18

## Overview

OptiAsset uses [Better Auth](https://better-auth.com) 1.7.25 with the `@better-auth/sso` plugin
to add SAML SSO alongside the existing email/password login. The provider is configured from
environment variables at startup (approach A, `defaultSSO`) — no database-registered provider
is required. Credential login is unchanged.

- Provider ID: `opti-saml`
- Email domain: `appdutamall.com`
- IdP: OptiGate (`https://gate.appdutamall.com`)
- Assertions must be signed (`wantAssertionsSigned: true`)

## Flow

1. User clicks **"Masuk dengan SSO OptiGate"** on the login page.
2. `authClient.signIn.sso({ providerId: 'opti-saml' })` redirects to the IdP.
3. IdP posts the SAML assertion to the ACS endpoint.
4. Better Auth validates the assertion and finds or creates the user.
   - New users are self-provisioned with role `guest`.
   - Existing users are linked by email **only** if the provider domain is verified
     (`domainVerification.enabled: true`) and the local user's `emailVerified` is `true`.
5. Guest users are redirected to `/waiting` until an admin verifies them.
6. Admin picks a real role in **Users → Verifikasi Akun**; the guest entry is dropped and the
   user gains normal access.

## Files

| File | Purpose |
|------|---------|
| `lib/auth.ts` | Better Auth config: SSO plugin, `defaultSSO`, provisioning hooks |
| `lib/saml-config.ts` | Builds the SAML provider from env, normalizes the IdP cert |
| `lib/sso-provisioning.ts` | Sets `guest` role + default organization membership |
| `lib/auth-client.ts` | `ssoClient` with `domainVerification` enabled |
| `components/login-form.tsx` | SSO button + error mapping |
| `app/(app)/layout.tsx` | Redirects `guest`/null-role users to `/waiting` |
| `app/(auth)/waiting/page.tsx` | "Menunggu Verifikasi Admin" page |
| `app/(auth)/waiting/pending-logout-button.tsx` | Client-side logout for pending users |
| `action/user-action.ts` | Admin user creation; marks `@appdutamall.com` users verified |
| `app/(app)/users/component/user-action-dialog.tsx` | Edit/verify dialog (filters `guest`) |
| `app/(app)/users/component/user-row-action.tsx` | Row actions, including **Verifikasi Akun** |

## Environment variables

Add to `.env` (values from the OptiGate app registration):

```bash
SSO_PROVIDER_ID=opti-saml
SSO_DOMAIN=appdutamall.com
SAML_IDP_ENTITY_ID=https://gate.appdutamall.com/saml/metadata
SAML_IDP_SSO_URL=https://gate.appdutamall.com/saml/sso
SAML_IDP_SLO_URL=https://gate.appdutamall.com/saml/slo

# Base64 certificate body only (no PEM header), or a full PEM string.
# Do NOT commit the real value.
SAML_IDP_CERT=<base64-body>

# Optional provisioning overrides
SSO_DEFAULT_ORGANIZATION_ID=
SSO_DEFAULT_ORG_ROLE=member
```

`lib/saml-config.ts` returns `undefined` when required values are missing, so builds and
credential login keep working without SSO configured.

## Endpoints

Replace `{BETTER_AUTH_URL}` with the public app URL (the same URL registered at OptiGate).

- ACS URL: `{BETTER_AUTH_URL}/api/auth/sso/saml2/sp/acs/opti-saml`
- SP metadata: `{BETTER_AUTH_URL}/api/auth/sso/saml2/sp/metadata?providerId=opti-saml`
- Entity ID / audience: `{BETTER_AUTH_URL}`

## Database

`prisma db push` applied the following Better Auth 1.7 additions:

- `SsoProvider.domainVerified Boolean?`
- `Team.memberCount Int @default(0)`
- `TeamMember.membershipKey String?` + unique index

The generated Prisma client lives in `generated/prisma/` (git-ignored; run
`npm run prisma:push` after schema changes).

### Duplicate model collision (fixed)

The schema had two models mapped to case-differing tables on a
`lower_case_table_names=0` MySQL server:

- `teamMember` → `@@map("teammember")` (legacy, unused)
- `TeamMember` → `@@map("teamMember")` (Better Auth)

Both resolve to the same client property `teamMember`, and the generated runtime
data model silently kept only one of them. Better Auth's 1.7 schema validation
therefore inspected the legacy model and failed at runtime with:

```
Prisma schema mismatch — Missing columns: teamMember.membershipKey
```

The column existed in the DB all along. Fix: the legacy model was renamed to
`LegacyTeamMember` (still mapped to `teammember`, relations updated on `User` and
`Team`). No migration was needed because the table mapping did not change. Run
`npx prisma generate` after pulling this change.

## Data backfill (already applied)

- 16 existing `@appdutamall.com` users were set to `emailVerified = true` so their first SSO
  sign-in links to the existing account.
- 1 non-domain user remains unverified intentionally.
- `ssoProvider` table is empty because the provider is env-driven.

## Security notes

- `provisionUser` sets `guest` only when the role is empty; an admin-set role is never overwritten.
  It runs on every login to recover from failed provisioning.
- Role strings are comma-separated. The verify dialog filters out `guest`, so saving replaces it
  with the selected roles instead of producing `guest,staff`.
- The unsafe fake-session route `app/api/create-oauth-client/route.ts` was deleted.
- `nextCookies()` must remain the last plugin in `lib/auth.ts`.
- SLO is **not** implemented in phase 1. Signing out of OptiAsset does not sign out of OptiGate.

## Testing checklist

- [ ] `npm run build` and `npm run lint` pass.
- [ ] SP metadata endpoint returns XML with the ACS URL above.
- [ ] Credential login still works for existing users.
- [ ] New SSO user lands on `/waiting` with role `guest`.
- [ ] Admin verifies the user; the user reaches `/dashboard` on next navigation.
- [ ] Existing verified `@appdutamall.com` user is linked, not duplicated.
- [ ] `BETTER_AUTH_URL` is a public HTTPS URL reachable by OptiGate (use a tunnel locally).

# OptiAsset SAML SSO Session Context
Date: 2026-11-19

## Current State
- Build: `npm run build` succeeds (Next.js 16.2.1 Turbopack)
- Prisma client regenerated: 2026-11-18 22:39
- SAML SSO Phase 1 implemented via Better Auth 1.7 @better-auth/sso defaultSSO
- Provider ID: opti-saml, domain appdutamall.com
- Credential login unchanged
- New SSO users self-provision role guest → /waiting page until admin verifies
- Backfill emailVerified only for @appdutamall.com users completed
- app/api/create-oauth-client/route.ts deleted
- SLO deferred to Phase 2

## Verified
- Metadata endpoint returns XML: http://localhost:3100/api/auth/sso/saml2/sp/metadata?providerId=opti-saml
  Status 200, EntityDescriptor present, WantAssertionsSigned true
- Auth runtime schema mismatch resolved after LegacyTeamMember rename (map "teamMember")
- Build passes without Turbopack errors

## Open Items / Notes
- BETTER_AUTH_URL = http://localhost:3000 → metadata ACS URL reflects 3000, not 3100. Acceptable for local test; production requires public URL.
- .env contains duplicate DATABASE_URL entries; last wins (~mysql://serverit:...). Review for pool timeouts.
- TypeScript error log stale: asset-edit-form Resolver type mismatch for isAparOrHydrant. Build succeeds, may be false positive.
- TypeError Cannot read properties of null (reading 'innerText') not reproduced in current build; monitor runtime.
- Pool timeouts: consider reducing connection_limit / pool_timeout if MySQL server at 20.20.20.237 is under load.

## Next Steps
1. Regression test credential login + SSO guest flow
2. Admin verify flow → role change to member/admin
3. Production config: BETTER_AUTH_URL, NEXT_PUBLIC_BASE_URL, SAML cert
4. Monitor logs for innerText null and pool timeouts in production

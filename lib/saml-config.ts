const REQUIRED_ENV = [
  'BETTER_AUTH_URL',
  'SSO_DOMAIN',
  'SAML_IDP_ENTITY_ID',
  'SAML_IDP_SSO_URL',
  'SAML_IDP_CERT',
] as const;

function normalizeCertificate(value: string): string {
  if (value.includes('BEGIN CERTIFICATE')) {
    return value.replace(/\\n/g, '\n').trim();
  }

  const body = value.replace(/\s+/g, '');
  const lines = body.match(/.{1,64}/g) ?? [];

  return `-----BEGIN CERTIFICATE-----\n${lines.join('\n')}\n-----END CERTIFICATE-----`;
}

export function isSamlSsoConfigured(): boolean {
  return REQUIRED_ENV.every((key) => Boolean(process.env[key]));
}

/**
 * Builds the env-driven SAML provider for the Better Auth SSO plugin.
 *
 * Returns `undefined` when SAML is not configured so that credential login
 * keeps working in environments without SSO (for example, a local build).
 */
export function buildSamlDefaultSso() {
  if (!isSamlSsoConfigured()) {
    console.warn(
      '[sso] SAML is not configured. Set SSO_DOMAIN, SAML_IDP_ENTITY_ID, SAML_IDP_SSO_URL and SAML_IDP_CERT to enable it.',
    );
    return undefined;
  }

  const baseURL = process.env.BETTER_AUTH_URL!.replace(/\/+$/, '');

  return {
    providerId: process.env.SSO_PROVIDER_ID ?? 'opti-saml',
    domain: process.env.SSO_DOMAIN!,
    samlConfig: {
      // SP entity ID / audience. Must match the value registered at OptiGate.
      issuer: baseURL,
      entryPoint: process.env.SAML_IDP_SSO_URL!,
      idpMetadata: {
        entityID: process.env.SAML_IDP_ENTITY_ID!,
        cert: normalizeCertificate(process.env.SAML_IDP_CERT!),
      },
      wantAssertionsSigned: true,
    },
  };
}

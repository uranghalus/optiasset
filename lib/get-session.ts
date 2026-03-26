import { headers } from 'next/headers';
import { cache } from 'react';
import { auth } from './auth';
import { authClient } from './auth-client';

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return session;
}

export async function getClientSession() {
  const { data, error } = await authClient.getSession();
  return { data, error };
}

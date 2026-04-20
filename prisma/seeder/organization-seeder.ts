import { randomUUID } from 'crypto';

export async function seedOrganization(prisma: any, adminUserId?: string) {
  const slug = 'optiasset';
  const name = 'Optiasset';
  const existing = await prisma.organization.findUnique({
    where: { slug },
  });

  if (existing) {
    console.log('✅ Organization already ada:', existing.name);
    return existing;
  }

  const organization = await prisma.organization.create({
    data: {
      id: randomUUID(),
      name,
      slug,
      logo: null,
      createdAt: new Date(),
      metadata: JSON.stringify({ seededAt: new Date().toISOString() }),
      members: adminUserId
        ? {
            create: {
              id: randomUUID(),
              userId: adminUserId,
              role: 'owner',
              createdAt: new Date(),
            },
          }
        : undefined,
    },
  });

  console.log('🎉 Organization berhasil dibuat:', organization.name);
  return organization;
}

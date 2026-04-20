import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import { seedAdmin } from './admin-seeder';
import { seedOrganization } from './organization-seeder';

async function main() {
  console.log('🌱 Running Seeder...\n');

  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠ WARNING: Seeder running in PRODUCTION\n');
  }

  // Jalankan semua seeder di sini
  const adminUser = await seedAdmin(prisma);
  const organization = await seedOrganization(
    prisma,
    adminUser?.id ?? adminUser?.id,
  );

  console.log('\n✅ Seeders selesai dijalankan:');
  console.log(`- Admin User: ${adminUser?.email || 'Tidak ada'}`);
  console.log(`- Organization: ${organization?.name || 'Tidak ada'}`);
  console.log('\n🎉 ALL SEEDERS COMPLETED SUCCESSFULLY');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeder failed:', e);

    await prisma.$disconnect();
    process.exit(1);
  });

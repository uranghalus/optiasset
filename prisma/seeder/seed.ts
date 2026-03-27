import "dotenv/config";
import { seedAdmin } from "./admin-seeder";
import { prisma } from "@/lib/prisma";

async function main() {
    console.log('Running Seeder...');
    if (process.env.NODE_ENV === "production") {
        console.warn("⚠ WARNING: Seeder running in production");
    }
    await seedAdmin(prisma)
    console.log("\n🎉 ALL SEEDERS COMPLETED SUCCESSFULLY");
}
main()
    .catch((e) => {
        console.error("❌ Seeder failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

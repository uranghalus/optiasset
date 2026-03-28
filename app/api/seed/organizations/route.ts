import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { faker } from "@faker-js/faker";

export async function GET() {
  const sessionHeaders = await headers();

  // Ambil user aktif dari sesi
  const session = await auth.api.getSession({ headers: sessionHeaders });

  if (!session) {
    return NextResponse.json(
      { error: "No user session found" },
      { status: 401 },
    );
  }

  const results = [];

  for (let i = 0; i < 10; i++) {
    const name = faker.company.name();
    const slug = faker.helpers.slugify(name.toLowerCase()) + "-" + i;

    const org = await auth.api.createOrganization({
      body: {
        name,
        slug,
        logo: faker.image.dataUri({ width: 200, height: 200 }),
        metadata: { index: i, seed: true },
        userId: session.user.id, // owner
        keepCurrentActiveOrganization: false,
      },
      headers: sessionHeaders,
    });

    results.push(org);
  }

  return NextResponse.json({
    message: "Seeded 10 organizations using Better Auth",
    organizations: results,
  });
}

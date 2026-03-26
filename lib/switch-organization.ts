"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getActiveOrganizationWithRole } from "@/action/organization-action";

export async function switchOrganizationAdminOnly(
  organizationId: string,
  organizationSlug: string,
) {
  const { role } = await getActiveOrganizationWithRole();

  if (role !== "owner") {
    throw new Error(
      "Forbidden: Hanya owner atau super admin yang dapat berpindah organisasi",
    );
  }

  await auth.api.setActiveOrganization({
    headers: await headers(),
    body: {
      organizationId,
      organizationSlug,
    },
  });
}

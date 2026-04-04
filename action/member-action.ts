'use server'

import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/get-session";
import { PaginationState } from "@/types";
import { headers } from "next/headers";

export async function getListMember({ page, pageSize }: PaginationState) {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    const organization = session.session.activeOrganizationId;
    if (!organization) throw new Error("Organization not found");

    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);
    const skip = (safePage - 1) * safePageSize;
    const take = safePageSize;

    const data = await auth.api.listMembers({
        query: {
            organizationId: organization,
            limit: take,
            offset: skip,
        },
        headers: await headers()
    })

    return {
        data: data.members,
        total: data.total,
        pageCount: Math.ceil(data.total / safePageSize),
        page: safePage,
        pageSize: safePageSize,
    };
}
// LINK add member
export async function addMember(formData: FormData) {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    const organization = session.session.activeOrganizationId;
    if (!organization) throw new Error("Organization not found");

    const userId = formData.get("user-id") as string;
    const roleRaw = formData.get("role") as string;

    if (roleRaw !== "admin" && roleRaw !== "owner") {
        throw new Error("Invalid role");
    }

    const role = roleRaw;

    if (!userId || !role) throw new Error("Required fields are missing");

    const data = await auth.api.addMember({
        body: {
            userId: userId,
            role: role,
            organizationId: organization,
        },
        headers: await headers()
    })

    return data;
}
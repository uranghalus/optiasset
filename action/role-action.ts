'use server';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type PermissionAction =
    | "create"
    | "delete"
    | "update"
    | "list"
    | "view"
    | "edit"
    | "read";
export async function getAllRoles({
    page = 1,
    limit = 10,
}: {
    page?: number;
    limit?: number;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) throw new Error("Unauthorized");

    const organization = session.session.activeOrganizationId;
    if (!organization) throw new Error("Organization not found");

    const roles = await auth.api.listOrgRoles({
        query: {
            organizationId: organization,
        },
        headers: await headers(),
    });

    // 🧠 Manual pagination
    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedRoles = roles.slice(start, end);

    return {
        data: paginatedRoles,
        pagination: {
            page,
            limit,
            total: roles.length,
            totalPages: Math.ceil(roles.length / limit),
        },
    };
}

export async function createRole(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) throw new Error("Unauthorized");
    const organization = session.session.activeOrganizationId;
    if (!organization) throw new Error("Organization not found");
    const name = formData.get("name") as string;
    const permissionsRaw = formData.get("permissions") as string;

    if (!permissionsRaw) {
        throw new Error("Permissions required");
    }

    // ✅ parse JSON dari form
    const permissions = JSON.parse(permissionsRaw) as Record<string, PermissionAction[]>;
    const savedRoles = await auth.api.createOrgRole({
        body: {
            role: name,
            permission: permissions,
            organizationId: organization,
        },
        headers: await headers(),
    });
    revalidatePath("/roles");
    return savedRoles;
}

// export async function updateRole(id: string, formData: FormData) {
//     const session = await auth.api.getSession({
//         headers: await headers()
//     })
//     if (!session) throw new Error("Unauthorized");
//     const organization = session.session.activeOrganizationId;
//     if (!organization) throw new Error("Organization not found");
//     const name = formData.get("name") as string;
//     const description = formData.get("description") as string;
//     const role = await prisma.role.update({
//         where: {
//             id,
//         },
//         data: {
//             name,
//             description,
//         },
//     });
//     revalidatePath("/roles");
//     return role;
// }

// export async function deleteRole(id: string) {
//     const session = await auth.api.getSession({
//         headers: await headers()
//     })
//     if (!session) throw new Error("Unauthorized");
//     const organization = session.session.activeOrganizationId;
//     if (!organization) throw new Error("Organization not found");
//     const role = await prisma.role.delete({
//         where: {
//             id,
//         },
//     });
//     revalidatePath("/roles");
//     return role;
// }
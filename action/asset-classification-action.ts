/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/get-session';
import { createAuditLog } from '@/lib/logger';
import { revalidatePath } from 'next/cache';

/* =========================
 TYPES
========================= */

export type PaginationArgs = {
    page: number;
    pageSize: number;
};

/* =========================
 ASSET GROUP (Golongan)
========================= */

export async function getAssetGroups({
    page,
    pageSize
}: PaginationArgs) {

    const session = await getServerSession();
    if (!session) throw new Error('Unauthorized');

    const orgId = session.session?.activeOrganizationId;
    if (!orgId) throw new Error('No active organization');

    const [data, total] = await prisma.$transaction([
        prisma.assetGroup.findMany({
            where: {
                organizationId: orgId
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: {
                createdAt: 'desc'
            }
        }),
        prisma.assetGroup.count({
            where: {
                organizationId: orgId
            }
        })
    ])

    return {
        data,
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize)
    }
}


export async function createAssetGroup(formData: FormData) {

    const session = await getServerSession();
    if (!session) throw new Error('Unauthorized');

    const orgId = session.session?.activeOrganizationId;
    if (!orgId) throw new Error('No active organization');

    const created = await prisma.$transaction(async (tx) => {

        const result = await tx.assetGroup.create({
            data: {
                code: formData.get('code')?.toString(),
                name: formData.get('name')?.toString()!,
                description: formData.get('description')?.toString(),
                organizationId: orgId
            }
        });

        await createAuditLog({
            userId: session.user.id,
            organizationId: orgId,
            action: 'CREATE',
            entityType: 'ASSET_GROUP',
            entityId: result.id,
            entityInfo: result.name,
            details: {
                newData: result
            },
            tx
        });

        return result;
    });

    revalidatePath('/master/asset-group');

    return created;
}


export async function updateAssetGroup(
    id: string,
    formData: FormData
) {

    const session = await getServerSession();
    if (!session) throw new Error('Unauthorized');

    const orgId = session.session?.activeOrganizationId;
    if (!orgId) throw new Error('No active organization');
    const existing = await prisma.assetGroup.findFirst({
        where: {
            id,
            organizationId: orgId
        }
    });

    if (!existing) throw new Error('Data not found');

    const updated = await prisma.$transaction(async (tx) => {

        const result = await tx.assetGroup.update({
            where: { id },
            data: {
                code: formData.get('code')?.toString(),
                name: formData.get('name')?.toString(),
                description: formData.get('description')?.toString()
            }
        });

        await createAuditLog({
            userId: session.user.id,
            organizationId: orgId!,
            action: 'UPDATE',
            entityType: 'ASSET_GROUP',
            entityId: id,
            entityInfo: result.name,
            details: {
                oldData: existing,
                newData: result
            },
            tx
        });

        return result;
    });

    revalidatePath('/master/asset-group');

    return updated;
}


export async function deleteAssetGroup(id: string) {

    const session = await getServerSession();
    if (!session) throw new Error('Unauthorized');

    const orgId = session.session?.activeOrganizationId;
    if (!orgId) throw new Error('No active organization');
    const deleted = await prisma.$transaction(async (tx) => {

        const existing = await tx.assetGroup.findFirst({
            where: {
                id,
                organizationId: orgId
            }
        });

        if (!existing) {
            throw new Error('Not found');
        }

        const result = await tx.assetGroup.delete({
            where: { id }
        });

        await createAuditLog({
            userId: session.user.id,
            organizationId: orgId!,
            action: 'DELETE',
            entityType: 'ASSET_GROUP',
            entityId: id,
            entityInfo: result.name,
            details: {
                deletedData: result
            },
            tx
        });

        return result;
    });

    revalidatePath('/master/asset-group');

    return deleted;
}



/* =========================
 CATEGORY
========================= */

export async function getCategoriesByGroup(
    assetGroupId: string
) {
    return prisma.assetCategory.findMany({
        where: {
            assetGroupId
        },
        orderBy: {
            code: 'asc'
        }
    })
}


export async function createAssetCategory(
    formData: FormData
) {

    const session = await getServerSession();
    if (!session) throw new Error('Unauthorized');

    const orgId = session.session?.activeOrganizationId!;

    const created = await prisma.$transaction(async (tx) => {

        const result = await tx.assetCategory.create({
            data: {
                assetGroupId: formData.get('assetGroupId')!.toString(),
                code: formData.get('code')?.toString(),
                name: formData.get('name')!.toString(),
                description: formData.get('description')?.toString()
            }
        });

        await createAuditLog({
            userId: session.user.id,
            organizationId: orgId,
            action: 'CREATE',
            entityType: 'ASSET_CATEGORY',
            entityId: result.id,
            entityInfo: result.name,
            details: {
                newData: result
            },
            tx
        });

        return result;
    });

    revalidatePath('/master/asset-category');

    return created;
}



/* =========================
 CLUSTER
========================= */

export async function getClustersByCategory(
    categoryId: string
) {
    return prisma.assetCluster.findMany({
        where: {
            assetCategoryId: categoryId
        },
        orderBy: {
            code: 'asc'
        }
    })
}


export async function createAssetCluster(
    formData: FormData
) {

    const session = await getServerSession();
    if (!session) throw new Error('Unauthorized');

    const orgId = session.session?.activeOrganizationId!;

    const created = await prisma.$transaction(async (tx) => {

        const result = await tx.assetCluster.create({
            data: {
                assetCategoryId: formData.get('assetCategoryId')!.toString(),
                code: formData.get('code')?.toString(),
                name: formData.get('name')!.toString(),
                description: formData.get('description')?.toString()
            }
        });

        await createAuditLog({
            userId: session.user.id,
            organizationId: orgId,
            action: 'CREATE',
            entityType: 'ASSET_CLUSTER',
            entityId: result.id,
            entityInfo: result.name,
            details: {
                newData: result
            },
            tx
        });

        return result;

    });

    revalidatePath('/master/asset-cluster');

    return created;

}



/* =========================
 SUB CLUSTER
========================= */

export async function getSubClustersByCluster(
    clusterId: string
) {
    return prisma.assetSubCluster.findMany({
        where: {
            assetClusterId: clusterId
        },
        orderBy: {
            code: 'asc'
        }
    })
}


export async function createAssetSubCluster(
    formData: FormData
) {

    const session = await getServerSession();
    if (!session) throw new Error('Unauthorized');

    const orgId = session.session?.activeOrganizationId!;

    const created = await prisma.$transaction(async (tx) => {

        const result = await tx.assetSubCluster.create({
            data: {
                assetClusterId: formData.get('assetClusterId')!.toString(),
                code: formData.get('code')?.toString(),
                name: formData.get('name')!.toString(),
                description: formData.get('description')?.toString(),
                notes: formData.get('notes')?.toString()
            }
        });

        await createAuditLog({
            userId: session.user.id,
            organizationId: orgId,
            action: 'CREATE',
            entityType: 'ASSET_SUB_CLUSTER',
            entityId: result.id,
            entityInfo: result.name,
            details: {
                newData: result
            },
            tx
        });

        return result;

    });

    revalidatePath('/master/asset-sub-cluster');

    return created;

}



/* =========================
 CASCADING SELECTS
========================= */

export async function getAssetGroupsForSelect() {

    const session = await getServerSession();
    if (!session) throw new Error('Unauthorized');

    const orgId = session.session?.activeOrganizationId;
    if (!orgId) throw new Error('No active organization');
    return prisma.assetGroup.findMany({
        where: {
            organizationId: orgId
        },
        select: {
            id: true,
            code: true,
            name: true
        },
        orderBy: {
            code: 'asc'
        }
    });

}



/* =========================
 FULL TREE
========================= */

export async function getClassificationTree() {

    const session = await getServerSession();
    if (!session) throw new Error('Unauthorized');

    const orgId = session.session?.activeOrganizationId;
    if (!orgId) throw new Error('No active organization');
    return prisma.assetGroup.findMany({
        where: {
            organizationId: orgId
        },
        include: {
            categories: {
                include: {
                    assetClusters: {
                        include: {
                            assetSubClusters: true
                        }
                    }
                }
            }
        },
        orderBy: {
            code: 'asc'
        }
    });

}



/* =========================
 GET SUB CLUSTER DETAIL
(for item mapping)
========================= */

export async function getSubClusterById(
    id: string
) {
    return prisma.assetSubCluster.findUnique({
        where: { id },
        include: {
            assetCluster: {
                include: {
                    assetCategory: {
                        include: {
                            assetGroup: true
                        }
                    }
                }
            }
        }
    })
}
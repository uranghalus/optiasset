"use server"


import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
/* =======================
//  LINK GET ASSET HISTORY BY ASSET ID
 ======================= */
export async function getAssetHistoryByAssetId(assetId: string) {
    const session = await getServerSession()
    if (!session) throw new Error("Unauthorized")

    const activeOrgId = session.session.activeOrganizationId
    if (!activeOrgId) throw new Error("No active organization")

    try {
        const history = await prisma.assetHistory.findMany({
            where: {
                assetId: assetId,
                organizationId: activeOrgId
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: { name: true },
                },
                acknowledgedBy: {
                    select: { name: true },
                }
            }
        })

        // Jika history null/undefined (jarang terjadi di findMany), kembalikan []
        return history ?? []

    } catch (error) {
        console.log(error)
        // JANGAN return object { success: false }
        // Karena UI mengharapkan array untuk di .map()
        return []
    }
}
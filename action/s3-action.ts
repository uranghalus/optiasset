"use server";

import { getPrivateUrl } from "@/lib/s3-utils";

export async function getS3SignedUrlAction(key: string | null) {
    if (!key) return null;
    return await getPrivateUrl(key);
}

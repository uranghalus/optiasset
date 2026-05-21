import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createAuditLog } from "@/lib/logger";

export async function POST() {
  try {
    const { session, user } =
      (await auth.api.getSession({
        headers: await headers(),
      })) || {};

    if (user) {
      // Catat log logout
      await createAuditLog({
        userId: user.id,
        action: "LOGOUT",
        entityType: "AUTH",
        entityInfo: user.email,
      });

      // Panggil fungsi signout dari better-auth (jika perlu mematikan sesi di server)
      // await auth.api.signOut({ headers: await headers() });
    }

    return NextResponse.json(
      { status: "success", message: "Logout berhasil dicatat" },
      { status: 200 }
    );
  } catch (error) {
    console.error("LOGOUT API ERROR:", error);
    return NextResponse.json(
      { status: "error", message: "Gagal memproses logout" },
      { status: 500 }
    );
  }
}
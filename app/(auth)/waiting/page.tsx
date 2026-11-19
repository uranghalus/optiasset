import { Clock } from "lucide-react";
import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/get-session";
import { PendingLogoutButton } from "./pending-logout-button";

export const metadata = {
  title: "Menunggu Verifikasi",
  description: "Akun Anda sedang menunggu verifikasi admin.",
};

export default async function WaitingPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  // Only unverified (guest) accounts may see this page.
  if (session.user.role && session.user.role !== "guest") {
    redirect("/dashboard");
  }

  return (
    <div className="flex w-full items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Clock className="h-8 w-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Menunggu Verifikasi Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Akun{" "}
            <span className="font-medium text-foreground">
              {session.user.email}
            </span>{" "}
            sudah berhasil dibuat melalui SSO. Hubungi admin untuk
            mengaktifkan akses Anda.
          </p>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4 text-left text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            Apa yang perlu dilakukan?
          </p>
          <p className="mt-1">
            Admin perlu mengubah role akun Anda dari{" "}
            <span className="font-mono">guest</span> menjadi role yang sesuai
            di menu Users.
          </p>
        </div>

        <PendingLogoutButton />
      </div>
    </div>
  );
}

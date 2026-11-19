"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { logoutLogAction } from "@/action/auth-action";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function PendingLogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    try {
      await logoutLogAction();
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch (error) {
      console.error("Error during sign out:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? "Keluar..." : "Keluar"}
    </Button>
  );
}

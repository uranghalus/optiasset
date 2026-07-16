"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck, AlertCircle, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ConsentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const scope = searchParams.get("scope");
  const state = searchParams.get("state");
  const responseType = searchParams.get("response_type");
  const codeChallenge = searchParams.get("code_challenge");
  const codeChallengeMethod = searchParams.get("code_challenge_method");

  const scopes = scope?.split(" ") || [];

  const scopeLabels: Record<string, string> = {
    openid: "OpenID Connect - Identitas pengguna",
    profile: "Profil - Nama, avatar, dan info publik",
    email: "Email - Alamat email pengguna",
    offline_access: "Akses offline - Refresh token untuk sesi lama",
    organization: "Organisasi - Akses ke data organisasi/team",
  };

  const handleAllow = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        client_id: clientId!,
        redirect_uri: redirectUri!,
        response_type: responseType || "code",
        scope: scope || "",
        state: state || "",
      });

      if (codeChallenge) {
        params.append("code_challenge", codeChallenge);
        params.append("code_challenge_method", codeChallengeMethod || "S256");
      }

      const authUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/auth/oauth2/authorize?${params.toString()}`;
      router.push(authUrl);
    } catch (err) {
      setError("Gagal memproses persetujuan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  const handleDeny = () => {
    if (redirectUri && state) {
      const denyUrl = new URL(redirectUri);
      denyUrl.searchParams.set("error", "access_denied");
      denyUrl.searchParams.set("error_description", "The user denied the authorization request");
      denyUrl.searchParams.set("state", state);
      router.push(denyUrl.toString());
    } else {
      router.push("/login?error=access_denied");
    }
  };

  if (!clientId || !redirectUri) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-semibold">Permintaan Tidak Valid</h2>
              <p className="text-muted-foreground mt-2">
                Parameter OAuth yang diperlukan tidak ditemukan. Silakan kembali ke aplikasi dan coba lagi.
              </p>
              <Button className="mt-6 w-full" onClick={() => router.push("/login")}>
                Kembali ke Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <ShieldCheck className="h-12 w-12 mx-auto text-primary mb-4" />
          <CardTitle className="text-xl">Izin Akses Aplikasi</CardTitle>
          <CardDescription>
            Aplikasi <strong>{clientId}</strong> meminta izin untuk mengakses data Anda
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Iz yang diminta:</h4>
            <ul className="space-y-2">
              {scopes.map((s) => (
                <li key={s} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{scopeLabels[s] || s}</p>
                    <p className="text-xs text-muted-foreground">Scope: <code>{s}</code></p>
                  </div>
                </li>
              ))}
              {scopes.length === 0 && (
                <li className="text-sm text-muted-foreground text-center py-4">
                  Tidak ada scope yang diminta
                </li>
              )}
            </ul>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            <p className="font-medium">Redirect URI:</p>
            <p className="text-muted-foreground truncate mt-1">{redirectUri}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDeny}
              disabled={loading}
            >
              Tolak
            </Button>
            <Button
              className="flex-1"
              onClick={handleAllow}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Izinkan"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
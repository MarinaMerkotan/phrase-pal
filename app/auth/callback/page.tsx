"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { nhost } from "@/lib/nhost/client";
import { useI18n } from "@/lib/i18n";

export default function AuthCallbackPage() {
  const router = useRouter(); const { t } = useI18n(); const [error, setError] = useState<string | null>(null);
  useEffect(() => { const run = async () => { const params = new URLSearchParams(window.location.search); const code = params.get("code"); const oauthError = params.get("error"); if (oauthError) { setError(oauthError); return; } if (!code) { setError("Missing authorization code"); return; } const verifier = window.localStorage.getItem("phrase-pal.pkce-verifier"); if (!verifier) { setError("Missing PKCE verifier"); return; } try { await nhost.auth.tokenExchange({ code, codeVerifier: verifier }); window.localStorage.removeItem("phrase-pal.pkce-verifier"); router.replace("/sets"); } catch (cause) { setError(cause instanceof Error ? cause.message : "Authentication failed"); } }; void run(); }, [router]);
  return <main className="grid min-h-screen place-items-center bg-background p-5"><div className="max-w-sm text-center"><div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" /><h1 className="text-lg font-semibold">{error ? t("authError") : t("loading")}</h1>{error && <p className="mt-2 text-sm text-destructive">{error}</p>}</div></main>;
}

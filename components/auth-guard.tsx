"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { useI18n } from "@/lib/i18n";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth(); const router = useRouter(); const pathname = usePathname(); const { t } = useI18n();
  useEffect(() => { if (!loading && !user) router.replace(`/?next=${encodeURIComponent(pathname)}`); }, [loading, pathname, router, user]);
  if (loading || !user) return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">{t("loading")}</div>;
  return <>{children}</>;
}

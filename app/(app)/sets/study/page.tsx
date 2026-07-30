"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { listSets } from "@/lib/nhost/graphql";
import { useI18n } from "@/lib/i18n";

export default function StudyIndexPage() { const router = useRouter(); const { t } = useI18n(); useEffect(() => { void listSets().then((sets) => { const first = sets[0]; router.replace(first ? `/sets/${first.id}/study` : "/sets"); }).catch(() => router.replace("/sets")); }, [router]); return <main className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">{t("loading")}</main>; }

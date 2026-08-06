"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { SetForm } from "@/components/set-form";
import { getSet, updateSet } from "@/lib/nhost/graphql";
import { useI18n } from "@/lib/i18n";
import type { VocabularySet } from "@/lib/types";

export default function EditSetPage() { const { setId } = useParams<{ setId: string }>(); const router = useRouter(); const { t } = useI18n(); const [set, setSet] = useState<VocabularySet | null>(null); useEffect(() => { void getSet(setId).then(setSet); }, [setId]); return <AppShell title={t("editSet")} back={`/sets/${setId}`}>{!set ? <p className="text-sm text-muted-foreground">{t("loading")}</p> : <Card className="mx-auto max-w-xl p-6"><SetForm initial={set} submitLabel={t("save")} onSubmit={async (values) => { await updateSet(setId, { title: values.title, description: values.description || null, tags: values.tags }); router.replace(`/sets/${setId}`); }} /></Card>}</AppShell>; }

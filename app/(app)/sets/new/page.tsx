"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { SetForm } from "@/components/set-form";
import { createSet } from "@/lib/nhost/graphql";
import { useI18n } from "@/lib/i18n";

export default function NewSetPage() { const router = useRouter(); const { t } = useI18n(); return <AppShell title={t("createSet")} back="/sets"><Card className="mx-auto max-w-xl p-6"><SetForm submitLabel={t("create")} onSubmit={async (values) => { const set = await createSet({ title: values.title, description: values.description || null }); router.replace(`/sets/${set.id}`); }} /></Card></AppShell>; }

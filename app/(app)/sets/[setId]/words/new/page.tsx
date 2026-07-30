"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CardForm } from "@/components/card-form";
import { Card } from "@/components/ui";
import { createCard } from "@/lib/nhost/graphql";
import { useI18n } from "@/lib/i18n";

export default function NewWordPage() { const { setId } = useParams<{ setId: string }>(); const router = useRouter(); const { t } = useI18n(); return <AppShell title={t("addWord")} back={`/sets/${setId}`}><Card className="mx-auto max-w-xl p-6"><CardForm onSubmit={async (values) => { await createCard(setId, values); router.replace(`/sets/${setId}`); }} /></Card></AppShell>; }

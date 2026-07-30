"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CardForm } from "@/components/card-form";
import { Card } from "@/components/ui";
import { getSet, updateCard } from "@/lib/nhost/graphql";
import { useI18n } from "@/lib/i18n";
import type { VocabularyCard } from "@/lib/types";

export default function EditWordPage() { const { setId, wordId } = useParams<{ setId: string; wordId: string }>(); const router = useRouter(); const { t } = useI18n(); const [card, setCard] = useState<VocabularyCard | null>(null); useEffect(() => { void getSet(setId).then((set) => setCard(set?.cards.find((item) => item.id === wordId) ?? null)); }, [setId, wordId]); return <AppShell title={t("edit")} back={`/sets/${setId}`}>{!card ? <p className="text-sm text-muted-foreground">{t("loading")}</p> : <Card className="mx-auto max-w-xl p-6"><CardForm initial={card} onSubmit={async (values) => { await updateCard(wordId, values); router.replace(`/sets/${setId}`); }} /></Card>}</AppShell>; }

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { SetForm } from "@/components/set-form";
import { createSet } from "@/lib/nhost/graphql";
import { useI18n } from "@/lib/i18n";

export default function NewSetPage() { const router = useRouter(); const { t } = useI18n(); const [kind, setKind] = useState<"vocabulary" | "text">("vocabulary"); return <AppShell title={t("createSet")} back="/sets"><Card className="mx-auto max-w-xl p-6"><fieldset className="mb-5"><legend className="mb-2 text-sm font-semibold">{t("setType")}</legend><div className="grid grid-cols-2 gap-2">{(["vocabulary", "text"] as const).map((value) => <button key={value} type="button" aria-pressed={kind === value} onClick={() => setKind(value)} className={`rounded-xl border px-4 py-3 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-primary ${kind === value ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{t(value === "text" ? "textSet" : "vocabularySet")}</button>)}</div></fieldset><SetForm submitLabel={t("create")} onSubmit={async (values) => { const set = await createSet({ title: values.title, description: values.description || null, tags: values.tags, kind }); router.replace(kind === "text" ? `/sets/${set.id}/import` : `/sets/${set.id}`); }} /></Card></AppShell>; }

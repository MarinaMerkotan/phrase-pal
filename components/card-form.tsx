"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useI18n } from "@/lib/i18n";
import { cardSchema } from "@/lib/validators";
import { Button, Input } from "./ui";

type Values = z.infer<typeof cardSchema>;
export function CardForm({ initial, onSubmit }: { initial?: Partial<Values>; onSubmit: (values: Values) => Promise<void> }) {
  const { t } = useI18n(); const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(cardSchema), defaultValues: { term: initial?.term ?? "", translation: initial?.translation ?? "" } });
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-5"><label className="block space-y-2"><span className="text-sm font-semibold">{t("englishTerm")}</span><Input {...register("term")} autoFocus />{errors.term && <span className="text-xs text-destructive">{errors.term.message}</span>}</label><label className="block space-y-2"><span className="text-sm font-semibold">{t("ukrainianTranslation")}</span><Input {...register("translation")} />{errors.translation && <span className="text-xs text-destructive">{errors.translation.message}</span>}</label><Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? t("loading") : t("save")}</Button></form>;
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@/lib/i18n";
import { setSchema } from "@/lib/validators";
import { Button, Input, Textarea } from "./ui";
import type { z } from "zod";

type Values = z.infer<typeof setSchema>;
export function SetForm({ initial, submitLabel, onSubmit }: { initial?: Partial<Values> | { title: string; description: string | null }; submitLabel: string; onSubmit: (values: Values) => Promise<void> }) {
  const { t } = useI18n(); const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(setSchema), defaultValues: { title: initial?.title ?? "", description: initial?.description ?? "" } });
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-5"><label className="block space-y-2"><span className="text-sm font-semibold">{t("title")}</span><Input {...register("title")} autoFocus placeholder="e.g. Job interview" />{errors.title && <span className="text-xs text-destructive">{errors.title.message}</span>}</label><label className="block space-y-2"><span className="text-sm font-semibold">{t("description")}</span><Textarea {...register("description")} placeholder="What are you learning these words for?" />{errors.description && <span className="text-xs text-destructive">{errors.description.message}</span>}</label><Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? t("loading") : submitLabel}</Button></form>;
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@/lib/i18n";
import { setSchema } from "@/lib/validators";
import { SET_TAGS } from "@/lib/types";
import { Button, Input, Textarea } from "./ui";
import type { z } from "zod";

type Values = z.infer<typeof setSchema>;
export function SetForm({ initial, submitLabel, onSubmit }: { initial?: Partial<Omit<Values, "description">> & { description?: string | null }; submitLabel: string; onSubmit: (values: Values) => Promise<void> }) {
  const { t } = useI18n(); const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(setSchema), defaultValues: { title: initial?.title ?? "", description: initial?.description ?? "", tags: initial?.tags ?? [] } });
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-5"><label className="block space-y-2"><span className="text-sm font-semibold">{t("title")}</span><Input {...register("title")} autoFocus placeholder="e.g. Job interview" />{errors.title && <span className="text-xs text-destructive">{errors.title.message}</span>}</label><label className="block space-y-2"><span className="text-sm font-semibold">{t("description")}</span><Textarea {...register("description")} placeholder="What are you learning these words for?" />{errors.description && <span className="text-xs text-destructive">{errors.description.message}</span>}</label><fieldset><legend className="text-sm font-semibold">{t("setTags")}</legend><p className="mt-1 text-xs text-muted-foreground">{t("setTagsHint")}</p><div className="mt-3 flex flex-wrap gap-2">{SET_TAGS.map((tag) => <label key={tag} className="cursor-pointer"><input type="checkbox" value={tag} {...register("tags")} className="peer sr-only" /><span className="inline-flex rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary">{t(`setTag.${tag}`)}</span></label>)}</div></fieldset><Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? t("loading") : submitLabel}</Button></form>;
}

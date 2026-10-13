"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "./app-shell";
import { Button, Card, Input, Textarea } from "./ui";
import { useI18n } from "@/lib/i18n";
import { getSet, updateTextContent } from "@/lib/nhost/graphql";
import { alignTranslations, paragraphEnglish, parsePlainText, uniqueParagraphs } from "@/lib/text-document";
import { getErrorMessage, normalizeText } from "@/lib/utils";
import type { TextDocument, VocabularySet } from "@/lib/types";

export function TextImport({ set }: { set: VocabularySet }) {
  const router = useRouter();
  const { t } = useI18n();
  const [english, setEnglish] = useState("");
  const [ukrainian, setUkrainian] = useState("");
  const [draft, setDraft] = useState<TextDocument | null>(null);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const ready = useMemo(() => draft ? uniqueParagraphs(set.text_content ?? { version: 1, paragraphs: [] }, draft) : [], [draft, set.text_content]);

  const preview = () => {
    setError(""); setWarning("");
    let parsed = parsePlainText(english);
    if (!parsed.paragraphs.length) { setError(t("pasteEnglishFirst")); return; }
    if (ukrainian.trim()) {
      const result = alignTranslations(parsed, parsePlainText(ukrainian, "uk"));
      parsed = result.document;
      if (!result.aligned) setWarning(t("translationAlignmentWarning"));
    }
    setDraft(parsed);
  };

  const changeSentence = (paragraphId: string, sentenceId: string, field: "english" | "ukrainian", value: string) => setDraft((current) => current ? { ...current, paragraphs: current.paragraphs.map((paragraph) => paragraph.id === paragraphId ? { ...paragraph, sentences: paragraph.sentences.map((sentence) => sentence.id === sentenceId ? { ...sentence, [field]: value } : sentence) } : paragraph) } : current);
  const changeParagraph = (paragraphId: string, value: string) => setDraft((current) => current ? { ...current, paragraphs: current.paragraphs.map((paragraph) => paragraph.id === paragraphId ? { ...paragraph, ukrainian: value } : paragraph) } : current);
  const save = async () => {
    if (!draft || !ready.length) return;
    setBusy(true); setError("");
    try {
      const latest = await getSet(set.id);
      if (!latest) throw new Error(t("notFound"));
      const fresh = uniqueParagraphs(latest.text_content, { version: 1, paragraphs: ready });
      if (!fresh.length) { setError(t("duplicateText")); return; }
      if (fresh.some((paragraph) => paragraph.sentences.some((sentence) => !sentence.english.trim()))) { setError(t("emptySentence")); return; }
      await updateTextContent(set.id, { version: 1, paragraphs: [...latest.text_content.paragraphs, ...fresh.map((paragraph) => ({ ...paragraph, ukrainian: paragraph.ukrainian.trim(), sentences: paragraph.sentences.map((sentence) => ({ ...sentence, english: sentence.english.trim(), ukrainian: sentence.ukrainian.trim() })) }))] });
      router.replace(`/sets/${set.id}/read`);
    } catch (cause) { setError(getErrorMessage(cause)); } finally { setBusy(false); }
  };

  return <AppShell title={t("importText")} back={`/sets/${set.id}`}><div className="mx-auto max-w-3xl space-y-5">
    {!draft ? <Card className="space-y-5 p-5"><label className="block space-y-2"><span className="text-sm font-semibold">{t("englishText")}</span><Textarea value={english} onChange={(event) => setEnglish(event.target.value)} rows={12} placeholder={t("plainTextHint")} /></label><label className="block space-y-2"><span className="text-sm font-semibold">{t("optionalUkrainianText")}</span><Textarea value={ukrainian} onChange={(event) => setUkrainian(event.target.value)} rows={6} /></label><p className="text-xs text-muted-foreground">{t("manualTranslationNote")}</p><Button onClick={preview} disabled={!english.trim()}>{t("parse")}</Button></Card> : <><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">{t("preview")}</h2><p className="text-sm text-muted-foreground">{ready.length} / {draft.paragraphs.length} {t("paragraphsReady")}</p></div><Button variant="secondary" onClick={() => setDraft(null)}>{t("back")}</Button></div>
      {draft.paragraphs.map((paragraph, index) => { const key = normalizeText(paragraphEnglish(paragraph)); const duplicate = !key || !ready.some((candidate) => candidate.id === paragraph.id); return <Card key={paragraph.id} className="space-y-3 p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">{t("paragraph")} {index + 1}</h3>{duplicate && <span className="text-xs text-warning">{t("duplicate")}</span>}</div>{paragraph.sentences.map((sentence, sentenceIndex) => <div key={sentence.id} className="grid gap-2 sm:grid-cols-2"><label className="text-xs text-muted-foreground">EN {sentenceIndex + 1}<Input value={sentence.english} onChange={(event) => changeSentence(paragraph.id, sentence.id, "english", event.target.value)} aria-label={`English sentence ${sentenceIndex + 1}`} /></label><label className="text-xs text-muted-foreground">UK {sentenceIndex + 1}<Input value={sentence.ukrainian} onChange={(event) => changeSentence(paragraph.id, sentence.id, "ukrainian", event.target.value)} aria-label={`Ukrainian sentence ${sentenceIndex + 1}`} /></label></div>)}<label className="block text-xs text-muted-foreground">{t("paragraphTranslation")}<Textarea rows={2} value={paragraph.ukrainian} onChange={(event) => changeParagraph(paragraph.id, event.target.value)} /></label></Card>; })}
      <Button onClick={() => void save()} disabled={busy || !ready.length}>{busy ? t("loading") : t("importSelected")}</Button></>}
    {warning && <p role="status" className="rounded-xl bg-warning/10 p-3 text-sm text-warning">{warning}</p>}{error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
  </div></AppShell>;
}

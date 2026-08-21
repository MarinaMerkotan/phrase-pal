"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, GraduationCap, MoreHorizontal, Pencil, Pin, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { SetTags } from "@/components/set-tags";
import { Badge, Button, Card, Input, ProgressBar } from "@/components/ui";
import { deleteSet, listSets, updateSetPinned } from "@/lib/nhost/graphql";
import { getSetStats, type VocabularySet } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

type SetSort = "date-desc" | "date-asc" | "progress-desc" | "progress-asc";

const SORT_OPTIONS: Array<{ value: SetSort; labelKey: string; directionKey: string; direction: "asc" | "desc" }> = [
  { value: "date-desc", labelKey: "sortByDate", directionKey: "newestFirst", direction: "desc" },
  { value: "date-asc", labelKey: "sortByDate", directionKey: "oldestFirst", direction: "asc" },
  { value: "progress-desc", labelKey: "sortByProgress", directionKey: "highestFirst", direction: "desc" },
  { value: "progress-asc", labelKey: "sortByProgress", directionKey: "lowestFirst", direction: "asc" },
];

export default function SetsPage() {
  const { t } = useI18n();
  const [sets, setSets] = useState<VocabularySet[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SetSort>("date-desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sortMenuRef = useRef<HTMLDetailsElement>(null);

  const sortedSets = useMemo(() => [...sets].sort((a, b) => {
    const pinnedOrder = Number(b.is_pinned) - Number(a.is_pinned);
    if (pinnedOrder !== 0) return pinnedOrder;

    const [field, direction] = sort.split("-") as ["date" | "progress", "asc" | "desc"];
    const aValue = field === "date" ? Date.parse(a.created_at) : getSetStats(a).progress;
    const bValue = field === "date" ? Date.parse(b.created_at) : getSetStats(b).progress;
    const sortedValue = (aValue - bValue) * (direction === "asc" ? 1 : -1);

    return sortedValue || b.created_at.localeCompare(a.created_at);
  }), [sets, sort]);

  const activeSort = SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      listSets(query)
        .then(setSets)
        .catch((cause) => setError(getErrorMessage(cause)))
        .finally(() => setLoading(false));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [query]);

  const remove = async (id: string) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try {
      await deleteSet(id);
      setSets((prev) => prev.filter((set) => set.id !== id));
    } catch (cause) {
      setError(getErrorMessage(cause));
    }
  };

  const togglePin = async (set: VocabularySet) => {
    try {
      const updated = await updateSetPinned(set.id, !set.is_pinned);
      setSets((prev) => prev.map((item) => item.id === updated.id ? updated : item));
    } catch (cause) {
      setError(getErrorMessage(cause));
    }
  };

  return (
    <AppShell title={t("sets")} action={<Link href="/sets/new"><Button size="sm"><Plus className="h-4 w-4" />{t("newSet")}</Button></Link>}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div><p className="text-2xl font-bold tracking-tight">{t("sets")}</p><p className="mt-1 text-sm text-muted-foreground">Build your personal library of words.</p></div>
      </div>
      <div className="mb-5 flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchSets")} className="pl-9" /></div>
        <details ref={sortMenuRef} className="group/sort relative shrink-0">
          <summary aria-label={t("sortSets")} className="flex h-11 min-w-52 list-none items-center justify-between gap-3 rounded-xl border border-input bg-background/60 px-3.5 text-sm font-medium transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span className="flex min-w-0 items-center gap-2"><ArrowUpDown className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="truncate">{t(activeSort.labelKey)}</span></span>
            {activeSort.direction === "desc" ? <ArrowDown className="h-4 w-4 shrink-0 text-primary" /> : <ArrowUp className="h-4 w-4 shrink-0 text-primary" />}
          </summary>
          <div className="absolute right-0 top-12 z-20 w-full min-w-64 rounded-xl border border-border bg-card p-1.5 shadow-xl">
            {SORT_OPTIONS.map((option) => <button
              key={option.value}
              type="button"
              onClick={() => { setSort(option.value); sortMenuRef.current?.removeAttribute("open"); }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent"
            >
              {option.direction === "desc" ? <ArrowDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ArrowUp className="h-4 w-4 shrink-0 text-muted-foreground" />}
              <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{t(option.labelKey)}</span><span className="block text-xs text-muted-foreground">{t(option.directionKey)}</span></span>
              {sort === option.value && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>)}
          </div>
        </details>
      </div>
      {error && <p className="mb-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      {loading ? <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2"><Card className="h-36 animate-pulse bg-muted/50" /><Card className="h-36 animate-pulse bg-muted/50" /></div> : sets.length === 0 ? <Card className="border-dashed p-10 text-center"><div className="mx-auto mb-4 text-4xl">📚</div><h2 className="font-semibold">{t("emptySets")}</h2><p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{t("emptySetsBody")}</p><Link href="/sets/new" className="mt-5 inline-flex"><Button><Plus className="h-4 w-4" />{t("newSet")}</Button></Link></Card> : <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2">
        {sortedSets.map((set) => {
          const stats = getSetStats(set);
          return <Card key={set.id} className="group relative min-w-0 max-w-full p-5 transition-[border-color,box-shadow] duration-300 hover:border-primary/25 hover:shadow-md hover:shadow-primary/5">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <Link href={`/sets/${set.id}`} className="block min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-2"><h2 className="truncate text-lg font-semibold">{set.title}</h2>{set.is_pinned && <Pin className="h-3.5 w-3.5 shrink-0 fill-current text-primary" aria-label={t("pinned")} />}</div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{set.description || "No description"}</p>
              </Link>
              <div className="flex shrink-0 gap-1">
                <Link href={`/sets/${set.id}/study`} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-primary" title={t("study")}><GraduationCap className="h-4 w-4" /></Link>
                <details className="relative"><summary className="grid h-8 w-8 list-none place-items-center rounded-lg text-muted-foreground hover:bg-accent"><MoreHorizontal className="h-4 w-4" /></summary>
                  <div className="absolute right-0 top-9 z-10 w-40 rounded-xl border border-border bg-card p-1 shadow-xl">
                    <button onClick={() => void togglePin(set)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-accent"><Pin className="h-3.5 w-3.5" />{set.is_pinned ? t("unpin") : t("pin")}</button>
                    <Link href={`/sets/${set.id}/edit`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-accent"><Pencil className="h-3.5 w-3.5" />{t("edit")}</Link>
                    <button onClick={() => void remove(set.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />{t("delete")}</button>
                  </div>
                </details>
              </div>
            </div>
            <SetTags tags={set.tags} className="mt-2.5" />
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>{stats.total} {t("words")}</span><span className="font-semibold text-primary">{stats.progress}%</span></div>
            <ProgressBar value={stats.progress} />
            <div className="mt-3 flex flex-wrap gap-1.5"><Badge tone="success">{stats.learned} {t("learned")}</Badge><Badge tone="warning">{stats.learning} {t("learning")}</Badge></div>
          </Card>;
        })}
      </div>}
    </AppShell>
  );
}

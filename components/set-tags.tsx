"use client";

import { Badge } from "./ui";
import { useI18n } from "@/lib/i18n";
import type { SetTag } from "@/lib/types";

export function SetTags({ tags, className = "" }: { tags: SetTag[]; className?: string }) {
  const { t } = useI18n();
  if (!tags.length) return null;
  return <div className={`flex flex-wrap gap-1.5 ${className}`}>{tags.map((tag) => <Badge key={tag} className="bg-primary/10 text-primary">#{t(`setTag.${tag}`)}</Badge>)}</div>;
}

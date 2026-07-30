"use client";

import Link from "next/link";
import { PenLine, SquareCheckBig } from "lucide-react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button, Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export default function TestHomePage() { const { setId } = useParams<{ setId: string }>(); const { t } = useI18n(); return <AppShell title={t("test")} back={`/sets/${setId}`}><div className="mx-auto max-w-xl"><h2 className="text-2xl font-bold">{t("chooseMode")}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2"><Link href={`/sets/${setId}/test/multiple-choice`}><Card className="group p-5 transition hover:-translate-y-0.5 hover:border-primary"><SquareCheckBig className="h-7 w-7 text-primary" /><h3 className="mt-5 font-semibold">{t("multipleChoice")}</h3><p className="mt-1 text-sm text-muted-foreground">Four English options for each Ukrainian translation.</p><Button variant="secondary" size="sm" className="mt-5">{t("start")}</Button></Card></Link><Link href={`/sets/${setId}/test/written`}><Card className="group p-5 transition hover:-translate-y-0.5 hover:border-primary"><PenLine className="h-7 w-7 text-primary" /><h3 className="mt-5 font-semibold">{t("written")}</h3><p className="mt-1 text-sm text-muted-foreground">Type the exact English term from memory.</p><Button variant="secondary" size="sm" className="mt-5">{t("start")}</Button></Card></Link></div></div></AppShell>; }

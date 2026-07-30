"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, GraduationCap, LineChart, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth-provider";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function AppShell({ children, title, back, action, hideNav = false }: { children: ReactNode; title?: string; back?: string; action?: ReactNode; hideNav?: boolean }) {
  const { user } = useAuth(); const { t } = useI18n(); const pathname = usePathname(); const router = useRouter();
  const nav = [{ href: "/sets", label: t("sets"), icon: BookOpen }, { href: "/sets/study", label: t("study"), icon: GraduationCap }, { href: "/progress", label: t("progress"), icon: LineChart }, { href: "/profile", label: t("profile"), icon: UserRound }];
  return <div className="min-h-screen bg-background">
    <div className="mx-auto flex min-h-screen max-w-6xl">
      {!hideNav && <aside className="hidden w-64 shrink-0 border-r border-border/70 px-5 py-6 lg:block">
        <Link href="/sets" className="mb-10 flex items-center gap-2 px-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><BookOpen className="h-5 w-5" /></span><span className="text-lg font-bold tracking-tight">{t("appName")}</span></Link>
        <nav className="space-y-1">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium", pathname === href || pathname.startsWith(`${href}/`) ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")}><Icon className="h-4 w-4" />{label}</Link>)}</nav>
        {user && <div className="mt-auto pt-10"><Link href="/profile" className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3"><Avatar user={user} /><span className="min-w-0"><span className="block truncate text-sm font-semibold">{user.displayName || user.email}</span><span className="block truncate text-xs text-muted-foreground">{user.email}</span></span></Link></div>}
      </aside>}
      <div className="min-w-0 flex-1">
        {(title || back) && <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-4xl items-center gap-3 px-4 sm:px-8">{back && <button onClick={() => router.push(back)} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent" aria-label={t("back")}>←</button>}<h1 className="min-w-0 flex-1 truncate text-base font-bold tracking-tight">{title}</h1>{action}</div></header>}
        <main className={cn("mx-auto max-w-4xl px-4 pb-28 pt-6 sm:px-8", hideNav && "pb-8")}>{children}</main>
      </div>
    </div>
    {!hideNav && <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden"><div className="mx-auto grid max-w-lg grid-cols-4 pb-[env(safe-area-inset-bottom)]">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px]", pathname === href || pathname.startsWith(`${href}/`) ? "text-primary" : "text-muted-foreground")}><Icon className="h-5 w-5" />{label}</Link>)}</div></nav>}
  </div>;
}

function Avatar({ user }: { user: { displayName: string | null; email: string | null; avatarUrl: string | null } }) {
  if (user.avatarUrl) {
    // Avatar URLs are supplied by the authenticated Nhost user profile.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />;
  }
  return <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">{(user.displayName || user.email || "P").slice(0, 1).toUpperCase()}</span>;
}
export { Avatar };

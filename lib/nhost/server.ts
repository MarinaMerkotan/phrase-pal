import { createServerClient, type NhostClient } from "@nhost/nhost-js";
import { DEFAULT_SESSION_KEY, type Session } from "@nhost/nhost-js/session";
import { cookies } from "next/headers";

export async function createNhostServerClient(): Promise<NhostClient> {
  const cookieStore = await cookies();
  return createServerClient({
    subdomain: process.env.NHOST_SUBDOMAIN ?? process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN ?? "local",
    region: process.env.NHOST_REGION ?? process.env.NEXT_PUBLIC_NHOST_REGION ?? "local",
    storage: {
      get: (): Session | null => {
        const raw = cookieStore.get(DEFAULT_SESSION_KEY)?.value;
        return raw ? (JSON.parse(raw) as Session) : null;
      },
      set: (session: Session) => cookieStore.set(DEFAULT_SESSION_KEY, JSON.stringify(session), { path: "/", sameSite: "lax" }),
      remove: () => cookieStore.delete(DEFAULT_SESSION_KEY),
    },
  });
}

"use client";

import { createClient } from "@nhost/nhost-js";
import { CookieStorage } from "@nhost/nhost-js/session";

const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN ?? process.env.NHOST_SUBDOMAIN ?? "local";
const region = process.env.NEXT_PUBLIC_NHOST_REGION ?? process.env.NHOST_REGION ?? "local";

const browserStorage = typeof document !== "undefined" ? new CookieStorage({ secure: process.env.NODE_ENV === "production" }) : undefined;

export const nhost = createClient({
  subdomain,
  region,
  authUrl: process.env.NEXT_PUBLIC_NHOST_AUTH_URL,
  graphqlUrl: process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL,
  ...(browserStorage ? { storage: browserStorage } : {}),
});

export const hasNhostConfig = Boolean(process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN && process.env.NEXT_PUBLIC_NHOST_REGION);

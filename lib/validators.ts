import { z } from "zod";

export const setSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

export const cardSchema = z.object({
  term: z.string().trim().min(1, "English term is required").max(180),
  translation: z.string().trim().min(1, "Translation is required").max(300),
});

export const importCardSchema = z.object({ term: z.string().trim().min(1), translation: z.string().trim().min(1) });
export const importArraySchema = z.array(importCardSchema);

export type ImportRow = { id: string; term: string; translation: string; state: "valid" | "invalid" | "duplicate"; selected: boolean };

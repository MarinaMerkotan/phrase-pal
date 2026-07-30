"use client";

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" | "lg" }>(function Button({ className, variant = "primary", size = "md", ...props }, ref) {
  return <button ref={ref} className={cn("inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50", size === "sm" ? "h-9 px-3 text-xs" : size === "lg" ? "h-12 px-5 text-sm" : "h-10 px-4 text-sm", variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90", variant === "secondary" && "border border-border bg-card text-foreground hover:bg-accent", variant === "ghost" && "text-muted-foreground hover:bg-accent hover:text-foreground", variant === "danger" && "bg-destructive text-destructive-foreground hover:bg-destructive/90", className)} {...props} />;
});

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn("h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn("min-h-28 w-full resize-y rounded-xl border border-input bg-background/60 px-3.5 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20", className)} {...props} />;
});

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("rounded-2xl border border-border/70 bg-card shadow-sm", className)} {...props} />; }
export function Badge({ className, tone = "neutral", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "success" | "warning" }) { return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold", tone === "success" && "bg-success/15 text-success", tone === "warning" && "bg-warning/15 text-warning", tone === "neutral" && "bg-muted text-muted-foreground", className)} {...props} />; }
export function ProgressBar({ value }: { value: number }) { return <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>; }

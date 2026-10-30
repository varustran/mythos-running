import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "teal";
type Size = "sm" | "md" | "lg";

export function buttonStyles(variant: Variant = "primary", size: Size = "md", className?: string) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-offset-4";
  const sizes: Record<Size, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };
  const variants: Record<Variant, string> = {
    primary:
      "bg-accent text-white shadow-[0_8px_24px_-12px_rgb(var(--accent)/0.9)] hover:bg-accent/90 dark:text-[#04101F]",
    secondary:
      "border border-line bg-surface text-ink hover:border-accent/60 hover:text-accent",
    ghost: "text-muted hover:bg-elevated hover:text-ink",
    teal: "bg-teal text-[#04101F] hover:bg-teal/90",
  };
  return cn(base, sizes[size], variants[variant], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonStyles(variant, size, className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonStyles(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}

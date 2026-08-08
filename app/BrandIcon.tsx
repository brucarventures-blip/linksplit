import type { SVGProps } from "react";

type BrandIconProps = SVGProps<SVGSVGElement> & {
  accent?: string;
  title?: string;
};

export default function LinkSplitBrandIcon({ accent = "#d2ad5c", title, ...props }: BrandIconProps) {
  const accessibility = title
    ? { role: "img" as const, "aria-label": title }
    : { "aria-hidden": true as const };

  return (
    <svg viewBox="0 0 64 64" fill="none" {...accessibility} {...props}>
      <path d="M10 32h14" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      <path d="M24 32c9 0 11-10 20-16l6-4" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 32c9 0 11 10 20 16l6 4" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="51" cy="52" r="5" fill={accent} />
    </svg>
  );
}

import type { SVGProps } from "react";

type BrandIconProps = SVGProps<SVGSVGElement> & {
  accent?: string;
  title?: string;
};

export default function LinkSplitBrandIcon({ title, ...props }: BrandIconProps) {
  const accessibility = title
    ? { role: "img" as const, "aria-label": title }
    : { "aria-hidden": true as const };

  return (
    <svg viewBox="0 0 64 64" fill="none" {...accessibility} {...props}>
      <path fill="#efe7da" fillRule="evenodd" d="M8 6h27.5L50 19.2 39.6 29.7 53 42.8 37.4 58H8V6Zm13 10.5v10h12.3l5.2-5-5.2-5H21Zm0 20.8v10.2h13.1l5.5-5.2-5.5-5H21Z" />
      <path d="M11 52 50.5 12" stroke="#c4512f" strokeWidth="4" strokeLinecap="square" />
      <rect x="8.5" y="49.5" width="6" height="6" rx="1" fill="#d2ad5c" />
      <rect x="47.5" y="8.5" width="6" height="6" rx="1" fill="#78927e" />
    </svg>
  );
}

import Image from "next/image";
import { STORE } from "@/lib/utils";

type Size = "header" | "hero" | "footer" | "auth";

const SIZE: Record<Size, { width: number; height: number; className: string }> = {
  header: { width: 96, height: 128, className: "h-14 w-auto max-h-14" },
  hero: { width: 220, height: 293, className: "h-44 sm:h-52 w-auto" },
  footer: { width: 140, height: 187, className: "h-24 w-auto" },
  auth: { width: 160, height: 213, className: "h-32 w-auto mx-auto" },
};

export function BrandLogo({
  size = "header",
  priority = false,
  className = "",
}: {
  size?: Size;
  priority?: boolean;
  className?: string;
}) {
  const s = SIZE[size];
  return (
    <Image
      src={STORE.logo}
      alt="OM SHREE logo — Unique Jewellery, Unique Products"
      width={s.width}
      height={s.height}
      priority={priority}
      unoptimized
      className={`${s.className} rounded-md object-contain ${className}`.trim()}
    />
  );
}

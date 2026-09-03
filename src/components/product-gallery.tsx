"use client";

import Image from "next/image";
import { useState } from "react";
import { optimizedImage } from "@/lib/images";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const list = images.length ? images : ["/placeholder-jewellery.svg"];
  const unique = [...new Set(list)];
  const [active, setActive] = useState(0);
  const src = optimizedImage(unique[Math.min(active, unique.length - 1)]);
  const showThumbs = unique.length > 1;

  return (
    <div className="grid gap-3">
      <div className="rounded-3xl bg-white border border-gold/20 shadow-lg p-2 sm:p-3">
        <Image
          src={src}
          alt={name}
          width={1200}
          height={1600}
          priority
          className="w-full h-auto object-contain"
          sizes="(max-width:1024px) 100vw, 50vw"
        />
      </div>
      {showThumbs ? (
        <div className="grid grid-cols-4 gap-2">
          {unique.slice(0, 8).map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-square rounded-xl overflow-hidden border bg-white ${
                i === active ? "border-crimson ring-2 ring-gold/40" : "border-crimson/10"
              }`}
            >
              <Image src={optimizedImage(img)} alt="" fill className="object-contain p-1" sizes="120px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

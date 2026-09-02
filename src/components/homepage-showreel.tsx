"use client";

import { STORE } from "@/lib/utils";
import { homepageVideoKind, vimeoId, youtubeId } from "@/lib/video";

export function HomepageShowreel({ src }: { src: string }) {
  if (!src) return null;
  const kind = homepageVideoKind(src);
  const yt = youtubeId(src);
  const vm = vimeoId(src);

  return (
    <section className="relative mt-16 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.16),transparent_62%)]" />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="text-center mb-7">
          <p className="text-gold tracking-[0.38em] text-[11px]">THE ATELIER FILM</p>
          <h2 className="font-display text-4xl sm:text-5xl text-wine mt-2">One glimpse. Pure gold.</h2>
          <p className="mt-2 text-sm text-zinc-500">{STORE.name} · Unique jewellery, unique products</p>
        </div>

        <div className="relative rounded-[1.75rem] p-[1px] bg-gradient-to-br from-gold via-crimson/50 to-wine shadow-[0_24px_80px_rgba(92,10,24,0.28)]">
          <div className="relative overflow-hidden rounded-[1.7rem] bg-wine aspect-video">
            {kind === "youtube" && yt ? (
              <iframe
                title={`${STORE.name} showreel`}
                src={`https://www.youtube.com/embed/${yt}?autoplay=1&mute=1&loop=1&playlist=${yt}&controls=0&modestbranding=1&rel=0&playsinline=1`}
                allow="autoplay; encrypted-media; picture-in-picture"
                className="absolute inset-0 h-full w-full"
              />
            ) : kind === "vimeo" && vm ? (
              <iframe
                title={`${STORE.name} showreel`}
                src={`https://player.vimeo.com/video/${vm}?autoplay=1&muted=1&loop=1&background=1`}
                allow="autoplay; fullscreen"
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <video
                src={src}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              >
                Your browser does not support this jewellery film.
              </video>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-wine/55 via-transparent to-wine/20" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-7">
              <div className="max-w-md rounded-2xl bg-black/25 backdrop-blur-md border border-gold/30 px-4 py-3 text-white">
                <p className="text-[10px] tracking-[0.3em] text-gold">OM SHREE</p>
                <p className="font-display text-xl leading-tight mt-1">Crafted to be worn. Filmed to be felt.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

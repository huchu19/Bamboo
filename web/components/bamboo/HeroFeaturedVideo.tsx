'use client';

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { BambooLeaf } from "./BambooIcons";
import { getPitch } from "@/lib/mock-pitches";

export function HeroFeaturedVideo() {
  const pitch = getPitch("edunexus");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [canPlay, setCanPlay] = useState(false);

  const hasVideo = !!pitch?.videoUrl;

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div className="relative aspect-[9/16] bg-[color:var(--ink)] rounded-[1.5rem] overflow-hidden group">
      {hasVideo ? (
        <video
          ref={videoRef}
          src={pitch!.videoUrl}
          poster={pitch!.posterUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setCanPlay(true)}
          className="absolute inset-0 size-full object-cover opacity-90"
        />
      ) : (
        <Image
          src="/featured-pitch.jpg"
          alt="EduNexus — featured pitch"
          fill
          className="object-cover opacity-70"
          sizes="(min-width: 1024px) 40vw, 100vw"
          priority
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      <div className="absolute bottom-8 left-8 right-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-[color:var(--gold)] text-[color:var(--gold-foreground)] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter flex items-center gap-1">
            <BambooLeaf size={10} /> Root-Verified
          </span>
          <span className="text-white/60 text-[10px] font-mono uppercase">EdTech</span>
        </div>
        <h2 className="text-white text-2xl font-display uppercase leading-tight tracking-tight">
          EduNexus: AI-Powered Adaptive Learning
        </h2>
        <div className="flex justify-between items-end mt-6">
          <div className="text-white">
            <p className="text-[10px] uppercase opacity-60 font-mono tracking-widest">Seeking</p>
            <p className="text-xl font-bold font-mono text-[color:var(--gold)]">$2.3M</p>
          </div>
          {hasVideo ? (
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute pitch" : "Mute pitch"}
              className="bg-white/10 hover:bg-[color:var(--gold)] backdrop-blur-md size-12 rounded-full flex items-center justify-center transition-all cursor-pointer"
            >
              <span className="text-white text-sm">{muted ? "🔇" : "🔊"}</span>
            </button>
          ) : (
            <Link
              href="/discover/edunexus"
              aria-label="Play pitch video"
              className="bg-white/10 hover:bg-[color:var(--gold)] backdrop-blur-md size-12 rounded-full flex items-center justify-center transition-all cursor-pointer"
            >
              <span className="text-white translate-x-0.5">▶</span>
            </Link>
          )}
        </div>
      </div>

      <div className="absolute top-0 left-0 h-1 bg-[color:var(--gold)] w-[62%]" />

      {hasVideo && !canPlay && (
        <div className="absolute top-3 right-3 text-[9px] font-mono uppercase tracking-widest text-white/50">
          Loading…
        </div>
      )}
    </div>
  );
}

"use client";

import { memo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const InteractiveRingComponent = () => {
  const [rotation, setRotation] = useState({ x: 12, y: -18 });

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const xRatio = (event.clientX - bounds.left) / bounds.width;
      const yRatio = (event.clientY - bounds.top) / bounds.height;

      const rotateY = clamp((xRatio - 0.5) * 60, -30, 30);
      const rotateX = clamp((0.5 - yRatio) * 40, -20, 20);

      setRotation({ x: rotateX, y: rotateY });
    },
    [],
  );

  const resetRotation = useCallback(() => {
    setRotation({ x: 12, y: -18 });
  }, []);

  return (
    <Card
      className={cn(
        "relative flex h-full min-h-[420px] flex-col justify-between overflow-hidden rounded-[3rem] border border-brand-gold/40 bg-white/70 p-10 shadow-[0_35px_80px_rgba(74,43,40,0.18)] backdrop-blur-sm",
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetRotation}
    >
      <motion.div
        aria-hidden
        initial={{ backgroundPosition: "0% 50%" }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(223,160,83,0.35) 0%, rgba(75,146,134,0.35) 40%, rgba(223,160,83,0.35) 100%)",
        }}
      />

      <div className="relative flex flex-col gap-6 text-center">
        <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-brand-umber/15 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.45em] text-brand-umber/70">
          <Sparkles className="h-4 w-4 text-brand-gold" />
          Immersive
        </span>
        <h3 className="font-heading text-3xl text-brand-umber">
          360° Atelier Orbit
        </h3>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-brand-umber/75">
          Explore every facet like a curator. Tilt, orbit, and bask in the glow
          of handcrafted metals and jewel tones suspended in mid-air.
        </p>
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        <motion.div
          style={{
            transform: `perspective(900px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          }}
          className="relative h-48 w-48"
          transition={{ type: "spring", stiffness: 120, damping: 14, mass: 0.6 }}
        >
          <div className="absolute inset-0 rounded-full border-[14px] border-brand-gold bg-gradient-to-br from-brand-beige via-white to-brand-gold shadow-[0_18px_36px_rgba(74,43,40,0.25)]" />
          <div className="absolute inset-4 rounded-full border-[8px] border-brand-teal/45 blur-[1px]" />
          <div className="absolute inset-0 animate-[pulse_6s_ease-in-out_infinite] rounded-full bg-gradient-to-tr from-brand-gold/30 via-transparent to-transparent" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/50 via-transparent to-brand-umber/15" />
        </motion.div>
      </div>

      <div className="relative mt-8 rounded-2xl border border-brand-umber/10 bg-white/80 px-6 py-4 text-sm text-brand-umber/70">
        <p>3° 360 degrees of motion-tracked detailing. Rotate to reveal the hammered edges and inlaid gems.</p>
      </div>
    </Card>
  );
};

export const InteractiveRing = memo(InteractiveRingComponent);

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Anchor, Btn, EASE, MaskedLines, Photo, Reveal, SectionLabel } from "./primitives";
import { COMPANY, HERO_FACTS, INDIAMART_URL } from "../data/site";
import { cn } from "../lib/utils";

const GridLayer = () => {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 120]);

  return (
    <motion.div
      ref={ref}
      className="absolute inset-0 blueprint opacity-40 pointer-events-none"
      aria-hidden="true"
      style={{ y }}
    />
  );
};

const Coords = () => (
  <div className="hidden absolute right-0 bottom-0 -translate-y-1/2 flex items-center gap-3 rounded-l-lg border border-border bg-background/80 px-4 py-2 backdrop-blur sm:flex" data-testid="hero-coords" aria-label="Company coordinates">
    <MapPin className="h-3.5 w-3.5 text-aqua" aria-hidden="true" />
    <span className="label !text-[0.65rem] font-mono tabular-nums">24°32'N 81°18'E</span>
  </div>
);

const Badge = () => (
  <div className="hidden absolute left-0 bottom-0 -translate-y-1/2 flex items-center gap-2 rounded-r-lg border border-border bg-background/80 px-4 py-2 backdrop-blur sm:flex" data-testid="hero-badge">
    <span className="label !text-[0.65rem] text-muted-foreground">Rewa, Madhya Pradesh</span>
    <span className="h-5 w-px bg-border" aria-hidden="true" />
    <span className="label !text-[0.65rem] text-aqua">IndiaMART TrustSEAL</span>
  </div>
);

// Circular engineering outline SVG
const EngineeringOutline = () => (
  <svg
    className="absolute inset-0 pointer-events-none"
    viewBox="0 0 400 500"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      <clipPath id="hero-frame-clip">
        <path d="M0 80 Q0 0 80 0 L320 0 Q400 0 400 80 L400 500 L0 500 Z" />
      </clipPath>
    </defs>
    {/* Large rounded-top architectural frame */}
    <rect
      x="0"
      y="80"
      width="400"
      height="420"
      rx="0"
      ry="0"
      fill="none"
      stroke="hsl(var(--aqua) / 0.3)"
      strokeWidth="1.5"
      className="frame-border"
    />
    {/* Top rounded corners */}
    <path
      d="M0 80 Q0 0 80 0 L320 0 Q400 0 400 80"
      fill="none"
      stroke="hsl(var(--aqua) / 0.5)"
      strokeWidth="2"
      className="frame-top"
    />
    {/* Circular engineering outline - center */}
    <circle
      cx="200"
      cy="290"
      r="120"
      fill="none"
      stroke="hsl(var(--aqua) / 0.2)"
      strokeWidth="1"
      strokeDasharray="8 12"
      className="engineering-circle"
    />
    {/* Inner circle */}
    <circle
      cx="200"
      cy="290"
      r="80"
      fill="none"
      stroke="hsl(var(--aqua) / 0.15)"
      strokeWidth="0.5"
      className="engineering-circle-inner"
    />
    {/* Crosshair lines */}
    <line x1="200" y1="170" x2="200" y2="410" stroke="hsl(var(--aqua) / 0.1)" strokeWidth="0.5" />
    <line x1="80" y1="290" x2="320" y2="290" stroke="hsl(var(--aqua) / 0.1)" strokeWidth="0.5" />
    {/* Angle markers */}
    {[
      { angle: 0, r: 120 },
      { angle: 45, r: 120 },
      { angle: 90, r: 120 },
      { angle: 135, r: 120 },
      { angle: 180, r: 120 },
      { angle: 225, r: 120 },
      { angle: 270, r: 120 },
      { angle: 315, r: 120 },
    ].map((m) => (
      <line
        key={m.angle}
        x1={200 + Math.cos((m.angle * Math.PI) / 180) * 110}
        y1={290 + Math.sin((m.angle * Math.PI) / 180) * 110}
        x2={200 + Math.cos((m.angle * Math.PI) / 180) * 120}
        y2={290 + Math.sin((m.angle * Math.PI) / 180) * 120}
        stroke="hsl(var(--aqua) / 0.3)"
        strokeWidth="1"
      />
    ))}
    {/* Dimension lines - horizontal */}
    <g className="dimension-lines">
      <line x1="60" y1="460" x2="340" y2="460" stroke="hsl(var(--aqua) / 0.4)" strokeWidth="1" />
      <line x1="60" y1="455" x2="60" y2="465" stroke="hsl(var(--aqua) / 0.4)" strokeWidth="1" />
      <line x1="340" y1="455" x2="340" y2="465" stroke="hsl(var(--aqua) / 0.4)" strokeWidth="1" />
    </g>
  </svg>
);

// Technical annotations overlay
const TechnicalAnnotations = () => (
  <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
    {/* FIG. 01 annotation */}
    <div className="absolute top-4 left-4">
      <div className="flex items-center gap-1.5 bg-background/90 backdrop-blur px-3 py-1.5 rounded border border-aqua/30">
        <span className="label text-aqua font-mono">FIG. 01</span>
        <span className="label text-muted-foreground font-mono tracking-wider">FRP FLUME</span>
      </div>
    </div>
    {/* PLAN VIEW annotation */}
    <div className="absolute top-4 right-4">
      <div className="flex items-center gap-1.5 bg-background/90 backdrop-blur px-3 py-1.5 rounded border border-aqua/30">
        <span className="label text-muted-foreground font-mono">PLAN VIEW</span>
      </div>
    </div>
    {/* Scale bar */}
    <div className="absolute bottom-4 left-4">
      <div className="flex items-end gap-2">
        <div className="flex items-center gap-1 h-6 bg-background/90 backdrop-blur px-2 border border-aqua/30">
          <span className="label text-aqua font-mono">SCALE</span>
          <span className="label text-muted-foreground font-mono">1:50</span>
        </div>
        <div className="h-1.5 w-24 bg-aqua/30 rounded" />
      </div>
    </div>
    {/* Right side vertical annotations */}
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3">
      <div className="bg-background/90 backdrop-blur px-2 py-1.5 rounded border-l-2 border-aqua text-right">
        <span className="label text-aqua block font-mono">SECTION A-A</span>
        <span className="text-[0.55rem] text-muted-foreground font-mono">FLUME PROFILE</span>
      </div>
      <div className="bg-background/90 backdrop-blur px-2 py-1.5 rounded border-l-2 border-aqua text-right">
        <span className="label text-aqua block font-mono">DETAIL B</span>
        <span className="text-[0.55rem] text-muted-foreground font-mono">JOINT DETAIL</span>
      </div>
    </div>
    {/* Bottom center project info */}
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
      <div className="bg-background/90 backdrop-blur px-3 py-1.5 rounded border border-aqua/30 text-center">
        <span className="label text-muted-foreground font-mono block">GREEN TOUCH ENGINEERING</span>
        <span className="label text-aqua font-mono">REWA, MADHYA PRADESH</span>
      </div>
    </div>
  </div>
);

export const Hero = () => {
  const reduce = useReducedMotion();

  return (
    <section id="home" data-testid="hero-section" className="relative min-h-screen flex items-center overflow-hidden">
      <GridLayer />
      <Coords />
      <Badge />

      <div className="container-x relative pt-[100px] pb-20 lg:pt-[140px] lg:pb-28">
        <div className="grid gap-x-12 gap-y-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal data-testid="hero-content">
              <h1 className="display h-section">
                <MaskedLines lines={["Engineering Water", "Experiences", <>That <em className="italic text-aqua">Last.</em></>]} />
              </h1>
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Precision-engineered water parks, competition swimming pools, dynamic wave systems, and industrial water filtration across India from Rewa, Madhya Pradesh.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="mt-12 flex flex-wrap items-center gap-4" data-testid="hero-cta-group">
              <Btn to="solutions" data-testid="hero-explore-solutions-button">Explore Solutions</Btn>
              <Btn to="enquiry" variant="outline" data-testid="hero-get-in-touch-button">Get In Touch</Btn>
            </Reveal>

            <Reveal delay={0.15} className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-6" data-testid="hero-facts">
              {HERO_FACTS.map((f) => (
                <div key={f.k} className="flex items-center gap-3">
                  <span className="label !text-[0.65rem] text-aqua">{f.k}</span>
                  <span className="text-sm font-medium text-muted-foreground">{f.v}</span>
                </div>
              ))}
            </Reveal>

            <Reveal delay={0.2} className="mt-12" data-testid="hero-indiamart-link">
              <Anchor
                to="reviews"
                className="inline-flex items-center gap-2 text-sm underline underline-offset-4 transition-colors duration-300 hover:text-aqua"
              >
                View verified IndiaMART ratings &rarr;
              </Anchor>
            </Reveal>
          </div>

          <div className="relative lg:col-span-5 lg:col-start-8">
            <Reveal className="relative">
              {/* Main image with architectural frame */}
              <div className="relative aspect-[4/5] overflow-hidden">
                {/* Clip path for rounded-top frame */}
                <div className="absolute inset-0" style={{ clipPath: "polygon(0 16%, 0 100%, 100% 100%, 100% 16%, 100% 0, 84% 0, 16% 0, 0 0)" }}>
                  <Photo src="/images/funnel.jpg" alt="FRP Aqua Funnel water slide - technical view" className="scale-105" />
                </div>
                {/* Engineering outline overlay */}
                <EngineeringOutline />
                {/* Technical annotations */}
                <TechnicalAnnotations />
              </div>
              {/* Fig. 01 label on the side */}
              <p className="label absolute -right-3 top-1/2 -translate-y-1/2 origin-center rotate-90 !text-[0.65rem] text-muted-foreground max-xl:hidden">
                FIG. 01 — FRP FLUME — PLAN VIEW
              </p>
            </Reveal>
            <p className="mt-6 text-right text-xs text-muted-foreground">Catalogue image from the company's IndiaMART listing</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Marquee = ({ items }) => (
  <section data-testid="marquee-section" aria-hidden="true" className="surface-dark border-y border-border overflow-hidden py-8 lg:py-12">
    <div className="marquee-track flex items-center whitespace-nowrap h-full">
      {items.map((item, i) => (
        <span key={i} className="flex items-center whitespace-nowrap px-6">
          <span className={`display marquee-text font-medium tracking-tight text-foreground ${i % 2 === 1 ? 'italic text-aqua' : ''}`}>{item}</span>
          <span className="text-bronze/70 shrink-0 ml-10" aria-hidden="true">◆</span>
        </span>
      ))}
      {items.map((item, i) => (
        <span key={i + items.length} className="flex items-center whitespace-nowrap px-6">
          <span className={`display marquee-text font-medium tracking-tight text-foreground ${i % 2 === 1 ? 'italic text-aqua' : ''}`}>{item}</span>
          <span className="text-bronze/70 shrink-0 ml-10" aria-hidden="true">◆</span>
        </span>
      ))}
    </div>
  </section>
);
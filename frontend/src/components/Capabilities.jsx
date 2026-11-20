import { Corners, MaskedLines, Reveal, SectionLabel } from "./primitives";
import { CAPABILITIES } from "../data/site";
import { cn } from "../lib/utils";

const NODES = [
  { x: 20, y: 30, w: 150, label: "POOL / BASIN" },
  { x: 250, y: 30, w: 130, label: "COLLECTION" },
  { x: 250, y: 130, w: 130, label: "PUMPING" },
  { x: 135, y: 130, w: 95, label: "FILTRATION" },
  { x: 20, y: 130, w: 95, label: "TREATMENT" },
];

const LoopDiagram = () => (
  <figure className="mt-8">
    <svg viewBox="0 0 400 190" className="w-full text-aqua" fill="none" stroke="currentColor" strokeWidth="1" role="img" aria-label="Conceptual schematic of a water recirculation loop">
      <path className="flow-line" d="M170 50h80M315 70v60M250 150h-20M135 150h-20M68 130V70" />
      {NODES.map((n) => (
        <g key={n.label}>
          <rect x={n.x} y={n.y} width={n.w} height="40" rx="3" />
          <text x={n.x + n.w / 2} y={n.y + 24} textAnchor="middle" fill="currentColor" stroke="none" fontSize="9" fontFamily="JetBrains Mono, monospace" letterSpacing="0.6">{n.label}</text>
        </g>
      ))}
      <path d="M30 42c8-5 16 5 24 0s16 5 24 0 16 5 24 0 16 5 24 0 16 5 24 0" opacity="0.5" />
    </svg>
    <figcaption className="mt-3 text-xs text-muted-foreground">Conceptual schematic for illustration. Not a design drawing.</figcaption>
  </figure>
);

const AREA = {
  a: "lg:col-span-2 lg:row-span-2",
  b: "lg:col-span-2",
  c: "lg:col-span-1",
  d: "lg:col-span-1",
  e: "lg:col-span-2",
  f: "lg:col-span-2",
};

export const Capabilities = () => (
  <section id="capabilities" data-testid="capabilities-section" className="section-y">
    <div className="container-x">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <SectionLabel index="06">Technical Capabilities</SectionLabel>
          <h2 className="display h-section mt-8">
            <MaskedLines lines={["Systems thinking,", <>from basin to <em className="italic text-aqua">filter.</em></>]} />
          </h2>
        </div>
        <Reveal className="text-base leading-relaxed text-muted-foreground lg:col-span-4">
          The company's work, organised into six capability areas. Project-specific details and specifications are
          provided on enquiry.
        </Reveal>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-fr">
        {CAPABILITIES.map((c, i) => (
          <Reveal
            key={c.code}
            delay={(i % 4) * 0.07}
            data-testid={`capability-card-${c.code}`}
            className={cn("group relative flex flex-col rounded-md border border-border bg-card p-6 transition-colors duration-500 hover:border-aqua/60 sm:p-8",
              c.diagram && "blueprint sm:col-span-2", AREA[c.area])}
          >
            <Corners className="inset-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <p className="label flex justify-between text-muted-foreground"><span className="text-aqua">{c.code}</span><span>Capability</span></p>
            <h3 className={cn("display mt-6", c.diagram ? "text-4xl sm:text-5xl" : "text-3xl")}>{c.title}</h3>
            <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {c.items.map((it) => (
                <li key={it} className="flex gap-3">
                  <span className="mt-[0.7em] h-px w-4 shrink-0 bg-aqua" aria-hidden="true" />
                  {it}
                </li>
              ))}
            </ul>
            {c.diagram && <div className="mt-auto"><LoopDiagram /></div>}
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
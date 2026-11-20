import { ArrowUpRight } from "lucide-react";
import { MaskedLines, Photo, Reveal, SectionLabel, Tilt } from "./primitives";
import { SERVICES } from "../data/site";
import { cn } from "../lib/utils";

const FilterDiagram = () => (
  <svg viewBox="0 0 320 200" className="h-full w-full text-aqua" fill="none" stroke="currentColor" strokeWidth="1.2" role="img" aria-label="Conceptual line drawing of a filter vessel">
    <path d="M110 60c0-22 100-22 100 0v80c0 22-100 22-100 0z" />
    <path d="M110 60c0 14 100 14 100 0M110 140c0 14 100 14 100 0" opacity="0.5" />
    <path d="M160 43V26m-10 0h20" />
    <path className="flow-line" d="M20 80h90M210 120h90" />
    <path d="M210 80h36v40h-36M246 100h20" opacity="0.7" />
    <circle cx="20" cy="80" r="3" /><circle cx="300" cy="120" r="3" />
    <g className="label" fill="currentColor" stroke="none" fontSize="9">
      <text x="14" y="70">INLET</text><text x="262" y="138">RETURN</text><text x="135" y="104">MEDIA</text>
    </g>
  </svg>
);

const Enquire = ({ onClick, id, light }) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={`service-enquire-${id}`}
    className={cn("group/btn mt-6 inline-flex items-center gap-2 border-b pb-1 text-sm font-medium transition-colors duration-300",
      light ? "border-[#F3F1E9]/40 hover:border-[#F3F1E9]" : "border-foreground/30 hover:border-aqua hover:text-aqua")}
  >
    Enquire about this service
    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
  </button>
);

const Head = ({ s, light }) => (
  <p className={cn("label flex items-center justify-between gap-3", light ? "text-[#F3F1E9]/80" : "text-muted-foreground")}>
    <span>{s.code}</span><span>{s.tag}</span>
  </p>
);

const OverlayCard = ({ s, onEnquire }) => (
  <article className="group relative flex h-full min-h-[26rem] flex-col justify-between overflow-hidden rounded-md p-6 text-[#F3F1E9] sm:p-8">
    <Photo src={s.image} alt="" className="absolute inset-0 transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#151916] via-[#151916]/45 to-[#151916]/30" aria-hidden="true" />
    <div className="relative"><Head s={s} light /></div>
    <div className="relative max-w-lg">
      <h3 className="display text-[clamp(2rem,3.4vw,3.5rem)]">{s.title}</h3>
      <p className="mt-4 text-sm leading-relaxed text-[#F3F1E9]/85 sm:text-base">{s.desc}</p>
      <Enquire onClick={onEnquire} id={s.code} light />
    </div>
  </article>
);

const StackCard = ({ s, onEnquire, diagram }) => (
  <article className="group flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
    <div className={cn("relative aspect-[16/10] overflow-hidden", diagram && "blueprint border-b border-border p-6")}>
      {diagram ? <FilterDiagram /> : <Photo src={s.image} alt="" className="transition-transform duration-[1200ms] ease-out group-hover:scale-105" />}
    </div>
    <div className="flex flex-1 flex-col p-6 sm:p-7">
      <Head s={s} />
      <h3 className="display mt-5 text-3xl sm:text-[2.1rem]">{s.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{s.desc}</p>
      <div className="mt-auto"><Enquire onClick={onEnquire} id={s.code} /></div>
    </div>
  </article>
);

const WideCard = ({ s, onEnquire }) => (
  <article className="group grid h-full overflow-hidden rounded-md border border-border bg-card md:grid-cols-2">
    <div className="flex flex-col justify-between gap-10 p-6 sm:p-10">
      <Head s={s} />
      <div>
        <h3 className="display text-[clamp(2rem,3.4vw,3.5rem)]">{s.title}</h3>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">{s.desc}</p>
        <Enquire onClick={onEnquire} id={s.code} />
      </div>
    </div>
    <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[22rem]">
      <Photo src={s.image} alt="" className="absolute inset-0 transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
    </div>
  </article>
);

const LAYOUT = [
  { C: OverlayCard, span: "lg:col-span-7" },
  { C: StackCard, span: "lg:col-span-5" },
  { C: StackCard, span: "md:col-span-1 lg:col-span-4" },
  { C: StackCard, span: "md:col-span-1 lg:col-span-4", diagram: true },
  { C: StackCard, span: "md:col-span-2 lg:col-span-4" },
  { C: WideCard, span: "md:col-span-2 lg:col-span-12" },
];

export const Services = ({ onEnquire }) => (
  <section id="services" data-testid="services-section" className="section-y border-t border-border">
    <div className="container-x">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <SectionLabel index="03">Our Services</SectionLabel>
          <h2 className="display h-section mt-8">
            <MaskedLines lines={["Six disciplines.", <>One <em className="italic text-aqua">engineering</em> focus.</>]} />
          </h2>
        </div>
        <Reveal className="text-base leading-relaxed text-muted-foreground lg:col-span-4">
          Each service covers a part of what a recreational water facility needs, from the basin and the structure to
          the water that runs through it.
        </Reveal>
      </div>

      <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-12">
        {SERVICES.map((s, i) => {
          const { C, span, diagram } = LAYOUT[i];
          return (
            <Reveal key={s.code} delay={(i % 3) * 0.08} className={span} data-testid={`service-card-${s.code}`}>
              <Tilt max={2.5} className="h-full">
                <C s={s} diagram={diagram} onEnquire={() => onEnquire(s.title)} />
              </Tilt>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);
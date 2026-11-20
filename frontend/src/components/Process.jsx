import { useRef } from "react";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { MaskedLines, Reveal, SectionLabel } from "./primitives";
import { PROCESS } from "../data/site";

export const Process = () => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });

  return (
    <section id="process" data-testid="process-section" className="surface-dark section-y relative">
      <div className="blueprint absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="container-x relative grid gap-x-12 gap-y-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionLabel index="05">Our Process</SectionLabel>
            <h2 className="display h-section mt-8">
              <MaskedLines lines={["From first", "conversation", <>to <em className="italic text-aqua">handover.</em></>]} />
            </h2>
            <Reveal className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
              Six stages describe how a requirement typically moves from an idea to a finished installation.
            </Reveal>
            <Reveal delay={0.1} className="mt-6 max-w-md text-xs leading-relaxed text-muted-foreground" data-testid="process-note">
              An indicative workflow. Actual stages are agreed for each project.
            </Reveal>
          </div>
        </div>

        <ol ref={ref} className="relative lg:col-span-6 lg:col-start-7">
          <span className="absolute bottom-0 left-[1.35rem] top-0 w-px bg-border" aria-hidden="true" />
          <motion.span
            aria-hidden="true"
            className="absolute bottom-0 left-[1.35rem] top-0 w-px origin-top bg-aqua"
            style={{ scaleY: reduce ? 1 : scrollYProgress }}
          />
          {PROCESS.map((p, i) => (
            <Reveal as="li" key={p.title} className="relative pb-14 pl-16 last:pb-0 sm:pl-24" data-testid={`process-stage-${i + 1}`}>
              <span className="label absolute left-0 top-0 grid h-11 w-11 place-items-center rounded-full border border-aqua bg-background text-aqua">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="display pt-1 text-3xl sm:text-[2.6rem]">{p.title}</h3>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">{p.desc}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
};
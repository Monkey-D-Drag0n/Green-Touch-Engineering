import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Btn, Corners, MaskedLines, Photo, Reveal, SectionLabel } from "./primitives";
import { IMAGE_NOTE, PROFILE_FACTS } from "../data/site";

export const About = () => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [60, -60]);

  // Filter out IndiaMART certification from profile facts
  const profileFacts = PROFILE_FACTS.filter((f) => f.k !== "IndiaMART certification");

  return (
    <section id="about" ref={ref} data-testid="about-section" className="section-y">
      <div className="container-x grid gap-x-12 gap-y-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <SectionLabel index="02">About Us</SectionLabel>
          <h2 className="display h-section mt-8">
            <MaskedLines lines={["Engineering Water", <>Experiences Into <em className="italic text-aqua">Reality.</em></>]} />
          </h2>
          <Reveal className="mt-10 max-w-xl space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              Green Touch Engineering Private Limited is based in Rewa, Madhya Pradesh, and works on water-based
              recreational infrastructure: water parks, swimming pools, slides and attractions, filtration systems and
              the equipment around them.
            </p>
            <p>
              The company approaches each requirement as an engineering problem first. The aim is infrastructure that
              is planned carefully, built with attention to quality and handed over ready for use.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <Btn to="capabilities" variant="outline" data-testid="about-capabilities-cta">See technical capabilities</Btn>
          </Reveal>

          <Reveal delay={0.15} className="mt-16">
            <dl data-testid="about-profile-facts" className="grid grid-cols-2 border-t border-border sm:grid-cols-3">
              {profileFacts.map((f) => (
                <div key={f.k} className="border-b border-border py-4 pr-4">
                  <dt className="label !text-[0.68rem] text-muted-foreground">{f.k}</dt>
                  <dd className="mt-1 break-words text-sm font-medium">{f.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="relative lg:col-span-5 lg:col-start-8">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md">
              <Photo src="/images/pool.jpg" alt="A free-form swimming pool during construction work" className="scale-105" />
            </div>
            <Corners className="-inset-3" />
            <p className="label absolute -right-3 top-10 origin-top-right translate-x-full rotate-90 !text-[0.65rem] text-muted-foreground max-xl:hidden">
              Fig. 02 — Pool construction work
            </p>
          </Reveal>
          <motion.div style={{ y }} className="absolute -bottom-10 -left-4 w-[46%] overflow-hidden rounded-md border-4 border-background shadow-2xl sm:-left-12">
            <div className="aspect-square">
              <Photo src="/images/add3.jpg" alt="Swimming pool construction" />
            </div>
          </motion.div>
          <p className="mt-6 text-right text-xs text-muted-foreground">{IMAGE_NOTE}s</p>
        </div>
      </div>
    </section>
  );
};
import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { Btn, EASE, MaskedLines, Photo, Reveal, SectionLabel } from "./primitives";
import { IMAGE_NOTE, SOLUTION_FILTERS, SOLUTIONS } from "../data/site";
import { lockScroll } from "../lib/scroll";
import { cn } from "../lib/utils";
import useEmblaCarousel from "embla-carousel-react";

const catLabel = (id) => SOLUTION_FILTERS.find((f) => f.id === id)?.label;

// Helper to get images from a solution (supports both `images` array and `image` field)
const getSolutionImages = (s) => {
  if (s.images && Array.isArray(s.images) && s.images.length > 0) {
    return s.images;
  }
  return s.image ? [s.image] : [];
};

const getFirstImage = (s) => getSolutionImages(s)[0];

const SolutionCard = ({ s, open }) => (
  <motion.li
    layout
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.96 }}
    transition={{ duration: 0.5, ease: EASE }}
  >
    <button
      type="button"
      onClick={() => open(s)}
      data-testid={`solution-card-${s.id}`}
      className="group block w-full text-left"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border">
        <Photo src={getFirstImage(s)} alt={s.title} contain={s.contain} className="transition-transform duration-[1100ms] ease-out group-hover:scale-[1.06]" />
        <span className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-[#151916]/80 text-[#F3F1E9] opacity-0 transition-[opacity,transform] duration-300 group-hover:rotate-90 group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
          <Plus className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="label mt-4 !text-[0.68rem] text-muted-foreground">{catLabel(s.cat)}</p>
      <h3 className="display mt-1.5 text-2xl transition-colors duration-300 group-hover:text-aqua sm:text-[1.75rem]">{s.title}</h3>
    </button>
  </motion.li>
);

export const Solutions = ({ onEnquire }) => {
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState(null);
  const list = SOLUTIONS.filter((s) => filter === "all" || s.cat === filter);

  const setOpen = (item) => {
    setDetail(item);
    lockScroll(Boolean(item));
  };

  return (
    <section id="solutions" data-testid="solutions-section" className="section-y border-t border-border">
      <div className="container-x">
        <SectionLabel index="04">Our Solutions</SectionLabel>
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2 className="display h-section lg:col-span-7">
            <MaskedLines lines={["The solution", <><em className="italic text-aqua">catalogue.</em></>]} />
          </h2>
          <Reveal className="text-base leading-relaxed text-muted-foreground lg:col-span-4 lg:col-start-9">
            Products and solutions the company offers, grouped by category. Specifications are shared on enquiry.
          </Reveal>
        </div>

        <div role="group" aria-label="Filter solutions by category" className="mt-12 flex flex-wrap gap-2">
          {SOLUTION_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              data-testid={`solutions-filter-${f.id}`}
              className={cn("min-h-11 rounded-full border px-5 text-sm transition-colors duration-300",
                filter === f.id ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground")}
            >
              {f.label}
              <span className="label ml-2 !text-[0.65rem] opacity-70">
                {f.id === "all" ? SOLUTIONS.length : SOLUTIONS.filter((s) => s.cat === f.id).length}
              </span>
            </button>
          ))}
        </div>

        <ul data-testid="solutions-grid" className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((s) => <SolutionCard key={s.id} s={s} open={setOpen} />)}
          </AnimatePresence>
        </ul>
        <p className="mt-10 text-xs text-muted-foreground">{IMAGE_NOTE}s, shown for illustration.</p>
      </div>

      <Dialog open={Boolean(detail)} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent data-lenis-prevent data-testid="solution-detail-dialog" className="max-h-[92svh] max-w-3xl gap-0 overflow-y-auto rounded-md border-border bg-card p-0">
          {detail && (
            <div className="grid md:grid-cols-2">
              <div className="aspect-[4/3] md:aspect-auto md:min-h-[24rem]">
                {(() => {
                  const images = getSolutionImages(detail);
                  if (images.length <= 1) {
                    return <Photo src={images[0]} alt={detail.title} contain={detail.contain} eager />;
                  }
                  // Multiple images - use carousel
                  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
                  const [selectedIndex, setSelectedIndex] = useState(0);
                  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
                  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
                  const scrollTo = useCallback((index) => emblaApi?.scrollTo(index), [emblaApi]);

                  return (
                    <div className="relative h-full" ref={emblaRef}>
                      <div className="h-full overflow-hidden">
                        <div className="h-full flex" style={{ transform: `translateX(-${selectedIndex * 100}%)`, transition: "transform 0.4s ease" }}>
                          {images.map((img, i) => (
                            <div key={i} className="w-full flex-shrink-0" style={{ width: "100%" }}>
                              <Photo src={img} alt={`${detail.title} - Image ${i + 1}`} contain={detail.contain} eager />
                            </div>
                          ))}
                        </div>
                      </div>
                      {images.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={scrollPrev}
                            aria-label="Previous image"
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 text-foreground hover:bg-background transition-colors"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={scrollNext}
                            aria-label="Next image"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 text-foreground hover:bg-background transition-colors"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {images.map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => scrollTo(i)}
                                aria-label={`Go to image ${i + 1}`}
                                className={`w-2 h-2 rounded-full transition-colors ${i === selectedIndex ? "bg-foreground" : "bg-muted-foreground/50 hover:bg-muted-foreground"}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
              <div className="flex flex-col p-6 sm:p-8">
                <p className="label text-aqua">{catLabel(detail.cat)}</p>
                <DialogTitle className="display mt-3 text-3xl font-medium sm:text-4xl">{detail.title}</DialogTitle>
                <DialogDescription className="mt-4 text-base leading-relaxed text-muted-foreground">{detail.desc}</DialogDescription>
                <p className="mt-6 rounded border border-dashed border-border p-4 text-sm text-muted-foreground" data-testid="solution-spec-placeholder">
                  <span className="label mb-1 block !text-[0.65rem] text-bronze">Content placeholder</span>
                  Technical specifications for this item are to be supplied by the company. Please enquire for details.
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-4 pt-8">
                  <Btn data-testid="solution-enquire-button" onClick={() => { const t = detail.title; setOpen(null); onEnquire(t); }}>Enquire</Btn>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
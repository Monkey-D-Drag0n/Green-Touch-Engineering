import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, BadgeCheck, Star, MessageSquare, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { Btn, EASE, MaskedLines, Reveal, SectionLabel, Tilt } from "./primitives";
import { cn } from "../lib/utils";

const Stars = ({ value, size = "h-5 w-5" }) => (
  <span className="relative inline-flex" role="img" aria-label={`${value} out of 5 stars`}>
    <span className="flex gap-1 text-border">{[...Array(5)].map((_, i) => <Star key={i} className={`${size} fill-current stroke-muted-foreground/40`} />)}</span>
    <span className="absolute inset-0 flex gap-1 overflow-hidden text-bronze" style={{ width: `${(value / 5) * 100}%` }}>
      {[...Array(5)].map((_, i) => <Star key={i} className={`${size} shrink-0 fill-current`} />)}
    </span>
  </span>
);

const Ring = ({ pct, label }) => (
  <div data-testid={`review-metric-${label.toLowerCase().replace(/\s+/g, "-")}`} className="flex items-center gap-4 rounded-md border border-border bg-card p-5">
    <svg viewBox="0 0 44 44" className="h-14 w-14 shrink-0 -rotate-90" aria-hidden="true">
      <circle cx="22" cy="22" r="19" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
      <motion.circle
        cx="22" cy="22" r="19" fill="none" stroke="hsl(var(--aqua))" strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: pct / 100 }} viewport={{ once: true }}
        transition={{ duration: 1.6, ease: EASE }}
      />
    </svg>
    <div>
      <p className="display text-4xl">{pct}%</p>
      <p className="label mt-1 !text-[0.68rem] text-muted-foreground">{label}</p>
    </div>
  </div>
);

// Generate consistent color from string for avatar background
const getAvatarColor = (name) => {
  const colors = [
    "bg-aqua/20 text-aqua",
    "bg-bronze/20 text-bronze",
    "bg-emerald/20 text-emerald",
    "bg-violet/20 text-violet",
    "bg-rose/20 text-rose",
    "bg-amber/20 text-amber",
    "bg-cyan/20 text-cyan",
    "bg-indigo/20 text-indigo",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const Avatar = ({ name, className, size = "h-12 w-12" }) => {
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);
  return (
    <div className={cn("flex items-center justify-center rounded-full font-medium select-none", size, colorClass, className)} aria-hidden="true">
      <span className="text-base">{initials}</span>
    </div>
  );
};

const CategoryMetric = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Icon className="h-4 w-4 text-aqua" aria-hidden="true" />
    <span className="font-medium">{label}</span>
    <span className="text-foreground">{value}</span>
  </div>
);

const ReviewCard = ({ review }) => (
  <figure data-testid={`review-card-${review.id}`} className="flex h-full min-h-[18rem] flex-col rounded-md border border-border bg-card p-7">
    <div className="flex items-start gap-4">
      <Avatar name={review.author} size="h-12 w-12" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{review.author}</span>
          <BadgeCheck className="h-4 w-4 text-aqua" aria-hidden="true" />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{review.location}</p>
        <p className="mt-1 text-xs text-muted-foreground">{review.date}</p>
      </div>
    </div>

    {review.service && (
      <div className="mt-6">
        <p className="label !text-[0.68rem] text-muted-foreground">Rated for</p>
        <p className="mt-1 display text-3xl">{review.service}</p>
      </div>
    )}

    {/* Written review or star-only label */}
    {review.text ? (
      <blockquote className="mt-4 text-base leading-relaxed text-foreground">
        “{review.text}”
      </blockquote>
    ) : (
      <p className="mt-4 text-sm text-muted-foreground italic">Rated without a written review.</p>
    )}

    {/* Individual category ratings - only if available */}
    {review.category_ratings && (
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        {review.category_ratings.quality && (
          <CategoryMetric label="Quality" value={review.category_ratings.quality} icon={ShieldCheck} />
        )}
        {review.category_ratings.delivery && (
          <CategoryMetric label="Delivery" value={review.category_ratings.delivery} icon={Truck} />
        )}
        {review.category_ratings.response && (
          <CategoryMetric label="Response" value={review.category_ratings.response} icon={RotateCcw} />
        )}
      </div>
    )}

    {/* Seller response - only if available */}
    {review.seller_response && (
      <div className="mt-6 pt-4 border-t border-border">
        <p className="label font-medium text-foreground">Response from Seller</p>
        {review.seller_response_date && (
          <p className="mt-1 text-xs text-muted-foreground">{review.seller_response_date}</p>
        )}
        <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">{review.seller_response}</p>
      </div>
    )}

    <figcaption className="mt-4 text-xs text-muted-foreground">
      {review.text ? "Client feedback, quoted in full." : "Verified client rating. Individual star rating not available from source."}
    </figcaption>
  </figure>
);

const Carousel = ({ reviews }) => {
  const reduce = useReducedMotion();
  const [ref, api] = useEmblaCarousel({ loop: true, align: "start" });
  const paused = useRef(false);
  const prev = useCallback(() => api?.scrollPrev(), [api]);
  const next = useCallback(() => api?.scrollNext(), [api]);

  useEffect(() => {
    if (!api || reduce) return undefined;
    const id = setInterval(() => !paused.current && api.scrollNext(), 4500);
    return () => clearInterval(id);
  }, [api, reduce]);

  const hold = (v) => () => { paused.current = v; };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Client feedback"
      tabIndex={0}
      data-testid="reviews-carousel"
      onKeyDown={(e) => { if (e.key === "ArrowLeft") prev(); if (e.key === "ArrowRight") next(); }}
      onMouseEnter={hold(true)} onMouseLeave={hold(false)} onFocus={hold(true)} onBlur={hold(false)}
      className="mt-16"
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <p className="label text-muted-foreground">Client feedback</p>
        <div className="flex gap-2">
          <button type="button" onClick={prev} aria-label="Previous" data-testid="reviews-carousel-prev" className="grid h-11 w-11 place-items-center rounded-full border border-border transition-colors duration-300 hover:border-foreground"><ArrowLeft className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={next} aria-label="Next" data-testid="reviews-carousel-next" className="grid h-11 w-11 place-items-center rounded-full border border-border transition-colors duration-300 hover:border-foreground"><ArrowRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div ref={ref} className="cursor-grab overflow-hidden active:cursor-grabbing">
        <div className="flex">
          {reviews.map((review, index) => (
            <div key={review.id} className="min-w-0 shrink-0 grow-0 basis-full pr-4 md:basis-1/2 xl:basis-[38%]">
              <Tilt max={3} className="h-full">
                <ReviewCard review={review} />
              </Tilt>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Reviews = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchReviews = async () => {
      try {
        const response = await fetch("/api/reviews");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (mounted) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchReviews();

    return () => {
      mounted = false;
    };
  }, []);

  // Fallback data matching site.js structure (for error/loading states)
  const fallbackRating = {
    score: 4.9,
    count: 17,
    distribution: [
      { stars: 5, pct: 94 },
      { stars: 4, pct: 0 },
      { stars: 3, pct: 0 },
      { stars: 2, pct: 0 },
      { stars: 1, pct: 6 },
    ],
    metrics: [
      { label: "User Satisfaction", pct: 100 },
      { label: "Quality", pct: 90 },
      { label: "Delivery", pct: 100 },
      { label: "Response", pct: 100 },
    ],
  };

  const fallbackReviews = [
    {
      id: "review-1",
      author: "Suman Thakur",
      location: "Greater Noida, Uttar Pradesh",
      date: "15 September 2025",
      text: "good",
      service: "Swimming Pool Construction",
      has_written_review: true,
      rating: null,
      seller_response: null,
      seller_response_date: null,
      category_ratings: null,
    },
    {
      id: "review-2",
      author: "Shaurabh Tirapathi",
      location: "Rewa, Madhya Pradesh",
      date: "18 September 2025",
      text: null,
      service: "FRP Water Park Slides",
      has_written_review: false,
      rating: null,
      seller_response: null,
      seller_response_date: null,
      category_ratings: null,
    },
    {
      id: "review-3",
      author: "Rajkumar",
      location: "Jaunpur, Uttar Pradesh",
      date: "10 July 2026",
      text: null,
      service: "Swimming Pool Construction",
      has_written_review: false,
      rating: null,
      seller_response: null,
      seller_response_date: null,
      category_ratings: null,
    },
    {
      id: "review-4",
      author: "Sarla Shukla",
      location: "Rewa, Madhya Pradesh",
      date: "18 September 2025",
      text: null,
      service: "Amusement Rides",
      has_written_review: false,
      rating: null,
      seller_response: null,
      seller_response_date: null,
      category_ratings: null,
    },
    {
      id: "review-5",
      author: "Lakshmi Garg",
      location: "Rewa, Madhya Pradesh",
      date: "18 September 2025",
      text: null,
      service: "Boomerango Water Slides",
      has_written_review: false,
      rating: null,
      seller_response: null,
      seller_response_date: null,
      category_ratings: null,
    },
    {
      id: "review-6",
      author: "Nagendar",
      location: "Rewa, Madhya Pradesh",
      date: "18 September 2025",
      text: null,
      service: "FRP Water Park Slides",
      has_written_review: false,
      rating: null,
      seller_response: null,
      seller_response_date: null,
      category_ratings: null,
    },
    {
      id: "review-7",
      author: "Veerendra Vishwakarma",
      location: "Rewa, Madhya Pradesh",
      date: "18 September 2025",
      text: null,
      service: "FRP Water Park Slides",
      has_written_review: false,
      rating: null,
      seller_response: null,
      seller_response_date: null,
      category_ratings: null,
    },
    {
      id: "review-8",
      author: "Ajit Kumar Mahi",
      location: "Ballia, Uttar Pradesh",
      date: "13 September 2025",
      text: null,
      service: "FRP Water Park Slides",
      has_written_review: false,
      rating: null,
      seller_response: null,
      seller_response_date: null,
      category_ratings: null,
    },
    {
      id: "review-9",
      author: "Binu",
      location: "Rewa, Madhya Pradesh",
      date: "11 September 2025",
      text: null,
      service: "Boomerango Water Slides",
      has_written_review: false,
      rating: null,
      seller_response: null,
      seller_response_date: null,
      category_ratings: null,
    },
    {
      id: "review-10",
      author: "Manju",
      location: "Deoghar, Jharkhand",
      date: "05 September 2025",
      text: null,
      service: "",
      has_written_review: false,
      rating: null,
      seller_response: null,
      seller_response_date: null,
      category_ratings: null,
    },
    {
      id: "review-11",
      author: "BHEEM SINGH",
      location: "Mathura, Uttar Pradesh",
      date: "04 March 2025",
      text: null,
      service: "Swimming Pool Construction",
      has_written_review: false,
      rating: null,
      seller_response: null,
      seller_response_date: null,
      category_ratings: null,
    },
    {
      id: "review-12",
      author: "THAHIR Thalhath",
      location: "Thiruvananthapuram, Kerala",
      date: "18 July 2026",
      text: null,
      service: "Glass Mosaic Tiles",
      has_written_review: false,
      rating: null,
      seller_response: null,
      seller_response_date: null,
      category_ratings: null,
    },
    {
      id: "review-13",
      author: "Raju Tripathi",
      location: "Rewa, Madhya Pradesh",
      date: "18 September 2025",
      text: null,
      service: "Amusement Rides Zip Line",
      has_written_review: false,
      rating: null,
      seller_response: null,
      seller_response_date: null,
      category_ratings: null,
    },
    {
      id: "review-14",
      author: "Ganesh",
      location: "Srikakulam, Andhra Pradesh",
      date: "16 January 2025",
      text: null,
      service: "Construction Service",
      has_written_review: false,
      rating: null,
      seller_response: null,
      seller_response_date: null,
      category_ratings: null,
    },
    {
      id: "review-15",
      author: "Vijay Nayak",
      location: "Dhanbad, Jharkhand",
      date: "06 July 2024",
      text: null,
      service: "Water Park Equipment",
      has_written_review: false,
      rating: null,
      seller_response: null,
      seller_response_date: null,
      category_ratings: null,
    },
    {
      id: "review-16",
      author: "Gorakhnath Yadav",
      location: "Jaunpur, Uttar Pradesh",
      date: "01 June 2024",
      text: null,
      service: "Water Park Waves Pool Blower System",
      has_written_review: false,
      rating: null,
      seller_response: null,
      seller_response_date: null,
      category_ratings: null,
    },
    {
      id: "review-17",
      author: "SURAJ MANDAL",
      location: "Forbesganj, Bihar",
      date: "29 July 2023",
      text: null,
      service: "Glass Mosaic Tiles",
      has_written_review: false,
      rating: null,
      seller_response: null,
      seller_response_date: null,
      category_ratings: null,
    },
  ];

  // Use API data or fallback
  const rating = data || fallbackRating;
  const reviews = (data?.reviews?.map((r, i) => ({
    id: `review-${i + 1}`,
    author: r.author,
    location: r.location,
    date: r.date,
    text: r.text,
    service: r.service,
    has_written_review: r.has_written_review,
    rating: r.rating,
    seller_response: r.seller_response,
    seller_response_date: r.seller_response_date,
    category_ratings: r.category_ratings,
  }))) || fallbackReviews;

  if (loading) {
    return (
      <section id="reviews" data-testid="reviews-section" className="section-y border-t border-border">
        <div className="container-x">
          <SectionLabel index="07">Client Reviews</SectionLabel>
          <div className="mt-8 grid gap-x-12 gap-y-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="display h-section">
                <MaskedLines lines={["Rated by", <><em className="italic text-aqua">verified</em> clients.</>]} />
              </h2>
              <div className="mt-10 flex items-end gap-5 animate-pulse" data-testid="rating-summary">
                <div className="display text-[clamp(6rem,13vw,11rem)] leading-[0.8] bg-muted h-[8rem] w-[8rem] rounded" />
                <div className="pb-2">
                  <div className="h-5 w-40 bg-muted rounded animate-pulse" />
                  <div className="mt-2 h-4 w-60 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid grid-cols-[3.2rem_1fr_3rem] items-center gap-4 text-sm h-6">
                    <div className="h-4 w-12 bg-muted rounded" />
                    <div className="h-1.5 bg-muted rounded" />
                    <div className="h-4 w-12 bg-muted rounded" />
                  </div>
                ))}
              </div>
              <div className="mt-12 animate-pulse grid gap-4 sm:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted rounded" />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-16 animate-pulse">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="flex gap-2">
                <div className="h-11 w-11 bg-muted rounded-full" />
                <div className="h-11 w-11 bg-muted rounded-full" />
              </div>
            </div>
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" data-testid="reviews-section" className="section-y border-t border-border">
      <div className="container-x">
        <SectionLabel index="07">Client Reviews</SectionLabel>
        <div className="mt-8 grid gap-x-12 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="display h-section">
              <MaskedLines lines={["Rated by", <><em className="italic text-aqua">verified</em> clients.</>]} />
            </h2>
            <Reveal className="mt-10 flex items-end gap-5" data-testid="rating-summary">
              <p className="display text-[clamp(6rem,13vw,11rem)] leading-[0.8]" data-testid="rating-score">{rating.overall_rating || rating.score}</p>
              <div className="pb-2">
                <Stars value={rating.overall_rating || rating.score} />
                <p className="mt-2 text-sm text-muted-foreground" data-testid="rating-count">out of 5 · {rating.total_ratings || rating.count} verified client ratings</p>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center gap-4">
              <Btn variant="outline" icon={false} data-testid="reviews-cta">Read more reviews</Btn>
              <span data-testid="trust-badge" className="label inline-flex items-center gap-2 text-muted-foreground">
                <BadgeCheck className="h-3.5 w-3.5 text-aqua" aria-hidden="true" /> Verified company profile
              </span>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <p className="label mb-5 text-muted-foreground">Rating distribution</p>
              <ul data-testid="rating-distribution" className="space-y-3">
                {(rating.distribution || []).map((d) => (
                  <li key={d.stars} className="grid grid-cols-[3.2rem_1fr_3rem] items-center gap-4 text-sm">
                    <span className="label flex items-center gap-1">{d.stars} <Star className="h-[10px] w-[10px] fill-current" aria-hidden="true" /></span>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-aqua"
                        initial={{ width: 0 }}
                        animate={{ width: `${d.pct}%` }}
                        transition={{ duration: 1.4, ease: EASE }}
                      />
                    </div>
                    <span className="text-right tabular-nums" data-testid={`rating-distribution-${d.stars}`}>{d.pct}%</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1} className="mt-12">
              <p className="label mb-5 text-muted-foreground">Profile metrics</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {(rating.metrics || []).map((m) => <Ring key={m.label} {...m} />)}
              </div>
            </Reveal>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground" data-testid="reviews-attribution">
              Ratings and metrics are based on client feedback. They are not independently audited.
            </p>
          </div>
        </div>
        {/* Carousel with all 17 reviewers */}
        <Carousel reviews={reviews} />
      </div>
    </section>
  );
};
import { motion, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { scrollToId } from "../lib/scroll";
import { cn } from "../lib/utils";

export const EASE = [0.22, 1, 0.36, 1];

export const Reveal = ({ children, delay = 0, y = 32, className, ...rest }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export const MaskedLines = ({ lines, delay = 0, onLoad = false, className }) => {
  const reduce = useReducedMotion();
  const anim = { y: "0%" };
  return (
    <span className={cn("block", className)}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
          <motion.span
            className="block will-change-transform"
            initial={reduce ? false : { y: "112%" }}
            {...(onLoad ? { animate: anim } : { whileInView: anim, viewport: { once: true, margin: "-10% 0px" } })}
            transition={{ duration: 1.15, delay: delay + i * 0.11, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

export const SectionLabel = ({ index, children, className }) => (
  <p className={cn("label flex items-center gap-3 text-muted-foreground", className)}>
    <span className="text-aqua">{index}</span>
    <span className="h-px w-10 bg-current opacity-40" aria-hidden="true" />
    <span>{children}</span>
  </p>
);

export const Tilt = ({ children, className, max = 5, ...rest }) => {
  const reduce = useReducedMotion();
  const rx = useSpring(0, { stiffness: 140, damping: 16 });
  const ry = useSpring(0, { stiffness: 140, damping: 16 });
  const onMove = (e) => {
    if (reduce || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 2 * max);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 2 * max);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };
  return (
    <motion.div
      className={className}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export const Corners = ({ className }) => (
  <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
    {["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "left-0 bottom-0 border-l border-b", "right-0 bottom-0 border-r border-b"].map((c) => (
      <span key={c} className={cn("absolute h-3 w-3 border-aqua", c)} />
    ))}
  </span>
);

const BTN = {
  primary: "bg-foreground text-background hover:bg-aqua",
  outline: "border border-foreground/30 text-foreground hover:border-foreground hover:bg-foreground hover:text-background",
};

export const Btn = ({ variant = "primary", to, href, children, className, icon = true, ...rest }) => {
  const Tag = to || href ? "a" : "button";
  const props = to
    ? { href: `#${to}`, onClick: (e) => { e.preventDefault(); scrollToId(to); } }
    : href ? { href } : {};
  return (
    <Tag
      className={cn(
        "group inline-flex h-12 items-center gap-3 rounded-full pl-6 text-sm font-medium transition-colors duration-300 disabled:opacity-60",
        icon ? "pr-2" : "pr-6", BTN[variant], className,
      )}
      {...props}
      {...rest}
    >
      <span>{children}</span>
      {icon && (
        <span className="grid h-8 w-8 place-items-center rounded-full bg-background/15 transition-transform duration-300 group-hover:rotate-45" aria-hidden="true">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      )}
    </Tag>
  );
};

export const Anchor = ({ to, children, onNavigate, ...rest }) => (
  <a
    href={`#${to}`}
    onClick={(e) => {
      e.preventDefault();
      onNavigate?.();
      scrollToId(to);
    }}
    {...rest}
  >
    {children}
  </a>
);

export const Photo = ({ src, alt, className, contain, eager, ...rest }) => (
  <img
    src={src}
    alt={alt}
    loading={eager ? "eager" : "lazy"}
    decoding="async"
    className={cn("h-full w-full", contain ? "object-contain bg-white p-6" : "object-cover", className)}
    {...rest}
  />
);
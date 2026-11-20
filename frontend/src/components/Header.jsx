import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Anchor, Btn, EASE } from "./primitives";
import { Logo } from "./Logo";
import { COMPANY, NAV, NAV_MORE } from "../data/site";
import { lockScroll, scrollToId } from "../lib/scroll";
import { cn } from "../lib/utils";

const ThemeToggle = ({ theme, toggle, testId }) => (
  <button
    type="button"
    onClick={toggle}
    data-testid={testId}
    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    className="grid h-11 w-11 place-items-center rounded-full border border-border transition-colors duration-300 hover:border-foreground"
  >
    {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
  </button>
);

const MobileMenu = ({ close }) => {
  const first = useRef(null);
  useEffect(() => {
    lockScroll(true);
    document.body.style.overflow = "hidden";
    first.current?.focus();
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [close]);
  const all = [...NAV, ...NAV_MORE];
  return (
    <motion.div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      data-testid="mobile-menu"
      data-lenis-prevent
      className="surface-dark fixed inset-0 z-40 flex flex-col overflow-y-auto px-5 pb-8 pt-24 lg:hidden"
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={{ clipPath: "inset(0 0 0% 0)" }}
      exit={{ clipPath: "inset(0 0 100% 0)" }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <nav aria-label="Mobile">
        <ul>
          {all.map((item, i) => (
            <motion.li
              key={item.id}
              className="border-b border-border"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: EASE }}
            >
              <Anchor
                to={item.id}
                onNavigate={close}
                ref={i === 0 ? first : undefined}
                data-testid={`mobile-nav-link-${item.id}`}
                className="flex min-h-[3.5rem] items-baseline gap-4 py-3 font-serif text-3xl"
              >
                <span className="label w-6 text-aqua">{String(i + 1).padStart(2, "0")}</span>
                {item.label}
              </Anchor>
            </motion.li>
          ))}
        </ul>
      </nav>
      <div className="mt-8 flex flex-col gap-5">
        <Btn to="enquiry" onClickCapture={close} data-testid="mobile-nav-quote-cta" className="justify-between">Get a Quote</Btn>
        <div className="label flex flex-col gap-2 text-muted-foreground">
          {COMPANY.phones.map((p) => <a key={p.href} href={p.href} className="py-1">{p.label}</a>)}
          <a href={`mailto:${COMPANY.email}`} className="break-all py-1 normal-case">{COMPANY.email}</a>
        </div>
      </div>
    </motion.div>
  );
};

export const Header = ({ theme, toggleTheme, active }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const moreActive = NAV_MORE.some((m) => m.id === active);

  return (
    <>
      <header
        data-testid="site-header"
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-500",
          open ? "surface-dark !bg-transparent border-transparent"
            : scrolled ? "border-border bg-background/80 backdrop-blur-xl" : "border-transparent bg-transparent",
        )}
      >
        <div className="container-x flex h-[72px] items-center justify-between gap-6">
          <Anchor to="home" onNavigate={() => setOpen(false)} data-testid="nav-brand-logo" aria-label={`${COMPANY.name} — home`}>
            <Logo theme={theme} />
          </Anchor>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.id}>
                  <Anchor
                    to={item.id}
                    data-testid={`nav-link-${item.id}`}
                    aria-current={active === item.id ? "true" : undefined}
                    className={cn("relative block px-4 py-2 text-sm transition-colors duration-300 hover:text-foreground",
                      active === item.id ? "text-foreground" : "text-muted-foreground")}
                  >
                    {item.label}
                    {active === item.id && (
                      <motion.span layoutId="nav-active" className="absolute inset-x-4 -bottom-0.5 h-px bg-aqua" transition={{ duration: 0.5, ease: EASE }} />
                    )}
                  </Anchor>
                </li>
              ))}
              <li>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger
                    data-testid="nav-dropdown-more-trigger"
                    className={cn("group relative flex items-center gap-1 px-4 py-2 text-sm transition-colors duration-300 hover:text-foreground",
                      moreActive ? "text-foreground" : "text-muted-foreground")}
                  >
                    More <ChevronDown className="h-3 w-3 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                    {moreActive && <motion.span layoutId="nav-active" className="absolute inset-x-4 -bottom-0.5 h-px bg-aqua" transition={{ duration: 0.5, ease: EASE }} />}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={14} className="w-72 rounded-md border-border bg-popover p-2">
                    {NAV_MORE.map((item, i) => (
                      <DropdownMenuItem
                        key={item.id}
                        data-testid={`nav-more-link-${item.id}`}
                        onSelect={() => scrollToId(item.id)}
                        className={cn("flex cursor-pointer items-baseline gap-3 rounded px-3 py-3 text-sm", active === item.id && "text-aqua")}
                      >
                        <span className="label text-aqua">{String(i + 6).padStart(2, "0")}</span>
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} toggle={toggleTheme} testId="nav-theme-toggle-button" />
            <Btn to="enquiry" data-testid="nav-get-quote-cta" className="hidden h-11 lg:inline-flex">Get a Quote</Btn>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              data-testid="mobile-menu-toggle"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid h-11 w-11 place-items-center rounded-full border border-border lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>{open && <MobileMenu close={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
};
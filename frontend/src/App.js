import { useCallback, useEffect, useState } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { motion, MotionConfig, useScroll } from "framer-motion";
import { Header } from "./components/Header";
import { Hero, Marquee } from "./components/Hero";
import { About } from "./components/About";
import { Services } from "./components/Services";
import { Solutions } from "./components/Solutions";
import { Process } from "./components/Process";
import { Capabilities } from "./components/Capabilities";
import { Reviews } from "./components/Reviews";
import { Enquiry, Location } from "./components/Contact";
import { Footer } from "./components/Footer";
import { FloatingWhatsApp } from "./components/FloatingWhatsApp";
import { MARQUEE, NAV, NAV_MORE } from "./data/site";
import { scrollToId, setLenis } from "./lib/scroll";

const SECTION_IDS = [...NAV, ...NAV_MORE, { id: "enquiry" }].map((n) => n.id);

const useTheme = () => {
  const [theme, setTheme] = useState(() => (document.documentElement.classList.contains("dark") ? "dark" : "light"));
  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      try { localStorage.setItem("gte-theme", next); } catch (e) { /* storage unavailable */ }
      return next;
    });
  }, []);
  return [theme, toggle];
};

const useActiveSection = () => {
  const [active, setActive] = useState("home");
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return active;
};

function App() {
  const [theme, toggleTheme] = useTheme();
  const active = useActiveSection();
  const [service, setService] = useState("");
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const lenis = new Lenis({ autoRaf: true, duration: 1.15 });
    setLenis(lenis);
    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  const onEnquire = useCallback((name) => {
    setService(name);
    scrollToId("enquiry");
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded focus:bg-foreground focus:px-4 focus:py-2 focus:text-background">
        Skip to content
      </a>
      <motion.div aria-hidden="true" data-testid="scroll-progress" className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-aqua" style={{ scaleX: scrollYProgress }} />
      <Header theme={theme} toggleTheme={toggleTheme} active={active} />
      <main id="main">
        <Hero />
        <Marquee items={MARQUEE} />
        <About />
        <Services onEnquire={onEnquire} />
        <Solutions onEnquire={onEnquire} />
        <Process />
        <Capabilities />
        <Reviews />
        <Location />
        <Enquiry service={service} setService={setService} />
      </main>
      <Footer />
        <FloatingWhatsApp />
    </MotionConfig>
  );
}

export default App;
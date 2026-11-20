import { useState } from "react";
import { Facebook, Instagram, MessageCircle, Store } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { Anchor } from "./primitives";
import { Logo } from "./Logo";
import { COMPANY, LEGAL, NAV, NAV_MORE, SOCIALS } from "../data/site";
import { lockScroll } from "../lib/scroll";

const ICONS = { instagram: Instagram, facebook: Facebook, whatsapp: MessageCircle, indiamart: Store };
const NAV_LABELS = { about: "About Us", process: "Our Process", reviews: "IndiaMART Reviews" };

const Col = ({ title, children }) => (
  <div>
    <h3 className="label text-muted-foreground">{title}</h3>
    <ul className="mt-5 space-y-3 text-sm">{children}</ul>
  </div>
);

const link = "transition-colors duration-300 hover:text-aqua";

export const Footer = () => {
  const [legal, setLegal] = useState(null);
  const open = (key) => { setLegal(key); lockScroll(Boolean(key)); };
  const doc = legal && LEGAL[legal];

  return (
    <footer data-testid="site-footer" className="surface-dark overflow-hidden border-t border-border">
      <div className="container-x pt-20">
        <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo theme="dark" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {COMPANY.name}. Engineering-focused solutions for water parks, swimming pools, water attractions,
              filtration systems and recreational infrastructure.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Social media">
              {SOCIALS.map((s) => {
                const Icon = ICONS[s.id];
                const cls = "grid h-11 w-11 place-items-center rounded-full border border-border";
                return (
                  <li key={s.id}>
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label} data-testid={`footer-social-${s.id}`} className={`${cls} transition-colors duration-300 hover:border-aqua hover:text-aqua`}>
                        <Icon className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span role="img" aria-label={`${s.label} — link not yet provided`} title={`${s.label} — link not yet provided`} data-testid={`footer-social-${s.id}`} className={`${cls} cursor-not-allowed opacity-40`}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-10 lg:col-span-4 lg:col-start-6">
            <Col title="Navigation">
              {NAV.map((n) => <li key={n.id}><Anchor to={n.id} className={link} data-testid={`footer-link-${n.id}`}>{NAV_LABELS[n.id] || n.label}</Anchor></li>)}
            </Col>
            <Col title="Business">
              {[...NAV_MORE, { id: "enquiry", label: "Get In Touch" }].map((n) => (
                <li key={n.id}><Anchor to={n.id} className={link} data-testid={`footer-link-${n.id}`}>{NAV_LABELS[n.id] || n.label}</Anchor></li>
              ))}
            </Col>
          </div>

          <div className="lg:col-span-3">
            <Col title="Contact">
              <li>{COMPANY.location}</li>
              {COMPANY.phones.map((p, i) => <li key={p.href}><a href={p.href} className={link} data-testid={`footer-phone-${i + 1}`}>{p.label}</a></li>)}
              <li><a href={`mailto:${COMPANY.email}`} className={`${link} break-all`} data-testid="footer-email">{COMPANY.email}</a></li>
            </Col>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-border py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p data-testid="footer-copyright">© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {Object.entries(LEGAL).map(([key, v]) => (
              <li key={key}><button type="button" onClick={() => open(key)} data-testid={`footer-legal-${key}`} className={`${link} min-h-8`}>{v.title}</button></li>
            ))}
          </ul>
        </div>
      </div>
      <p aria-hidden="true" className="display pointer-events-none -mb-[0.2em] select-none whitespace-nowrap text-center text-[19vw] leading-[0.8] text-foreground/[0.06]">
        Green Touch
      </p>

      <Dialog open={Boolean(legal)} onOpenChange={(o) => !o && open(null)}>
        <DialogContent data-lenis-prevent data-testid="legal-dialog" className="max-h-[85svh] max-w-xl overflow-y-auto rounded-md border-border bg-card">
          {doc && (
            <>
              <p className="label text-bronze">Draft — pending company approval</p>
              <DialogTitle className="display text-4xl font-medium">{doc.title}</DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">{doc.body.map((p) => <p key={p}>{p}</p>)}</div>
              </DialogDescription>
            </>
          )}
        </DialogContent>
      </Dialog>
    </footer>
  );
};
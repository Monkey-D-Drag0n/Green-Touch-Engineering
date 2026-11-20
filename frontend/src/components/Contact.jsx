import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Loader2, MapPin } from "lucide-react";
import { Btn, Corners, EASE, MaskedLines, Reveal, SectionLabel } from "./primitives";
import { COMPANY, ENQUIRY_SERVICES, INDIAMART_URL } from "../data/site";
import { LocationMap } from "./Map";
import { cn } from "../lib/utils";

const Details = ({ idPrefix }) => (
  <dl className="grid gap-8 sm:grid-cols-2">
    <div>
      <dt className="label text-muted-foreground">Phone</dt>
      <dd className="mt-3 space-y-1">
        {COMPANY.phones.map((p, i) => (
          <a key={p.href} href={p.href} data-testid={`${idPrefix}-phone-${i + 1}`} className="display block text-2xl transition-colors duration-300 hover:text-aqua sm:text-3xl">{p.label}</a>
        ))}
      </dd>
    </div>
    <div>
      <dt className="label text-muted-foreground">Email</dt>
      <dd className="mt-3">
        <a href={`mailto:${COMPANY.email}`} data-testid={`${idPrefix}-email`} className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full text-base underline decoration-border underline-offset-4 transition-colors duration-300 hover:text-aqua hover:decoration-aqua">{COMPANY.email}</a>
      </dd>
    </div>
    <div className="sm:col-span-2">
      <dt className="label text-muted-foreground">Business hours</dt>
      <dd className="mt-3">
        <ul data-testid={`${idPrefix}-hours`}>
          {COMPANY.hours.map((h) => (
            <li key={h.day} className="flex justify-between gap-4 border-b border-border py-3 text-sm sm:text-base">
              <span>{h.day}</span><span className="text-muted-foreground">{h.time}</span>
            </li>
          ))}
        </ul>
      </dd>
    </div>
  </dl>
);

export const Location = () => (
  <section id="location" data-testid="location-section" className="section-y border-t border-border">
    <div className="container-x grid gap-x-12 gap-y-14 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <SectionLabel index="08">Location & Contact</SectionLabel>
        <h2 className="display h-section mt-8">
          <MaskedLines lines={["Based in", <><em className="italic text-aqua">Samdariya Gold,</em></>, "Rewa, Madhya Pradesh."]} />
        </h2>
        <Reveal className="mt-8">
          <p className="text-lg font-medium" data-testid="location-company-name">{COMPANY.name}</p>
          <p className="mt-1 flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5 text-aqua" aria-hidden="true" />{COMPANY.location}</p>
        </Reveal>
        <Reveal delay={0.1} className="mt-12"><Details idPrefix="location" /></Reveal>
      </div>

      <Reveal className="relative lg:col-span-6 lg:col-start-7">
        <div className="relative h-full min-h-[24rem] overflow-hidden rounded-md border border-border lg:min-h-[36rem]">
          <LocationMap />
          <div className="pointer-events-none absolute left-4 top-4 rounded bg-background/90 px-4 py-3 backdrop-blur">
            <p className="label !text-[0.65rem] text-aqua">Samdariya Gold, Rewa</p>
            <p className="mt-1 text-sm font-medium">Madhya Pradesh 486001, India</p>
          </div>
          <a href={COMPANY.mapLink} target="_blank" rel="noopener noreferrer" data-testid="location-map-link"
            className="absolute bottom-4 right-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors duration-300 hover:bg-aqua">
            Open in Google Maps <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
        <Corners className="-inset-3" />
        <p className="mt-6 text-xs text-muted-foreground">The map shows the city of Rewa, not an office address. Please call or email for directions.</p>
      </Reveal>
    </div>
  </section>
);

const FIELDS = [
  { name: "name", label: "Full Name", type: "text", autoComplete: "name", minLength: 2, maxLength: 120 },
  { name: "email", label: "Email Address", type: "email", autoComplete: "email", maxLength: 160 },
  { name: "phone", label: "Phone Number", type: "tel", autoComplete: "tel", pattern: "[0-9+\\-\\s\\(\\)]{7,20}", title: "7 to 20 digits; +, -, spaces and brackets are allowed" },
  { name: "service", label: "Service / Requirement", type: "select" },
  { name: "project_location", label: "Project Location", type: "text", minLength: 2, maxLength: 160, wide: true },
  { name: "message", label: "Message", type: "textarea", minLength: 10, maxLength: 3000, wide: true },
];

const EMPTY = { name: "", email: "", phone: "", project_location: "", message: "", website: "" };

const Field = ({ f, value, error, onChange, onBlur }) => {
  const id = `enquiry-${f.name}`;
  const common = {
    id, name: f.name, value, required: true, onChange, onBlur,
    "aria-invalid": error ? "true" : "false",
    "aria-describedby": error ? `${id}-error` : undefined,
    "data-testid": `enquiry-input-${f.name}`,
    className: "field",
  };
  const { label, type, wide, ...attrs } = f;
  return (
    <div className={cn(wide && "sm:col-span-2")}>
      <label htmlFor={id} className="label text-muted-foreground">{label} <span aria-hidden="true" className="text-aqua">*</span></label>
      {type === "select" ? (
        <select {...common}>
          <option value="" disabled>Select a service</option>
          {ENQUIRY_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea {...common} {...attrs} rows={4} className="field resize-y" />
      ) : (
        <input {...common} {...attrs} type={type} />
      )}
      {error && <p id={`${id}-error`} role="alert" data-testid={`enquiry-error-${f.name}`} className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
};

const EnquiryForm = ({ service, setService }) => {
  const form = useRef(null);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle");
  const [failure, setFailure] = useState("");
  const all = { ...values, service };

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "service") setService(value);
    else setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: e.target.validationMessage }));
  };
  const onBlur = (e) => setErrors((er) => ({ ...er, [e.target.name]: e.target.validationMessage }));

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    FIELDS.forEach((f) => { found[f.name] = form.current.elements[f.name].validationMessage; });
    setErrors(found);
    const firstBad = FIELDS.find((f) => found[f.name]);
    if (firstBad) return form.current.elements[firstBad.name].focus();
    setState("redirecting");
    // Redirect to IndiaMART for enquiry continuation
    window.location.href = INDIAMART_URL;
    return undefined;
  };

  return (
    <div className="relative rounded-md border border-border bg-card p-6 sm:p-10">
      <AnimatePresence mode="wait">
        {state === "redirecting" ? (
          <motion.div key="redirect" role="status" data-testid="enquiry-redirect" className="flex min-h-[28rem] flex-col items-start justify-center"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: EASE }}>
            <span className="grid h-14 w-14 place-items-center rounded-full border border-aqua text-aqua"><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /></span>
            <h3 className="display mt-8 text-4xl sm:text-5xl">Redirecting to IndiaMART…</h3>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              Your enquiry details are ready. You will continue your enquiry on Green Touch Engineering's IndiaMART page.
            </p>
          </motion.div>
        ) : (
          <motion.form key="form" ref={form} noValidate onSubmit={submit} data-testid="enquiry-form" exit={{ opacity: 0 }} className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {FIELDS.map((f) => <Field key={f.name} f={f} value={all[f.name]} error={errors[f.name]} onChange={onChange} onBlur={onBlur} />)}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="enquiry-website">Website</label>
              <input id="enquiry-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={onChange} />
            </div>
            <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
              <Btn type="submit" disabled={state === "redirecting"} icon={state !== "redirecting"} data-testid="enquiry-form-submit-button">
                {state === "redirecting" ? <span className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />Redirecting…</span> : "Continue on IndiaMART"}
              </Btn>
              <p className="text-xs text-muted-foreground">All fields are required.</p>
            </div>
            {failure && (
              <p role="alert" data-testid="enquiry-form-error" className="text-sm text-destructive sm:col-span-2">
                {failure} <a className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full underline" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Enquiry = ({ service, setService }) => (
  <section id="enquiry" data-testid="enquiry-section" className="surface-dark section-y relative">
    <div className="blueprint absolute inset-0 opacity-70" aria-hidden="true" />
    <div className="container-x relative grid gap-x-12 gap-y-14 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <SectionLabel index="09">Get In Touch</SectionLabel>
        <h2 className="display h-section mt-8">
          <MaskedLines lines={["Let's Build", "Something", <>That <em className="italic text-aqua">Lasts.</em></>]} />
        </h2>
        <Reveal className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
          Tell us about your requirements and let our team understand how we can help with your next water
          infrastructure or recreational engineering project.
        </Reveal>
        <Reveal delay={0.1} className="mt-12"><Details idPrefix="enquiry" /></Reveal>
      </div>
      <Reveal className="lg:col-span-6 lg:col-start-7">
        <EnquiryForm service={service} setService={setService} />
      </Reveal>
    </div>
  </section>
);
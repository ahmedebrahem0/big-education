"use client";
import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
import { RoomStatic } from "./room-static";
import { copy, contact, type Locale } from "@/content/site";
const OrbitScene = dynamic(() => import("./orbit-scene"), {
  ssr: false,
  loading: () => <RoomStatic />,
});
export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduced ? undefined : { opacity: [0.7, 1], y: [20, 0] }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function Approach({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  return (
    <section className="approach section-pad" id="approach">
      <div className="approach-copy">
        <span className="eyebrow">{c.approachLabel}</span>
        <h2>{c.approachTitle}</h2>
        <p>{c.approachText}</p>
        <div className="step-tabs" role="tablist" aria-label={c.approachTitle}>
          {c.steps.map((s, i) => (
            <button
              key={s}
              id={`step-${i}`}
              role="tab"
              aria-selected={active === i}
              aria-controls="step-panel"
              tabIndex={active === i ? 0 : -1}
              onKeyDown={(e) => {
                if (
                  ["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)
                ) {
                  e.preventDefault();
                  const n =
                    e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? 4
                        : (active +
                            ((e.key === "ArrowRight") !== (locale === "ar")
                              ? 1
                              : 4)) %
                          5;
                  setActive(n);
                  document.getElementById(`step-${n}`)?.focus();
                }
              }}
              onClick={() => setActive(i)}
            >
              <span>0{i + 1}</span>
              {s}
            </button>
          ))}
        </div>
        <div
          className="step-panel"
          id="step-panel"
          role="tabpanel"
          aria-labelledby={`step-${active}`}
        >
          <span className="step-no">0{active + 1}</span>
          <p>{c.stepText[active]}</p>
        </div>
      </div>
      <div className="orbit-visual room-visual" aria-hidden="true">
        <div className="room-caption">
          <span>
            {locale === "en"
              ? "THE SAME SPACE. EVERY STAGE."
              : "نفس المساحة. في كل مرحلة."}
          </span>
          <span>BIG / 0{active + 1}</span>
        </div>
        <div className="scene-canvas">
          <OrbitScene active={active} reduced={!!reduced} />
        </div>
        <div className="process-state">
          <span>
            0{active + 1} / {c.steps[active]}
          </span>
          <strong>{c.processVisuals[active]}</strong>
        </div>
        <div className="process-nodes">
          {c.steps.map((step, index) => (
            <span key={step} className={active === index ? "selected" : ""}>
              <i />
              {step}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
export function Spaces({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [active, setActive] = useState(0);
  return (
    <section className="spaces section-pad">
      <span className="eyebrow">{c.spacesLabel}</span>
      <div className="section-heading">
        <h2>{c.spacesTitle}</h2>
        <p>{c.spacesText}</p>
      </div>
      <div className="space-tabs" role="tablist" aria-label={c.spacesLabel}>
        {c.filters.map((f, i) => (
          <button
            key={f}
            role="tab"
            id={`space-${i}`}
            aria-selected={active === i}
            aria-controls="spaces-panel"
            tabIndex={active === i ? 0 : -1}
            onKeyDown={(event) => {
              if (
                !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? 2
                    : (active +
                        ((event.key === "ArrowRight") !== (locale === "ar")
                          ? 1
                          : 2)) %
                      3;
              setActive(next);
              document.getElementById(`space-${next}`)?.focus();
            }}
            onClick={() => setActive(i)}
          >
            {f}
            <span>0{i + 1}</span>
          </button>
        ))}
      </div>
      <div
        id="spaces-panel"
        role="tabpanel"
        aria-labelledby={`space-${active}`}
        className="space-list"
      >
        {c.spaces[active].map((s, i) => (
          <details key={s}>
            <summary>
              <span>0{i + 1}</span>
              <h3>{s}</h3>
              <span className="expand-symbol" aria-hidden="true" />
            </summary>
            <p>{c.spaceDetails[active][i]}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
export function ContactForm({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [ready, setReady] = useState(false);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const body = `${d.get("message")}\n\n${d.get("name")}\n${d.get("organization")}`;
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent("BIG Education — Project enquiry")}&body=${encodeURIComponent(body)}`;
    setReady(true);
  }
  return (
    <form className="contact-form" onSubmit={submit}>
      <label>
        {c.name}
        <input required name="name" autoComplete="name" maxLength={100} />
      </label>
      <label>
        {c.organization}
        <input
          name="organization"
          autoComplete="organization"
          maxLength={150}
        />
      </label>
      <label>
        {c.message}
        <textarea required name="message" rows={4} maxLength={3000} />
      </label>
      <button className="button light" type="submit">
        {c.send}
        <ArrowUpRight size={20} />
      </button>
      <p className="form-note" role="status">
        {ready ? c.formReady : c.formNote}
      </p>
    </form>
  );
}

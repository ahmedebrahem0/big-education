import Image from "next/image";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { copy, contact, coreValues, type Locale } from "@/content/site";
import { Approach, Reveal, ContactForm } from "./interactions";
import { SpacesDial } from "./spaces-dial";
import { BrandMotif } from "./brand-motif";
import { HeroFx } from "./hero-fx";
import { Story, Pillars } from "./story";
function Button({
  href,
  children,
  light = false,
}: {
  href: string;
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <a href={href} className={`button ${light ? "light" : ""}`}>
      {children}
      <ArrowUpRight size={19} />
    </a>
  );
}
function Photo({
  name,
  alt = "",
  preload = false,
}: {
  name: string;
  alt?: string;
  preload?: boolean;
}) {
  return (
    <Image
      src={`/images/${name}.webp`}
      alt={alt}
      fill
      sizes="(max-width: 760px) 100vw, 70vw"
      preload={preload}
      className="cover-image"
    />
  );
}
export function Home({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <main id="main">
      <HeroFx>
        <div className="hero-bg">
          <Photo name="hero" preload />
        </div>
        <div className="hero-shade" />
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-dust" aria-hidden="true">
          {Array.from({ length: 48 }, (_, i) => (
            <i
              key={i}
              style={
                {
                  "--x": `${(i * 37 + 11) % 100}%`,
                  "--y": `${(i * 53 + 7) % 100}%`,
                  "--s": `${4 + (i % 5) * 1.5}px`,
                  "--t": `${7 + (i % 5) * 2}s`,
                  "--d": `-${(i * 1.3).toFixed(1)}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <BrandMotif className="hero-motif" />
        <div className="hero-content">
          <span className="eyebrow">
            <i />
            {c.eyebrow}
          </span>
          <h1>
            {c.headline.map((line, li) => (
              <span key={line} className={`ln ${li === 2 ? "accent" : ""}`}>
                {line.split(" ").map((word, wi) => (
                  <span key={wi}>
                    <span
                      className="w"
                      style={{ "--l": li, "--wi": wi } as React.CSSProperties}
                    >
                      {word}
                    </span>{" "}
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <p>{c.intro}</p>
          <div className="hero-buttons">
            <Button href="#solutions" light>
              {c.explore}
            </Button>
            <a className="ghost-button" href="#contact">
              {c.start}
              <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
        <div className="hero-bottom">
          <a href="#big-picture">
            <ArrowDown size={20} />
            {c.scroll}
          </a>
        </div>
        <span className="hero-index">01 — 05</span>
      </HeroFx>
      <div className="brand-strip" aria-label={c.since}>
        <div className="strip-track">
          {[0, 1].map((n) => (
            <div className="strip-set" key={n} aria-hidden={n === 1}>
              {[c.since, c.group, "DESIGN · BUILD · INSPIRE", "360°"].map(
                (t) => (
                  <span key={t}>
                    {t}
                    <i className="strip-mark">✳</i>
                  </span>
                ),
              )}
            </div>
          ))}
        </div>
      </div>
      <Story locale={locale} />
      <Pillars locale={locale} />
      <Approach locale={locale} immersive />
      <SpacesDial locale={locale} />
      <Media locale={locale} />
      <Factory locale={locale} />
      <Emergency locale={locale} />
      <Values locale={locale} />
      <Contact locale={locale} />
    </main>
  );
}
function Factory({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <section className="factory" id="factory">
      <div className="factory-image">
        <Photo name="factory" />
        <div className="image-caption">
          BIG / {locale === "en" ? "INDUSTRIAL INTELLIGENCE" : "ذكاء صناعي"}
          <span>{c.concept}</span>
        </div>
      </div>
      <Reveal className="factory-copy">
        <span className="eyebrow">{c.factoryLabel}</span>
        <h2>{c.factoryTitle}</h2>
        <p>{c.factoryText}</p>
        <ul className="process-list">
          {c.factoryTags.map((t, i) => (
            <li key={t}>
              <span>0{i + 1}</span>
              {t}
            </li>
          ))}
        </ul>
        <Button href="#contact" light>
          {c.start}
        </Button>
      </Reveal>
    </section>
  );
}
function Emergency({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <section className="emergency section-pad" id="emergency">
      <div className="emergency-copy">
        <span className="eyebrow">{c.emergencyLabel}</span>
        <h2>{c.emergencyTitle}</h2>
        <p>{c.emergencyText}</p>
        <a
          className="button"
          href={contact.emergency}
          target="_blank"
          rel="noreferrer"
        >
          {c.external}
          <ArrowUpRight size={19} />
        </a>
      </div>
      <div className="emergency-image">
        <Photo name="emergency" />
        <div className="box-label">
          <span>BIG</span>
          <strong>
            SCHOOL
            <br />
            IN A BOX
          </strong>
          <ArrowUpRight />
        </div>
      </div>
    </section>
  );
}
function Media({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const s = c.services[1];
  return (
    <section className="media-detail section-pad" id="media">
      <span className="eyebrow">{s.category}</span>
      <h2>{s.title}</h2>
      <p className="large-copy">{s.text}</p>
      <div className="mission">
        {s.items.map((item, i) => (
          <article key={item}>
            <span className="eyebrow">0{i + 1} /</span>
            <h3>{item}</h3>
            <p>{c.mediaDetails[i]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
function Values({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <section className="values section-pad core-values" id="values">
      <div>
        <span className="eyebrow">{c.valuesLabel}</span>
        <h2>{c.valuesTitle}</h2>
      </div>
      <div className="value-grid">
        {coreValues[locale].map(([title, description], index) => (
          <article key={title}>
            <span className="value-index">0{index + 1} /</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
function Contact({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <div id="contact">
      <section className="inner-hero contact-hero">
        <div>
          <span className="eyebrow">{c.contactLabel}</span>
          <h2 className="contact-title">{c.contactTitle}</h2>
          <p>{c.contactText}</p>
        </div>
        <ContactForm locale={locale} />
      </section>
      <section className="contact-details section-pad">
        <div>
          <span className="eyebrow">{c.email}</span>
          <a href={`mailto:${contact.email}`}>
            {contact.email}
            <ArrowUpRight />
          </a>
        </div>
        <div>
          <span className="eyebrow">{c.call}</span>
          {contact.phones.map((p) => (
            <a key={p} href={`tel:${p}`} dir="ltr">
              {p.replace(/(\d{3})(\d{2})(\d{4})(\d{2})/, "$1 $2 $3 $4")}
              <ArrowUpRight />
            </a>
          ))}
        </div>
        <div>
          <span className="eyebrow">BIG GROUP</span>
          <a href={contact.group} target="_blank" rel="noreferrer">
            big-egypt.com
            <ArrowUpRight />
          </a>
        </div>
      </section>
    </div>
  );
}

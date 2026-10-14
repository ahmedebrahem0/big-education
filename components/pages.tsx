import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowDown, MoveRight } from "lucide-react";
import { copy, contact, coreValues, type Locale } from "@/content/site";
import { Approach, Reveal, Spaces, ContactForm } from "./interactions";
import { BrandMotif } from "./brand-motif";
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
    <Link href={href} className={`button ${light ? "light" : ""}`}>
      {children}
      <ArrowUpRight size={19} />
    </Link>
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
      <section className="hero">
        <Photo name="hero" preload />
        <div className="hero-shade" />
        <BrandMotif className="hero-motif" />
        <div className="hero-content">
          <span className="eyebrow">
            <i />
            {c.eyebrow}
          </span>
          <h1>
            {c.headline.map((line, i) => (
              <span key={line} className={i === 2 ? "accent" : ""}>
                {line}
              </span>
            ))}
          </h1>
          <p>{c.intro}</p>
          <div className="hero-buttons">
            <Button href={`/${locale}/solutions`} light>
              {c.explore}
            </Button>
            <Link className="text-link" href={`/${locale}/contact`}>
              {c.start}
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
        <div className="hero-bottom">
          <a href="#big-picture">
            <ArrowDown size={20} />
            {c.scroll}
          </a>
          <div className="hero-coordinate">
            30° N · 31° E <span>DESIGNED IN EGYPT</span>
          </div>
          <Link href="#approach" className="next-scene">
            <span>
              {c.next}
              <strong>
                {locale === "en"
                  ? "Connected by design"
                  : "تكامل يبدأ من التصميم"}
              </strong>
            </span>
            <MoveRight />
          </Link>
        </div>
        <span className="hero-index">01 — 05</span>
      </section>
      <div className="brand-strip">
        <span>{c.since}</span>
        <span className="strip-mark">✳</span>
        <span>{c.group}</span>
        <span className="strip-mark">✳</span>
        <span>DESIGN · BUILD · INSPIRE</span>
      </div>
      <section className="intro-section section-pad" id="big-picture">
        <span className="eyebrow">{c.aboutLabel}</span>
        <Reveal className="intro-grid">
          <h2>{c.aboutTitle}</h2>
          <div>
            <p className="large-copy">{c.aboutText}</p>
            <Link className="text-link dark-link" href={`/${locale}/about`}>
              {c.nav[1]}
              <ArrowUpRight size={22} />
            </Link>
          </div>
          <div className="founded">
            <strong>
              2018<span>↗</span>
            </strong>
            <small>
              {locale === "en"
                ? "THE START OF SOMETHING BIG"
                : "بداية حكاية كبيرة"}
            </small>
          </div>
        </Reveal>
      </section>
      <Approach locale={locale} />
      <Solutions locale={locale} />
      <Spaces locale={locale} />
      <Factory locale={locale} />
      <Emergency locale={locale} />
      <Values locale={locale} />
      <ContactCTA locale={locale} />
    </main>
  );
}
function Solutions({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <section className="solutions section-pad">
      <span className="eyebrow">{c.solutionLabel}</span>
      <div className="section-heading">
        <h2>{c.solutionTitle}</h2>
        <p>{c.solutionIntro}</p>
      </div>
      <div className="solution-panels">
        {c.services.map((s, i) => (
          <Reveal key={s.path} className={`solution-panel panel-${i}`}>
            <Link href={`/${locale}/${s.path}`}>
              <div className="panel-image">
                <Photo name={s.image} />
                <span className="panel-number">0{i + 1}</span>
                <span className="circle-arrow">
                  <ArrowUpRight />
                </span>
              </div>
              <div className="panel-copy">
                <span className="eyebrow">{s.category}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
function Factory({
  locale,
  detail = false,
}: {
  locale: Locale;
  detail?: boolean;
}) {
  const c = copy[locale];
  return (
    <section className="factory">
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
        <Button
          href={
            detail
              ? `/${locale}/contact`
              : `/${locale}/solutions/educational-spaces`
          }
          light
        >
          {detail ? c.start : c.learn}
        </Button>
      </Reveal>
    </section>
  );
}
function Emergency({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <section className="emergency section-pad">
      <div className="emergency-copy">
        <span className="eyebrow">{c.emergencyLabel}</span>
        <h2>{c.emergencyTitle}</h2>
        <p>{c.emergencyText}</p>
        <Button href={`/${locale}/emergency-education`}>{c.learn}</Button>
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
function Values({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <section className="values section-pad">
      <div>
        <span className="eyebrow">{c.valuesLabel}</span>
        <h2>{c.valuesTitle}</h2>
      </div>
      <div className="value-grid">
        {c.values.map((v, i) => (
          <article key={v}>
            <span className="value-index">0{i + 1} /</span>
            <h3>{v}</h3>
            <p>{c.valuesText[i]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
function ContactCTA({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <section className="contact-cta section-pad">
      <BrandMotif className="cta-motif" />
      <span className="eyebrow">{c.contactLabel}</span>
      <Link href={`/${locale}/contact`}>
        <h2>{c.contactTitle}</h2>
        <span className="huge-arrow">
          <ArrowUpRight strokeWidth={1} />
        </span>
      </Link>
      <div className="cta-bottom">
        <p>{c.contactText}</p>
        <a href={`mailto:${contact.email}`}>
          {contact.email}
          <ArrowUpRight size={20} />
        </a>
      </div>
    </section>
  );
}
export function InnerPage({ locale, path }: { locale: Locale; path: string }) {
  const c = copy[locale];
  const service = c.services.find((s) => s.path === path);
  const about = path === "about",
    contactPage = path === "contact",
    solutions = path === "solutions";
  const title = about
    ? c.aboutPageTitle
    : contactPage
      ? c.contactTitle
      : solutions
        ? c.solutionTitle
        : service?.title || "";
  const text = about
    ? c.aboutPageText
    : contactPage
      ? c.contactText
      : solutions
        ? c.solutionIntro
        : service?.text || "";
  return (
    <main id="main">
      <section className={`inner-hero ${contactPage ? "contact-hero" : ""}`}>
        <div>
          <span className="eyebrow">
            BIG EDUCATION /{" "}
            {about
              ? c.nav[1]
              : contactPage
                ? c.nav[3]
                : service?.category || c.nav[0]}
          </span>
          <h1>{title}</h1>
          <p>{text}</p>
          {!contactPage && (
            <Button href={`/${locale}/contact`} light>
              {c.start}
            </Button>
          )}
        </div>
        {!contactPage && (
          <div className="inner-hero-image">
            <Photo name={service?.image || "hero"} preload />
            <span>{c.concept}</span>
          </div>
        )}
        {contactPage && <ContactForm locale={locale} />}
      </section>
      {about && (
        <>
          <section className="mission section-pad">
            <article>
              <span className="eyebrow">01 /</span>
              <h2>{c.vision}</h2>
              <p>{c.visionText}</p>
            </article>
            <article>
              <span className="eyebrow">02 /</span>
              <h2>{c.mission}</h2>
              <p>{c.missionText}</p>
            </article>
          </section>
          <Approach locale={locale} />
          <CoreValues locale={locale} />
        </>
      )}
      {solutions && (
        <>
          <Solutions locale={locale} />
          <Approach locale={locale} />
        </>
      )}
      {path === "solutions/educational-spaces" && (
        <>
          <Spaces locale={locale} />
          <Factory locale={locale} detail />
        </>
      )}
      {path === "solutions/educational-media" && (
        <section className="media-detail section-pad">
          <span className="eyebrow">{c.services[1].category}</span>
          <h2>
            {locale === "en"
              ? "Good stories open minds."
              : "القصص الجيدة تفتح العقول."}
          </h2>
          <div className="mission">
            {c.services[1].items.map((item, i) => (
              <article key={item}>
                <span className="eyebrow">0{i + 1} /</span>
                <h3>{item}</h3>
                <p>{c.mediaDetails[i]}</p>
              </article>
            ))}
          </div>
        </section>
      )}
      {path === "emergency-education" && (
        <>
          <section className="emergency-detail section-pad">
            <span className="eyebrow">BIG SCHOOL IN A BOX</span>
            <h2>{c.emergencyTitle}</h2>
            <p className="large-copy">{c.emergencyText}</p>
            <a
              className="button"
              href={contact.emergency}
              target="_blank"
              rel="noreferrer"
            >
              {c.external}
              <ArrowUpRight size={19} />
            </a>
          </section>
          <section className="framework section-pad">
            <span className="eyebrow">BIG-MSEED</span>
            <h2>
              {locale === "en"
                ? "Designed for continuity."
                : "مصمم لاستمرار التعلم."}
            </h2>
            <p>
              {locale === "en"
                ? "Our emergency education approach connects adaptable learning spaces with coordinated logistics and deployment planning. Talk to our team about the context, requirements and practical details of your response."
                : "يربط نهجنا للتعليم في الطوارئ بين المساحات القابلة للتكيّف والخدمات اللوجستية والتخطيط للتجهيز. تواصل مع فريقنا لمناقشة الظروف والاحتياجات والتفاصيل العملية للاستجابة."}
            </p>
          </section>
        </>
      )}
      {contactPage ? (
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
      ) : (
        <ContactCTA locale={locale} />
      )}
    </main>
  );
}

function CoreValues({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <section className="values section-pad core-values">
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

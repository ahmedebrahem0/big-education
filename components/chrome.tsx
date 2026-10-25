"use client";
import { AnimatedNavLogo } from "./animated-nav-logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { contact, copy, type Locale } from "@/content/site";
export function Header({ locale }: { locale: Locale }) {
  const c = copy[locale],
    pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const nav = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [section, setSection] = useState("top");
  const links = [
    ["solutions", c.nav[0]],
    ["vision", c.nav[1]],
    ["emergency", c.nav[2]],
    ["values", locale === "ar" ? c.valuesLabel : "Our commitment"],
  ];
  // Which nav link owns each page section (scrollspy).
  const owner: Record<string, string> = {
    "big-picture": "vision",
    vision: "vision",
    approach: "solutions",
    solutions: "solutions",
    spaces: "solutions",
    media: "solutions",
    factory: "solutions",
    emergency: "emergency",
    values: "values",
  };
  const current = owner[section];

  // Scroll state: glass after the hero top, hide when scrolling down, progress line.
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      header.current?.style.setProperty("--sp", String(max > 0 ? y / max : 0));
      setScrolled(y > 40);
      if (y > 400 && y > last + 4) setHidden(true);
      else if (y < last - 4 || y <= 400) setHidden(false);
      last = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const ids = ["top", ...Object.keys(owner)];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) setSection(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sliding underline under the active link.
  useLayoutEffect(() => {
    const place = () => {
      const bar = nav.current;
      if (!bar) return;
      const el = current
        ? bar.querySelector<HTMLElement>(`[data-id="${current}"]`)
        : null;
      bar.style.setProperty("--ux", el ? `${el.offsetLeft}px` : "0px");
      bar.style.setProperty("--uw", el ? `${el.offsetWidth}px` : "0px");
      bar.dataset.on = el ? "1" : "0";
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [current, locale]);

  useEffect(() => {
    if (!open) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
      if (e.key === "Tab") {
        const nodes = panel.current?.querySelectorAll<HTMLElement>("a,button");
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", handler);
    };
  }, [open]);
  const switchPath = pathname.replace(
    /^\/(en|ar)(?=\/|$)/,
    locale === "en" ? "/ar" : "/en",
  );
  return (
    <header
      className="site-header"
      ref={header}
      data-scrolled={scrolled}
      data-hidden={hidden && !open}
    >
      <Link href={`/${locale}`} aria-label="BIG Education" className="logo">
        <AnimatedNavLogo />
      </Link>
      <nav
        ref={nav}
        className="desktop-nav"
        aria-label={locale === "ar" ? "التنقل الرئيسي" : "Main navigation"}
      >
        {links.map(([p, t]) => (
          <Link
            key={p}
            data-id={p}
            href={`/${locale}#${p}`}
            aria-current={current === p ? "location" : undefined}
          >
            {t}
          </Link>
        ))}
        <span className="nav-indicator" aria-hidden="true" />
      </nav>
      <div className="header-actions">
        <Link
          className="language"
          href={switchPath}
          lang={locale === "en" ? "ar" : "en"}
        >
          {locale === "en" ? "العربية" : "EN"}
        </Link>
        <Link className="header-contact" href={`/${locale}#contact`}>
          {c.nav[3]} <ArrowUpRight size={17} />
        </Link>
        <button
          ref={trigger}
          className="menu-toggle"
          aria-label={c.menu}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </button>
      </div>
      <i className="header-progress" aria-hidden="true" />
      {open && (
        <div
          id="mobile-menu"
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={c.menu}
          ref={panel}
        >
          <Link
            className="mobile-home"
            onClick={() => setOpen(false)}
            href={`/${locale}`}
          >
            BIG EDUCATION
          </Link>
          {links.map(([p, t]) => (
            <Link
              onClick={() => setOpen(false)}
              key={p}
              href={`/${locale}#${p}`}
            >
              {t}
              <ArrowUpRight />
            </Link>
          ))}
          <Link onClick={() => setOpen(false)} href={`/${locale}#contact`}>
            {c.nav[3]}
            <ArrowUpRight />
          </Link>
          <button
            className="menu-close"
            onClick={() => {
              setOpen(false);
              trigger.current?.focus();
            }}
            aria-label={c.close}
          >
            <X />
          </button>
        </div>
      )}
    </header>
  );
}
export function Footer({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const ar = locale === "ar";
  return (
    <footer className="footer">
      <div className="footer-cols">
        <div className="footer-brand">
          <Link href={`/${locale}`} className="footer-logo" aria-label="BIG Education">
            <AnimatedNavLogo />
          </Link>
          <p>{c.footer}</p>
        </div>
        <div className="footer-col">
          <span>{c.email}</span>
          <a href={`mailto:${contact.email}`}>
            {contact.email}
            <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="footer-col">
          <span>{c.call}</span>
          {contact.phones.map((p) => (
            <a key={p} href={`tel:${p}`} dir="ltr">
              {p.replace(/(\d{3})(\d{2})(\d{4})(\d{2})/, "$1 $2 $3 $4")}
              <ArrowUpRight size={15} />
            </a>
          ))}
        </div>
        <nav
          className="footer-col"
          aria-label={ar ? "روابط أسفل الصفحة" : "Footer links"}
        >
          <span>{ar ? "استكشف" : "EXPLORE"}</span>
          <Link href={`/${locale}#solutions`}>{c.nav[0]}</Link>
          <Link href={`/${locale}#vision`}>{c.nav[1]}</Link>
          <Link href={`/${locale}#emergency`}>{c.nav[2]}</Link>
          <Link href={`/${locale}#values`}>{ar ? c.valuesLabel : "Our commitment"}</Link>
          <Link href={`/${locale}#contact`}>{c.nav[3]}</Link>
        </nav>
        <div className="footer-col">
          <span>BIG GROUP</span>
          <a href={contact.group} target="_blank" rel="noreferrer">
            big-egypt.com
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {c.rights}</span>
        <span>{c.concept}</span>
        <span>{ar ? "مصر · إلى العالم" : "EGYPT · BUILT FOR THE WORLD"}</span>
        <a
          className="back-top"
          href="#main"
          aria-label={ar ? "إلى أعلى الصفحة" : "Back to top"}
        >
          ↑
        </a>
      </div>
    </footer>
  );
}

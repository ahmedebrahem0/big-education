"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { contact, copy, type Locale } from "@/content/site";
export function Header({ locale }: { locale: Locale }) {
  const c = copy[locale],
    pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const links = [
    ["solutions", c.nav[0]],
    ["about", c.nav[1]],
    ["emergency-education", c.nav[2]],
  ];
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
    <header className="site-header">
      <Link href={`/${locale}`} aria-label="BIG Education" className="logo">
        <Image
          src="/brand/logo.svg"
          width={156}
          height={55}
          alt="BIG Education"
          preload
        />
      </Link>
      <nav
        className="desktop-nav"
        aria-label={locale === "ar" ? "التنقل الرئيسي" : "Main navigation"}
      >
        {links.map(([p, t]) => (
          <Link
            key={p}
            href={`/${locale}/${p}`}
            aria-current={pathname === `/${locale}/${p}` ? "page" : undefined}
          >
            {t}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <Link
          className="language"
          href={switchPath}
          lang={locale === "en" ? "ar" : "en"}
        >
          {locale === "en" ? "العربية" : "EN"}
        </Link>
        <Link className="header-contact" href={`/${locale}/contact`}>
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
              href={`/${locale}/${p}`}
            >
              {t}
              <ArrowUpRight />
            </Link>
          ))}
          <Link onClick={() => setOpen(false)} href={`/${locale}/contact`}>
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
  return (
    <footer className="footer">
      <div className="footer-top">
        <Link href={`/${locale}`} className="footer-logo">
          <Image
            src="/brand/logo.svg"
            width={190}
            height={70}
            alt="BIG Education"
          />
        </Link>
        <p>{c.footer}</p>
        <a
          className="back-top"
          href="#main"
          aria-label={locale === "ar" ? "إلى أعلى الصفحة" : "Back to top"}
        >
          ↑
        </a>
      </div>
      <div className="footer-links">
        <div>
          <span>{c.email}</span>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </div>
        <nav
          aria-label={locale === "ar" ? "روابط أسفل الصفحة" : "Footer links"}
        >
          <Link href={`/${locale}/solutions`}>{c.nav[0]}</Link>
          <Link href={`/${locale}/about`}>{c.nav[1]}</Link>
          <Link href={`/${locale}/contact`}>{c.nav[3]}</Link>
        </nav>
        <a href={contact.group} target="_blank" rel="noreferrer">
          BIG Group <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="footer-bottom">
        <span>© {c.rights}</span>
        <span>{c.concept}</span>
        <span>
          EGYPT · {locale === "en" ? "BUILT FOR THE WORLD" : "إلى العالم"}
        </span>
      </div>
    </footer>
  );
}

import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/chrome";
import { copy, type Locale } from "@/content/site";
import "../globals.css";
const alexandria = localFont({
  src: "../../public/fonts/alexandria.ttf",
  display: "swap",
  variable: "--font-brand",
});
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "en" && locale !== "ar") notFound();
  const l = locale as Locale;
  return (
    <html
      lang={l}
      dir={l === "ar" ? "rtl" : "ltr"}
      className={alexandria.variable}
    >
      <body>
        <a className="skip-link" href="#main">
          {copy[l].skip}
        </a>
        <Header locale={l} />
        {children}
        <Footer locale={l} />
      </body>
    </html>
  );
}

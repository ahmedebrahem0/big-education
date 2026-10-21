import { notFound, redirect } from "next/navigation";
import { copy, type Locale } from "@/content/site";
import { Home } from "@/components/pages";
import type { Metadata } from "next";
// Route content depends on the complete optional path, including unknown URLs.
export const instant = false;
type Props = { params: Promise<{ locale: string; slug?: string[] }> };
// Old sub-pages now live as sections of the single page.
const legacy: Record<string, string> = {
  about: "vision",
  solutions: "solutions",
  "solutions/educational-spaces": "spaces",
  "solutions/educational-media": "media",
  "emergency-education": "emergency",
  contact: "contact",
};
export function generateStaticParams() {
  return ["en", "ar"].flatMap((locale) => [
    { locale, slug: [] },
    ...Object.keys(legacy).map((path) => ({ locale, slug: path.split("/") })),
  ]);
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const l = locale === "ar" ? "ar" : "en";
  const c = copy[l];
  return {
    title: "BIG Education — " + c.headline.join(" "),
    description: c.intro,
    alternates: { languages: { en: "/en", ar: "/ar" } },
  };
}
export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const path = slug?.join("/") || "";
  if (!["en", "ar"].includes(locale)) notFound();
  if (path) {
    if (!(path in legacy)) notFound();
    redirect(`/${locale}#${legacy[path]}`);
  }
  return <Home locale={locale as Locale} />;
}

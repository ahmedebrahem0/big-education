import { notFound } from "next/navigation";
import { copy, paths, type Locale } from "@/content/site";
import { Home, InnerPage } from "@/components/pages";
import type { Metadata } from "next";
// Route content depends on the complete optional path, including unknown URLs.
export const instant = false;
type Props = { params: Promise<{ locale: string; slug?: string[] }> };
export function generateStaticParams() {
  return ["en", "ar"].flatMap((locale) =>
    paths.map((path) => ({ locale, slug: path ? path.split("/") : [] })),
  );
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const l = locale === "ar" ? "ar" : "en";
  const path = slug?.join("/") || "";
  const c = copy[l];
  const title =
    path === "about"
      ? c.nav[1]
      : path === "contact"
        ? c.nav[3]
        : path === "solutions"
          ? c.nav[0]
          : c.services.find((s) => s.path === path)?.category;
  return {
    title: title
      ? `${title} — BIG Education`
      : "BIG Education — " + c.headline.join(" "),
    description: c.intro,
    alternates: {
      languages: {
        en: "/en" + (path ? "/" + path : ""),
        ar: "/ar" + (path ? "/" + path : ""),
      },
    },
  };
}
export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const path = slug?.join("/") || "";
  if (!["en", "ar"].includes(locale) || !paths.includes(path)) notFound();
  return path ? (
    <InnerPage locale={locale as Locale} path={path} />
  ) : (
    <Home locale={locale as Locale} />
  );
}

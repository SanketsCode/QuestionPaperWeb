"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageContext";

const primaryNavItems = [
  { href: "/home", label: "Home" },
  { href: "/paper", label: "Papers" },
  { href: "/test", label: "Tests" },
  { href: "/competitions", label: "Competitions" },
];

const secondaryNavItems = [
  { href: "/results", label: "Results" },
  { href: "/my-academy", label: "My Academy" },
  { href: "/subscription", label: "Subscription" },
  { href: "/profile", label: "Profile" },
];

const allNavItems = [...primaryNavItems, ...secondaryNavItems];

const hideShellPrefixes = [
  "/login",
  "/verify-otp",
  "/question-paper",
  "/competitions/",
];

const hideShellExact = ["/", "/competitions"];

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const publicRoutes = ["/", "/login", "/verify-otp"];
    if (publicRoutes.includes(pathname)) return;
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("qp_access_token");
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  const hideShell =
    hideShellExact.includes(pathname) ||
    hideShellPrefixes.some(prefix => pathname.startsWith(prefix));

  if (hideShell) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
          <Link href="/home" className="flex items-center gap-2 font-display">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
              QP
            </span>
            QuestionPaper
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-muted lg:flex">
            {primaryNavItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`hover:text-foreground ${
                  pathname.startsWith(item.href) ? "text-foreground" : ""
                }`}
              >
                {item.label === "Home" ? t("nav.home") :
                 item.label === "Papers" ? t("nav.papers") :
                 item.label === "Tests" ? t("nav.tests") :
                 item.label === "Competitions" ? t("nav.competitions") : item.label}
              </Link>
            ))}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`flex items-center gap-1 hover:text-foreground ${
                  secondaryNavItems.some(i => pathname.startsWith(i.href))
                    ? "text-foreground"
                    : ""
                }`}
              >
                {t("nav.more")}
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform ${
                    moreMenuOpen ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M1 1L5 5L9 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {moreMenuOpen && (
                <div
                  className="absolute top-full mt-2 w-48 rounded-2xl border border-border bg-white p-2 shadow-xl"
                  onMouseLeave={() => setMoreMenuOpen(false)}
                >
                  {secondaryNavItems.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreMenuOpen(false)}
                      className={`block rounded-xl px-4 py-2 hover:bg-muted/10 ${
                        pathname.startsWith(item.href)
                          ? "bg-muted/5 font-semibold text-foreground"
                          : ""
                      }`}
                    >
                      {item.label === "Results" ? t("nav.results") :
                       item.label === "My Academy" ? t("nav.academy") :
                       item.label === "Subscription" ? t("nav.subscription") :
                       item.label === "Profile" ? t("nav.profile") : item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/notifications"
              className="hidden rounded-full border border-border px-4 py-2 text-sm font-semibold md:inline-flex"
            >
              {t("nav.notifications")}
            </Link>
            <Link
              href="/create-test"
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
            >
              {t("nav.createTest")}
            </Link>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold focus:outline-none"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="mr">MR</option>
            </select>
            <button
              className="inline-flex items-center justify-center rounded-full border border-border p-2 lg:hidden"
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label="Toggle menu"
            >
              <span className="h-2 w-2 rounded-full bg-foreground" />
            </button>
          </div>
        </div>
        {menuOpen ? (
          <div className="border-t border-border bg-white/95 px-6 py-4 lg:hidden">
            <div className="flex flex-col gap-3 text-sm">
              {allNavItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`py-2 text-muted hover:text-foreground ${
                    pathname.startsWith(item.href)
                      ? "font-semibold text-foreground"
                      : ""
                  }`}
                >
                  {item.label === "Home" ? t("nav.home") :
                   item.label === "Papers" ? t("nav.papers") :
                   item.label === "Tests" ? t("nav.tests") :
                   item.label === "Competitions" ? t("nav.competitions") :
                   item.label === "Results" ? t("nav.results") :
                   item.label === "My Academy" ? t("nav.academy") :
                   item.label === "Subscription" ? t("nav.subscription") :
                   item.label === "Profile" ? t("nav.profile") : item.label}
                </Link>
              ))}
              <hr className="border-border" />
              <Link
                href="/notifications"
                onClick={() => setMenuOpen(false)}
                className="py-2 text-muted hover:text-foreground"
              >
                {t("nav.notifications")}
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <main>{children}</main>

      <footer className="border-t border-border bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-xs text-muted md:flex-row md:items-center md:justify-between md:px-10">
          <div>{t("nav.copyright")}</div>
          <div className="flex flex-wrap gap-6">
            <Link href="/subscription">{t("nav.plans")}</Link>
            <Link href="/notifications">{t("nav.notifications")}</Link>
            <Link href="/profile">{t("nav.profile")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

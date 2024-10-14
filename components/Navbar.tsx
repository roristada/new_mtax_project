"use client";
// import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

import { usePathname } from "next/navigation";
import { Link } from "../i18n/routing";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface User {
  id: number;
  email: string;
  role: string;
  exp: string;
}

const links = [
  {
    id: 1,
    title: "Home",
    url: "/",
  },
  {
    id: 2,
    title: "About",
    url: "#about",
  },
  {
    id: 3,
    title: "Services",
    url: "#service",
  },
  {
    id: 4,
    title: "Knowledge",
    url: "/blog",
  },
  {
    id: 5,
    title: "Contact",
    url: "#contact",
  },
  {
    id: 6,
    title: "Appointment",
    url: "/appointment",
  },
];

const Navbar = () => {
  const { data: session, status } = useSession();
  const [dashboardPath, setDashboardPath] = useState("");
  const [supportPath, setSupportPath] = useState("");
  const pathname = usePathname();
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const router = useRouter();

  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    // Fallback for server-side rendering
    return (
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://newmtaxproject-production.up.railway.app/"
    );
  };

  useEffect(() => {
    if (session && session.user) {
      const role = session.user.role;
      if (role === "admin") {
        setDashboardPath("/dashboard/admin");
        setSupportPath("/support/admin");
      } else if (role === "customer") {
        setDashboardPath(`/dashboard/${session.user.id}`);
        setSupportPath(`/support/${session.user.id}`);
      }
      const expires_session = new Date(session.expires).getTime();
      const nowDate = Date.now();

      if (expires_session < nowDate) {
        signOut({ callbackUrl: `${getBaseUrl()}/` });
        // signOut({ callbackUrl: `/`});
      }
    }
  }, [session]);

  console.log("session Nav", session);

  const getHref = (url: string) => {
    if (url.startsWith("#") && pathname !== "/") {
      return `/${url}`;
    }
    return url;
  };

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    const targetId = e.currentTarget.getAttribute("href");
    if (pathname === "/" && targetId && targetId.startsWith("#")) {
      e.preventDefault();
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const toggleLanguage = () => {
    const newLocale = locale === "en" ? "th" : "en";
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  const links = [
    { id: 1, title: t("home"), url: "/" },
    { id: 2, title: t("about"), url: "#about" },
    { id: 3, title: t("services"), url: "#service" },
    { id: 4, title: t("knowledge"), url: "/blog" },
    { id: 5, title: t("contact"), url: "#contact" },
    { id: 6, title: t("appointment"), url: "/appointment" },
  ];

  return (
    <nav className="bg-white border-gray-200 shadow-md">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-5">
        <Link className="text-2xl font-medium" href="/">
          <span className="text-blue-500">M</span>
          <span className="text-red-500">tax</span>
        </Link>
        <div className="hidden w-full md:flex md:w-auto" id="navbar-default">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white">
            {links.map((link) => (
              <li key={link.id} className="my-auto">
                <Link
                  className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-dark md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                  href={getHref(link.url)}
                  onClick={smoothScroll}
                >
                  {link.title}
                </Link>
              </li>
            ))}

            {status === "authenticated" && session.user ? (
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="overflow-hidden rounded-full"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-user"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t("myAccount")}</DropdownMenuLabel>
                    <DropdownMenuLabel className="font-normal">
                      {session.user.company}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href={dashboardPath}>{t("dashboard")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={supportPath}>{t("support")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        signOut({ callbackUrl: `${getBaseUrl()}/` })
                      }
                    >
                      {t("logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div>
                <Link href={"/login"}>
                  <Button className="w-20">{t("login")}</Button>
                </Link>
              </div>
            )}
            <li className="my-auto">
              <Button onClick={toggleLanguage} variant="outline" size="sm">
                {locale === "en" ? "EN" : "TH"}
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

"use client";
import Link from "next/link";
import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

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

  useEffect(() => {
    if (session && session.user) {
      const expires_session = new Date(session.expires).getTime(); 
      const nowDate = Date.now(); 
      // console.log("Session expires at:", expires_session);
      // console.log("Current time:", nowDate);
  
      if (expires_session  < nowDate) {
        signOut({ callbackUrl: "/" });
      }
    }
  }, [session]);

  console.log("session Nav", session);
  //console.log("status", status);

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    const targetId = e.currentTarget.getAttribute("href");
    if (targetId && targetId.startsWith("#")) {
      e.preventDefault();
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <nav className=" bg-white border-gray-200 shadow-md">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-5">
        <Link className="text-2xl font-medium" href="/">
          <span className="text-blue-500">M</span>
          <span className="text-red-500">tax</span>
        </Link>
        <div className="hidden. w-full md:block md:w-auto" id="navbar-default">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white ">
            {links.map((link) => (
              <li key={link.id} className="my-auto">
                <Link
                  className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-dark md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                  key={link.id}
                  href={link.url}
                  onClick={smoothScroll}
                >
                  {link.title}
                </Link>
              </li>
            ))}

            {/* {user ? (
              <li className="my-auto">
                {user.role === "admin" ? (
                  <span className="text-gray-900 mr-2">
                    <Link href={"/dashboard/admin_db"}>Admin:{user.email}</Link>
                  </span>
                ) : (
                  <Link href={"/dashboard"}>
                    <span className="text-gray-900 mr-2">
                      User:{user.email}
                    </span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Logout
                </button>
              </li>
            ) : (
              <li className="my-auto">
                <Link href={"/login"}>
                  <button
                    type="button"
                    className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 "
                  >
                    Login
                  </button>
                </Link>
              </li>
            )} */}
            {status === "authenticated" && session.user ? (
              <div>
                <Button
                  className="w-20"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <div>
                <Link href={"/login"}>
                  <Button className="w-20">Login</Button>
                </Link>
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

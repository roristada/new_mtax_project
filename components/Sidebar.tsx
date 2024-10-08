"use client";
import Link from "next/link";
import {
  Home,
  Users2,
  LineChart,
  MessageSquareWarning,
  Package2,
  PanelLeft,
  Settings,
  CalendarPlus2,
  UserRoundPen,
  LibraryBig,
  BarChartBig,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { useParams, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMemo, useCallback } from "react";

const adminLinks = [
  { id: 1, title: "Home", url: "/dashboard/admin", icon: Home },
  {
    id: 2,
    title: "Appointment",
    url: "/appointment/admin",
    icon: CalendarPlus2,
  },
  { id: 3, title: "Register", url: "/register", icon: UserRoundPen },
  { id: 4, title: "Blog", url: "/blog/admin", icon: LibraryBig },
  { id: 5, title: "Support", url: "/support/admin", icon: MessageSquareWarning },
  // New Overview link for admin
  { id: 6, title: "Overview", url: "/dashboard/:id", icon: LayoutDashboard },
  { id: 7, title: "Employee", url: "/dashboard/:id/employee", icon: Users2 },
  {
    id: 8,
    title: "Data Details",
    url: "/dashboard/:id/data_details",
    icon: BarChartBig,
  },
];

const customerLinks = [
  { id: 1, title: "Home", url: "/dashboard/:id", icon: Home },
  { id: 2, title: "Employee", url: "/dashboard/:id/employee", icon: Users2 },
  { id: 3, title: "Data Details", url: "/dashboard/:id/data_details", icon: LineChart },
  {
    id: 4,
    title: "Support",
    url: "/support/:id",
    icon: MessageSquareWarning,
  },
];

export default function Sidebar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const id = params.slug as string;

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    // Fallback for server-side rendering
    return process.env.NEXT_PUBLIC_BASE_URL || 'localhost:3000';
  };

  const getUrl = useCallback((url: string) => url.replace(":id", id), [id]);

  useEffect(() => {
    const handleAuthentication = async () => {
      if (status === "authenticated") {
        if (session?.user?.role === "admin") {
          if (session && session.user) {
            const expires_session = new Date(session.expires).getTime();
            const nowDate = Date.now();
            if (expires_session < nowDate) {
              await signOut({ callbackUrl: `${getBaseUrl()}/`});
            }
          }
        }
       } 
       //else if (status === "unauthenticated") {
      //   router.push("/login");
      // }
    };

    handleAuthentication();
  }, [status, session, router]); // Add router to the dependency array

  const isAdminOnUserDashboard =
    session?.user?.role === "admin" &&
    pathname.startsWith("/dashboard/") &&
    pathname !== "/dashboard/admin" &&
    pathname !== "/dashboard/formUpload";
  const links = useMemo(() => {
    if (session?.user?.role === "admin") {
      return isAdminOnUserDashboard
        ? [...adminLinks]
        : adminLinks.filter(
            (link) => link.id !== 6 && link.id !== 7 && link.id !== 8
          ); // Remove Overview link if not on user dashboard
    }
    return customerLinks;
  }, [session?.user?.role, isAdminOnUserDashboard]);

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-[10%] flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
              href="/"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-10 md:w-full md:text-base"
            >
              <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
              <span>Mtax</span>
              <span className="sr-only">Mtax</span>
            </Link>
            {links.map((link) => (
              <Tooltip key={link.id}>
                <TooltipTrigger asChild>
                  <Link
                    href={getUrl(link.url)}
                    className={`flex h-9 w-9 items-center rounded-lg transition-colors md:h-8 md:w-full p-5 gap-2 ${
                      pathname === getUrl(link.url)
                        ? "bg-[#EDF9FD] text-gray-500"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.icon && <link.icon className="h-5 w-5" />}
                    <span className="hidden lg:block">{link.title}</span>
                    {/* The text is hidden on small screens (sm and below) and only shown on medium screens (md and above) */}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{link.title}</TooltipContent>
              </Tooltip>
            ))}
          </nav>
          <nav className="mt-auto flex flex-col md:block gap-4 px-2 sm:py-5">
            <div className="flex items-center mx-auto md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-full p-2 gap-2"
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
                      className="lucide lucide-user rounded-full border"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>

                    <label className="hidden md:block" htmlFor="">
                      {session?.user?.company}
                    </label>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>
                    {session?.user?.role?.toUpperCase()}:{" "}
                    {session?.user?.company}
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: `${getBaseUrl()}/` })}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
        </aside>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-xs">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link
                    href="#"
                    className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                  >
                    <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                    <span className="sr-only">Mtax</span>
                  </Link>
                  {links.map((link) => (
                    <Link
                      key={link.id}
                      href={getUrl(link.url)}
                      className={`flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground ${
                        pathname === getUrl(link.url) && "text-foreground"
                      }`}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.title}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </header>
        </div>
      </div>
    </TooltipProvider>
  );
}

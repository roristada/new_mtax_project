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
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useParams, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const adminLinks = [
  { id: 1, title: "Home", url: "/dashboard/admin", icon: Home },
  { id: 2, title: "Appointment", url: "/appointment/admin", icon: CalendarPlus2 },
  { id: 3, title: "Register", url: "/register", icon: UserRoundPen },
  { id: 4, title: "Blog", url: "/blog/admin", icon: LibraryBig },
  { id: 5, title: "Chat", url: "/chat", icon: MessageSquareWarning },
  // New Overview link for admin
  { id: 6, title: "Overview", url: "/dashboard/:id", icon: LayoutDashboard },
  { id: 7, title: "Employee", url: "/dashboard/:id/employee", icon: Users2 },
  { id: 8, title: "Compare Data", url: "/dashboard/:id/compare", icon: BarChartBig },
];

const customerLinks = [
  { id: 1, title: "Home", url: "/dashboard/:id", icon: Home },
  { id: 2, title: "Employee", url: "/dashboard/:id/employee", icon: Users2 },
  { id: 3, title: "Analytics", url: "/dashboard/:id/compare", icon: LineChart },
  {
    id: 4,
    title: "Support Chat",
    url: "/dashboard/:id/support",
    icon: MessageSquareWarning,
  },
];



export default function Sidebar({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const id = params.slug as string;

  const getUrl = (url: string) => url.replace(":id", id);

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role === "admin") {
        if (session && session.user) {
          const expires_session = new Date(session.expires).getTime();
          const nowDate = Date.now();
          if (expires_session < nowDate) {
            signOut({ callbackUrl: "/" });
          }
        }
      }
    }
    else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, []);

  const isAdminOnUserDashboard = session?.user?.role === "admin" && pathname.startsWith("/dashboard/") && pathname !== "/dashboard/admin";
  const links = session?.user?.role === "admin" 
  ? isAdminOnUserDashboard 
    ? [...adminLinks]
    : adminLinks.filter(link => link.id !== 6 && link.id !== 7 && link.id !== 8)  // Remove Overview link if not on user dashboard
  : customerLinks;

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
              href="/"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
              <span className="sr-only">Mtax</span>
            </Link>
            {links.map((link) => (
              <Tooltip key={link.id}>
                <TooltipTrigger asChild>
                  <Link
                    href={getUrl(link.url)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${
                      pathname === getUrl(link.url)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.icon && <link.icon className="h-5 w-5" />}
                    <span className="sr-only">{link.title}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{link.title}</TooltipContent>
              </Tooltip>
            ))}
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
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
           
            <div className="flex items-center ml-auto">
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
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
         
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}

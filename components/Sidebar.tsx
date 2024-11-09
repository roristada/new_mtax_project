"use client";
import { Link } from "../i18n/routing";
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
  LogOut,
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
import { useMemo, useCallback, useState } from "react";
import { useTranslations } from "next-intl";

const adminLinks = [
  { id: 1, title: "home", url: "/dashboard/admin", icon: Home },
  { id: 2, title: "profile", url: "/profile", icon: UserRoundPen },
  {
    id: 3,
    title: "appointment",
    url: "/appointment/admin",
    icon: CalendarPlus2,
  },
  { id: 4, title: "register", url: "/register", icon: UserRoundPen },
  { id: 5, title: "blog", url: "/blog/admin", icon: LibraryBig },
  {
    id: 6,
    title: "support",
    url: "/support/admin",
    icon: MessageSquareWarning,
  },
  // New Overview link for admin
  { id: 7, title: "overview", url: "/dashboard/:id", icon: LayoutDashboard },
  { id: 8, title: "employee", url: "/dashboard/:id/employee", icon: Users2 },
  {
    id: 9,
    title: "dataDetails",
    url: "/dashboard/:id/data_details",
    icon: BarChartBig,
    subMenu: [
      { id: 'data_visualization', title: 'dataVisualization', url: '/dashboard/:id/data_details/data_visualization' },
      { id: 'financial-overview', title: 'financialOverview', url: '/dashboard/:id/data_details/financial-overview' },
      { id: 'financial-breakdown', title: 'financialBreakdown', url: '/dashboard/:id/data_details/financial-breakdown' },
      { id: 'commission-diligence', title: 'commissionDiligence', url: '/dashboard/:id/data_details/commission-diligence' },
    ]
  },
];

const customerLinks = [
  { id: 1, title: "home", url: "/dashboard/:id", icon: Home },
  { id: 2, title: "profile", url: "/profile", icon: UserRoundPen },
  { id: 3, title: "employee", url: "/dashboard/:id/employee", icon: Users2 },
  {
    id: 4,
    title: "dataDetails",
    url: "/dashboard/:id/data_details",
    icon: LineChart,
    subMenu: [
      { id: 'data_visualization', title: 'dataVisualization', url: '/dashboard/:id/data_details/data_visualization' },
      { id: 'financial-overview', title: 'financialOverview', url: '/dashboard/:id/data_details/financial-overview' },
      { id: 'financial-breakdown', title: 'financialBreakdown', url: '/dashboard/:id/data_details/financial-breakdown' },
      { id: 'commission-diligence', title: 'commissionDiligence', url: '/dashboard/:id/data_details/commission-diligence' },
    ]
  },
  {
    id: 5,
    title: "support",
    url: "/support/:id",
    icon: MessageSquareWarning,
  },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  // ดึง ID จาก params หรือ session
  const id = params?.slug || (session?.user?.role === 'customer' ? session?.user?.id : '');

  // ตรวจสอบว่า admin กำลังดูข้อมูลของ customer หรือไ���่
  const isAdminOnUserDashboard = useMemo(() => {
    const isAdmin = session?.user?.role === 'admin';
    const hasSlug = Boolean(params?.slug);
    const isUserDashboard = pathname?.includes(`/dashboard/${params?.slug}`);
    const isNotAdminDashboard = !pathname?.includes('/dashboard/admin');

    return isAdmin && hasSlug && isUserDashboard && isNotAdminDashboard;
  }, [session?.user?.role, pathname, params?.slug]);

  // สร้าง links ตาม role
  const links = useMemo(() => {
    console.log('Current role:', session?.user?.role);
    console.log('isAdminOnUserDashboard:', isAdminOnUserDashboard);
    
    if (session?.user?.role === 'admin') {
      // แสดงทุก link เมื่อ admin อยู่ใน user dashboard
      if (isAdminOnUserDashboard) {
        console.log('Showing all admin links including 7,8,9');
        return [
          ...adminLinks.filter(link => link.id <= 6), // admin links
          ...adminLinks.filter(link => link.id >= 7)  // user dashboard links
        ];
      } else {
        console.log('Showing only admin links (1-6)');
        return adminLinks.filter(link => link.id <= 6);
      }
    }
    console.log('Showing customer links');
    return customerLinks;
  }, [session?.user?.role, isAdminOnUserDashboard]);

  const getUrl = useCallback((url: string) => {
    // ถ้าเป็น URL ของ profile หรือหน้า admin ไม่ต้องแทนที่ :id
    if (url === '/profile' || url.includes('/dashboard/admin')) {
      return url;
    }

    // ถ้าเป็น customer ใช้ id จาก session
    if (session?.user?.role === 'customer') {
      return url.replace(":id", session.user.id);
    }

    // ถ้าเป็น admin และมี params.slug (กำลังดูข้อมูลของ customer คนใดคนหนึ่ง)
    if (session?.user?.role === 'admin' && params?.slug) {
      return url.replace(":id", params.slug as string);
    }

    return url;
  }, [session, params?.slug]);

  const t = useTranslations("Sidebar");

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (id: string) => {
    setOpenSubmenu(openSubmenu === id ? null : id);
  };

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

  const currentPathname = new URL(pathname, getBaseUrl()).pathname;
  

  const isLinkActive = useCallback(
    (url: string) => {
      const currentUrl = getUrl(url);
      const languagePrefix = currentPathname.split("/")[1];
      const adjustedCurrentPathname = `/${languagePrefix}${currentUrl}`;
  
      if (url === '/dashboard/:id') {
        return currentPathname === adjustedCurrentPathname;
      }
  
      // Only match submenu items explicitly
      if (url.includes('data_details') && url.includes('sub_menu')) {
        return false;
      }
  
      // For submenu items, use exact matching
      if (url.includes('data_details/(sub_menu)')) {
        return currentPathname === adjustedCurrentPathname;
      }
  
      // For other items, continue using startsWith
      return currentPathname.startsWith(adjustedCurrentPathname);
    },
    [currentPathname, getUrl]
  );

  useEffect(() => {
    const handleAuthentication = async () => {
      if (status === "authenticated") {
        if (session?.user?.role === "admin") {
          if (session && session.user) {
            const expires_session = new Date(session.expires).getTime();
            const nowDate = Date.now();
            if (expires_session < nowDate) {
              await signOut({ callbackUrl: `${getBaseUrl()}/` });
              // await signOut({ callbackUrl: `/`});
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

  const languagePrefix = pathname.split("/")[1]; // Extract the language prefix
  const adjustedPathname = pathname.replace(`/${languagePrefix}`, ""); // Remove the prefix for comparison
console.log(session?.user?.role);
  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-[10%] flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
              href="/"
              className={`group flex h-12 w-full max-w-[200px] items-center justify-center rounded-lg px-4 text-xl font-bold text-white transition-all duration-300 ease-in-out hover:from-blue-700 hover:to-purple-700 hover:shadow-lg `}
            >
              <span className="text-2xl text-blue-500">M</span>
              <span className="relative">
                <span className="relative z-10 text-red-500">tax</span>
                <span className="absolute inset-x-0 bottom-0 h-2 w-full bg-white/20 transform skew-x-12"></span>
              </span>
              <span className="sr-only">Mtax</span>
            </Link>
            {links.map((link) => (
              <div key={link.id} className="w-full">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={link.subMenu ? '#' : getUrl(link.url)}
                      className={`flex items-center rounded-lg transition-all duration-300 ease-in-out md:w-full p-3 gap-2 relative overflow-hidden ${
                        isLinkActive(link.url)
                          ? "bg-gradient-to-r from-blue-200 to-purple-200 text-blue-800 shadow-sm"
                          : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => link.subMenu && toggleSubmenu(link.id.toString())}
                    >
                      {link.icon && (
                        <link.icon className={`h-5 w-5 ${isLinkActive(link.url) ? 'text-blue-700' : 'text-gray-500'}`} />
                      )}
                      <span className={`hidden lg:block relative z-10 font-medium ${
                        isLinkActive(link.url) ? 'text-blue-800' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {t(link.title)}
                      </span>
                      {isLinkActive(link.url) && (
                        <span className="absolute right-0 top-0 h-full w-1 bg-blue-400 rounded-l"></span>
                      )}
                      {link.subMenu && (
                        <span className={`ml-auto transform transition-transform duration-200 ${openSubmenu === link.id.toString() ? 'rotate-180' : ''}`}>▼</span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{t(link.title)}</TooltipContent>
                </Tooltip>
                {link.subMenu && openSubmenu === link.id.toString() && (
                  <div className="ml-4 mt-2 space-y-2">
                    {link.subMenu.map((subItem) => (
                      <Link
                        key={subItem.id}
                        href={getUrl(subItem.url)}
                        className={`block rounded-md py-2 px-3 text-sm ${
                          isLinkActive(subItem.url)
                            ? "bg-blue-100 text-blue-800"
                            : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {t(subItem.title)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <nav className="mt-auto flex flex-col md:block gap-4 px-2 sm:py-5">
            <div className="flex items-center mx-auto md:block">
              <Button
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2"
                onClick={() =>
                  signOut({
                    callbackUrl:
                      "https://newmtaxproject-production.up.railway.app/",
                  })
                }
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </Button>
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

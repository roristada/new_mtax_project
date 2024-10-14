import Topbar from "@/components/Topbar";
import Sidebar from "../../../components/Sidebar";

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  return (
    <div className="h-screen flex">
      <div className="w-[10%] md:w-[8%] lg:w-[16%] xl:w-[10%] p-4">
        <Sidebar/>
      </div>

      <div className="w-[90%] md:w-[92%] lg:w-[84%] xl:w-[90%] flex flex-col h-screen">
        <Topbar/>
        {children}
      </div>
    </div>
  );
}

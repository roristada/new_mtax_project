import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  return <Sidebar>{children}</Sidebar>;
}
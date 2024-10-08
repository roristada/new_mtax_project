import Sidebar from "../../components/Sidebar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex">
      <div className="w-[10%] md:w-[8%] lg:w-[16%] xl:w-[10%] p-4">
        <Sidebar/>
      </div>

      <div className="w-[90%] md:w-[92%] lg:w-[84%] xl:w-[90%] bg-[#F7F8FA]  flex flex-col my-5">
        {children}
      </div>
    </div>
  );
}

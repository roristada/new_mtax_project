import Sidebar from "@/components/Sidebar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (  
        <Sidebar>{children}</Sidebar> 
  );
}
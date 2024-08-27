import Sidebar from "@/components/Sidebar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Sidebar>{children}</Sidebar>
      </body>
    </html>
  );
}

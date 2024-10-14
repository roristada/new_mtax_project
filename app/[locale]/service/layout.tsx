import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen ">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

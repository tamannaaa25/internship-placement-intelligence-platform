import "./globals.css";
import SidebarLayout from "./components/SidebarLayout";

export const metadata = {
  title: "Placement Intelligence Platform",
  description: "Advanced Internship and Placement preparation tracker and resume analysis platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#030712]">
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  );
}

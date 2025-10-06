import "./css/style.css";

import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/providers/SessionProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "EventHub - Modern Event Management Platform",
  description: "Discover and book exciting events near you. EventHub offers seamless ticket purchasing, role-based access, and modern event management tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} bg-gray-50 font-inter tracking-tight text-gray-900 antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
            {children}
            <Toaster position="top-right" />
          </div>
        </Providers>
      </body>
    </html>
  );
}

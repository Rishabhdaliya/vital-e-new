import type { Metadata } from "next";
import "./globals.css";
import SessionWrapper from "@/lib/SessionWrapper";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/layout/headers";
import type React from "react";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import Footer from "@/components/layout/footer";
import Head from "next/head";
import Link from "next/link";

// Load fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Voucher Management System",
  description: "Manage and redeem vouchers with our easy-to-use platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <Link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={`${inter.variable} ${poppins.variable}`}>
        <SessionWrapper>
          {" "}
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <Toaster />
            {/* <Header /> */}
            <Navbar />
            {/* <RouteGuard> */}
            <div className="md:px-8 px-3 ">{children}</div>
            <Footer />
            {/* </RouteGuard> */}
          </ThemeProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}

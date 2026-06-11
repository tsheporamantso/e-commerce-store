import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Container from "@/components/global/Container";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Black Swans Furniture Store",
  description:
    "A nifty e-commerce-store application built with Next.js, Typescript and Tailwind CSS",
  keywords: [
    "Next.js",
    "Tailwind CSS",
    "TypeScript",
    "Conventional Commits",
    "React",
  ],
  creator: "Tshepo Ramantso",
  publisher: "Tshepo Ramantso",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <Container className="py-20">{children}</Container>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}

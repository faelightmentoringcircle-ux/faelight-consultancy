import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Faelight Business Consultancy — Systems, Mentoring & Experiences",
    template: "%s · Faelight Business Consultancy",
  },
  description:
    "Helping people become more capable. Helping businesses become easier to run. VA mentoring, operations systems and virtual experiences — with a little Faelight magic.",
  keywords: [
    "Faelight",
    "virtual assistant training",
    "operations consulting",
    "Notion systems",
    "SOP",
    "Philippines VA coach",
    "virtual team building",
  ],
  openGraph: {
    title: "Faelight Business Consultancy",
    description:
      "Systems that create freedom. People who can run them. People first. Systems second. Magic throughout.",
    type: "website",
    locale: "en_PH",
    siteName: "Faelight Business Consultancy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Faelight Business Consultancy",
    description: "People first. Systems second. Magic throughout.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}

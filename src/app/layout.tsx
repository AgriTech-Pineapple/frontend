import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Agritech — Farm Intelligence Platform",
  description: "Enterprise agricultural intelligence for plantation operators, agronomists and drone teams.",
  openGraph: {
    title: "Agritech — Farm Intelligence Platform",
    description: "Enterprise agricultural intelligence for plantation operators, agronomists and drone teams.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agritech — Farm Intelligence Platform",
    description: "Enterprise agricultural intelligence for plantation operators, agronomists and drone teams.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

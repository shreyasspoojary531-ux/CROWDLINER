import type { Metadata } from "next";
import { Inter, JetBrains_Mono, DM_Serif_Display } from "next/font/google";
import "./globals.css";

// Inter — all UI chrome (nav, buttons, body, captions). The workhorse.
const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

// JetBrains Mono — code, data values, micro-labels, terminal-style snippets.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

// DM Serif Display — editorial display headline only (serif authority on black).
const dmSerif = DM_Serif_Display({
  variable: "--font-serif-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "CrowdLiner — Premium Crowd Tracking & Planning",
  description:
    "Real-time crowd tracking, historical patterns, and predictive planning for transit stations, tech parks, shopping streets, and malls in Bengaluru.",
  keywords: [
    "CrowdLiner",
    "Bengaluru",
    "Crowd Tracking",
    "Live Commute",
    "Traffic",
    "Majestic Station",
    "Indiranagar",
    "Predictive Planning",
  ],
  authors: [{ name: "CrowdLiner Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${dmSerif.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-full bg-background text-foreground selection:bg-primary/20 selection:text-primary flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}

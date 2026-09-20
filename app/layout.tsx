import type { Metadata } from "next";
import "./globals.css";
import "./responsive.css";
import "./v3.css";
import "./v4.css";
import "./v5.css";
import "./v7.css";
import "./v8.css";
import "./v9.css";
import "./v10.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://axiom-scholars-deck.vmt9.chatgpt.site"),
  title: "Axiom: The Scholar's Deck",
  description: "Build a 16-card theorem, explore a radial Skill Tree, train across 12 grade levels, and challenge Aletheia's anomalies.",
  icons: { icon: "/axiom-logo.png", shortcut: "/axiom-logo.png", apple: "/axiom-logo.png" },
  openGraph: {
    title: "Axiom: The Scholar's Deck",
    description: "Build your theorem. Recalculate reality.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Axiom: The Scholar's Deck" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Axiom: The Scholar's Deck",
    description: "Build your theorem. Recalculate reality.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}

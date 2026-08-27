import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MKT-BOT - Hopper SE",
  description: "Affiliate operations and marketing automation console",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // Browser extensions can decorate the document element before React
    // hydrates (for example by adding the Material Design Lite `mdl-js`
    // class). Limit suppression to this root attribute boundary only.
    <html lang="vi" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

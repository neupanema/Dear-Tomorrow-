import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { themeInitScript } from "@/components/ui/ThemeProvider";

// Baloo 2 = playful headings / brand voice, Nunito = everyday body text.
// Both are wired up as CSS variables so Tailwind can reach them
// (see fontFamily.display / fontFamily.body in tailwind.config.ts).
const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Dear Tomorrow",
  description: "Leave something for the person you'll become.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: the init script adds the "dark" class to <html>
    // before React loads, which is intentional.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${baloo.variable} ${nunito.variable} font-body bg-cream`}>
        {/* No fixed width here anymore — each page decides its own layout:
            a centered "phone-width" column below the lg breakpoint, and a
            real sidebar + wide-content layout at lg and up. See
            components/layout/AppShell.tsx for the pattern most pages use. */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

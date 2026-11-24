import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "CreatorsMela · Collab Tracker",
  description:
    "Creator-brand collaboration tracker and automated talent workflow dashboard for CreatorsMela.",
};

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var t = localStorage.getItem('cm-theme') === 'dark' ? 'dark' : 'light';
    var root = document.documentElement;
    root.setAttribute('data-theme', t);
    root.classList.toggle('dark', t === 'dark');
    root.style.colorScheme = t;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full bg-[var(--bg)] text-[var(--text)] font-sans transition-colors duration-200 selection:bg-[var(--accent-soft)] selection:text-[var(--text)]">
        {children}
      </body>
    </html>
  );
}

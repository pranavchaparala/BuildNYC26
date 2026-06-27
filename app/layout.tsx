import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Loupe — AI Design Critique',
  description: 'An AI critique partner that analyzes your product flows for craft, not errors.',
  icons: { icon: '/icon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="bg-canvas text-ink-900 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

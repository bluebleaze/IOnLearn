import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from '@/lib/brand';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: `${APP_NAME} - ${APP_TAGLINE}`,
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logos/logoionlearnkecil.png', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: ['/logos/logoionlearnkecil.png'],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-slate-50 text-slate-900 dark:bg-[#0c0c0c] dark:text-slate-100 min-h-screen transition-colors duration-200">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

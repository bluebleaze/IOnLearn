import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from '@/lib/brand';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: `${APP_NAME} - ${APP_TAGLINE}`,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
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
      <body suppressHydrationWarning className="bg-slate-50 text-slate-900 dark:bg-[#0B0F17] dark:text-slate-100 min-h-screen transition-colors duration-200">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

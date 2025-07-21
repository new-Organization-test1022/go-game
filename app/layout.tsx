import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  title: '围棋对战平台 - Go Battle Platform',
  description: '专业的围棋对弈平台，支持完整围棋规则、实时目数计算、玩家管理与统计功能。Built with Next.js, React, and TypeScript.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <SWRConfig
          value={{
            fallback: {}
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}

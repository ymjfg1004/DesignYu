import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Design Yu',
  description: 'Design system token & component manager',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${inter.className} bg-gray-50 text-gray-900 h-full`}>
        <div className="h-full overflow-hidden">{children}</div>
      </body>
    </html>
  );
}

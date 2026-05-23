import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Wall Art Virtual Try-On | Preview Art in Your Space',
  description:
    'AI-powered wall art and frame virtual try-on. Upload a photo of your room and preview artwork, frames, and gallery layouts with realistic lighting and perspective.',
  keywords: [
    'wall art',
    'virtual try-on',
    'interior design',
    'art placement',
    'frame preview',
    'AI art',
    'room visualization',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}

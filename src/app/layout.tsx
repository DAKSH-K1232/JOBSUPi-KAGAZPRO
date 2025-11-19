import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'SwarResume | Your Voice, Your Career',
  description: 'Craft your professional resume with your voice. SwarResume is a modern, inclusive resume builder for the Bharat workforce.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      {children}
    </Providers>
  );
}

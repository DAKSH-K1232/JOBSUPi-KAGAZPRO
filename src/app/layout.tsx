'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider, useLanguage } from '@/context/language-context';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'SwarResume | Your Voice, Your Career',
  description: 'Craft your professional resume with your voice. SwarResume is a modern, inclusive resume builder for the Bharat workforce.',
};

function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { language } = useLanguage();

  return (
    <html lang={language} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${language === 'hi' ? 'font-hindi' : 'font-body'} antialiased min-h-screen`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FirebaseClientProvider>
      <LanguageProvider>
        <AppLayout>{children}</AppLayout>
      </LanguageProvider>
    </FirebaseClientProvider>
  );
}
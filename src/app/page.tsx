import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center animate-fade-in-up">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            SwarResume
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-muted-foreground">
            Your Voice, Your Career.
          </p>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Effortlessly craft a professional resume using just your voice. SwarResume is a modern, inclusive resume builder designed for everyone. Tell us your story, and we&apos;ll handle the rest.
          </p>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link href="/builder">
                Create Your Resume
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

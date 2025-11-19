import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-lg sm:inline-block">
            Kagaz<span className="text-accent">Pro</span>
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Future auth actions can be added here */}
        </div>
      </div>
    </header>
  );
}

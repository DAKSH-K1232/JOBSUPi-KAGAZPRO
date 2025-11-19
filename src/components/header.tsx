import Link from 'next/link';
import { LanguageSwitcher } from './language-switcher';
import { UserNav } from './user-nav';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex-1">
            {/* Left aligned content can go here */}
        </div>
        <div className="flex-1 flex justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg sm:inline-block">
              Kagaz<span className="text-accent">Pro</span>
            </span>
          </Link>
        </div>
        <div className="flex-1 flex justify-end items-center gap-2">
          <LanguageSwitcher />
          <UserNav />
        </div>
      </div>
    </header>
  );
}

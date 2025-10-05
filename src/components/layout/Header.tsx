'use client';

import ThemeToggle from '../ui/ThemeToggle';

export default function Header() {
  return (
    <header className="fixed top-0 right-0 z-30 p-4">
      <div className="flex items-center justify-end">
        <ThemeToggle />
      </div>
    </header>
  );
}

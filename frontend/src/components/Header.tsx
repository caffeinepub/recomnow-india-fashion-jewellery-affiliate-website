import React, { useState } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';

interface HeaderProps {
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

export default function Header({ onNavigate, currentPath = '/' }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate?.('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/generated/recomnow-logo.dim_200x200.png"
            alt="RecomNow India"
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover"
            onError={e => {
              (e.target as HTMLImageElement).src = '/assets/generated/recomnow-logo.dim_200x200.png';
            }}
          />
          <span className="font-bold text-lg text-foreground hidden sm:block">RecomNow India</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <button
              key={link.path}
              onClick={() => onNavigate?.(link.path)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPath === link.path
                  ? 'bg-pink-hot text-white'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => onNavigate?.('/products')}
            className="ml-2 btn-pink px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Shop Now
          </button>
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <button
              key={link.path}
              onClick={() => { onNavigate?.(link.path); setMobileOpen(false); }}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPath === link.path
                  ? 'bg-pink-hot text-white'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => { onNavigate?.('/products'); setMobileOpen(false); }}
            className="w-full btn-pink px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 mt-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Shop Now
          </button>
        </div>
      )}
    </header>
  );
}

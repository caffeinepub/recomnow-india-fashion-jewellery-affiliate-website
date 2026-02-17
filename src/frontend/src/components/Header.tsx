import { useState, memo, useCallback } from 'react';
import { Menu, X, Shield, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useIsCallerAdmin } from '../hooks/useQueries';
import OptimizedImage from './OptimizedImage';

interface HeaderProps {
  onAdminClick: () => void;
  onAdminLoginClick: () => void;
}

const Header = memo(({ onAdminClick, onAdminLoginClick }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const queryClient = useQueryClient();
  const { data: isAdmin } = useIsCallerAdmin();

  const handleLogout = useCallback(async () => {
    await logout();
    queryClient.clear();
  }, [logout, queryClient]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Fashion', href: '#fashion' },
    { name: 'Costume Jewellery', href: '#jewellery' },
    { name: 'Blog', href: '#blog' },
    { name: 'Festival Picks', href: '#festive' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="hidden md:flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <OptimizedImage
                src="/assets/generated/recomnow-logo.dim_200x200.png"
                alt="RecomNow India Logo"
                className="h-16 w-16 rounded-full ring-4 ring-gradient-rainbow"
                width={200}
                height={200}
                priority={true}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-magenta">RecomNow India</h1>
              <p className="text-sm text-muted-foreground max-w-md">
                Your guide to chic fashion, costume jewellery, and trendsetting accessories
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-6" aria-label="Main navigation">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-primary-magenta transition-colors"
              >
                {link.name}
              </a>
            ))}
            {isAuthenticated ? (
              <>
                <button
                  onClick={onAdminClick}
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary-magenta transition-colors"
                  aria-label="Open admin panel"
                >
                  <Shield className="h-4 w-4" aria-hidden="true" />
                  Admin Panel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full bg-gradient-rainbow text-white font-medium hover:opacity-90 transition-opacity"
                  aria-label="Logout from admin account"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={onAdminLoginClick}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-rainbow text-white font-medium hover:opacity-90 transition-opacity"
                aria-label="Login to admin account"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Admin Login
              </button>
            )}
          </nav>
        </div>

        <div className="md:hidden flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <OptimizedImage
              src="/assets/generated/recomnow-logo.dim_200x200.png"
              alt="RecomNow India Logo"
              className="h-12 w-12 rounded-full ring-2 ring-gradient-rainbow"
              width={200}
              height={200}
              priority={true}
            />
            <div>
              <h1 className="text-lg font-bold text-primary-magenta">RecomNow India</h1>
            </div>
          </div>

          <button
            onClick={toggleMobileMenu}
            className="p-2 text-foreground hover:text-primary-magenta transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 py-4">
            <nav className="flex flex-col gap-4" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="text-sm font-medium text-foreground hover:text-primary-magenta transition-colors"
                >
                  {link.name}
                </a>
              ))}
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      onAdminClick();
                      closeMobileMenu();
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary-magenta transition-colors"
                    aria-label="Open admin panel"
                  >
                    <Shield className="h-4 w-4" aria-hidden="true" />
                    Admin Panel
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="px-4 py-2 rounded-full bg-gradient-rainbow text-white font-medium hover:opacity-90 transition-opacity"
                    aria-label="Logout from admin account"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onAdminLoginClick();
                    closeMobileMenu();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-rainbow text-white font-medium hover:opacity-90 transition-opacity"
                  aria-label="Login to admin account"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Admin Login
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;

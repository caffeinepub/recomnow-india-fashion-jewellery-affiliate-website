import { memo } from 'react';
import { Crown } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface HeaderProps {
  currentRoute?: string;
}

const Header = memo(({ currentRoute = '/' }: HeaderProps) => {
  const isActive = (path: string) => currentRoute === path;

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-gold-300 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a 
              href="/" 
              onClick={(e) => handleNavigation(e, '/')}
              className="flex items-center gap-3"
            >
              <OptimizedImage
                src="/assets/generated/recomnow-logo.dim_200x200.png"
                alt="RecomNow India - Your trusted fashion and jewellery guide"
                width={50}
                height={50}
                className="rounded-full"
                loading="eager"
                priority={true}
              />
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-navy-900">
                  RecomNow India
                </h1>
                <p className="text-xs md:text-sm text-navy-700">
                  Fashion, Jewellery & Accessories
                </p>
              </div>
            </a>
          </div>

          <nav className="flex items-center gap-4">
            <a
              href="/"
              onClick={(e) => handleNavigation(e, '/')}
              className={`text-sm font-semibold transition-colors ${
                isActive('/') 
                  ? 'text-gold-700 border-b-2 border-gold-700' 
                  : 'text-navy-800 hover:text-gold-700'
              }`}
            >
              Home
            </a>
            <a
              href="/products"
              onClick={(e) => handleNavigation(e, '/products')}
              className={`text-sm font-semibold transition-colors ${
                isActive('/products') 
                  ? 'text-gold-700 border-b-2 border-gold-700' 
                  : 'text-navy-800 hover:text-gold-700'
              }`}
            >
              Products
            </a>
            <a
              href="/admin"
              onClick={(e) => handleNavigation(e, '/admin')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-md hover:shadow-lg ${
                isActive('/admin') 
                  ? 'bg-gold-600 text-white border-2 border-gold-700' 
                  : 'bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:from-gold-600 hover:to-gold-700'
              }`}
            >
              <Crown className="h-4 w-4" aria-hidden="true" />
              Admin Panel
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;

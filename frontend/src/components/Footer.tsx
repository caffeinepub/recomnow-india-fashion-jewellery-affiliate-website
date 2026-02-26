import { memo, useState } from 'react';
import { MapPin, Heart } from 'lucide-react';
import { SiFacebook, SiInstagram, SiX } from 'react-icons/si';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import TrustBadges from './TrustBadges';

interface FooterProps {
  onNavigate?: (path: string) => void;
  onOpenPage?: (pageKey: string) => void;
}

const Footer = memo(({ onNavigate, onOpenPage }: FooterProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    // Newsletter functionality removed
    toast.info('Newsletter feature is currently unavailable');
    setEmail('');
    setIsSubmitting(false);
  };

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined'
    ? encodeURIComponent(window.location.hostname)
    : 'recomnow-india';

  return (
    <footer className="bg-navy-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-blue-500">Amazon RecomNow India</h3>
            <p className="text-blue-500 mb-4 leading-relaxed">
              Your trusted guide to premium fashion, costume jewellery, and trendsetting accessories from Amazon.
            </p>
            <div className="flex items-center gap-2 text-blue-500">
              <MapPin className="h-4 w-4 text-gold-400" aria-hidden="true" />
              <span className="text-sm font-medium">Based in Kolkata, India</span>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-blue-500">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="text-blue-500 hover:text-gold-400 transition-colors font-medium cursor-pointer bg-transparent border-none p-0 text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/products')}
                  className="text-blue-500 hover:text-gold-400 transition-colors font-medium cursor-pointer bg-transparent border-none p-0 text-left"
                >
                  Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('products')}
                  className="text-blue-500 hover:text-gold-400 transition-colors font-medium cursor-pointer bg-transparent border-none p-0 text-left"
                >
                  Featured Products
                </button>
              </li>
              {onOpenPage && (
                <>
                  <li>
                    <button
                      onClick={() => onOpenPage('privacy')}
                      className="text-blue-500 hover:text-gold-400 transition-colors font-medium cursor-pointer bg-transparent border-none p-0 text-left"
                    >
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onOpenPage('terms')}
                      className="text-blue-500 hover:text-gold-400 transition-colors font-medium cursor-pointer bg-transparent border-none p-0 text-left"
                    >
                      Terms of Service
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onOpenPage('contact')}
                      className="text-blue-500 hover:text-gold-400 transition-colors font-medium cursor-pointer bg-transparent border-none p-0 text-left"
                    >
                      Contact Us
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-blue-500">Newsletter</h3>
            <p className="text-blue-500 mb-4 text-sm">
              Get the latest deals and fashion tips delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-navy-900 border-gold-400 placeholder:text-navy-500 font-medium"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-gold-600 to-gold-700 text-white hover:from-gold-700 hover:to-gold-800 font-bold whitespace-nowrap cursor-pointer"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-navy-700 pt-8 mb-6 pb-8">
          <TrustBadges
            badges={['kolkata', 'amazon-associates', 'safe-checkout', 'money-back', 'ssl-secure']}
            layout="horizontal"
          />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-navy-700 pt-6">
          <div className="flex items-center gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-100 hover:text-gold-400 transition-colors"
              aria-label="Follow us on Facebook"
            >
              <SiFacebook className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-100 hover:text-gold-400 transition-colors"
              aria-label="Follow us on Instagram"
            >
              <SiInstagram className="h-5 w-5" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-100 hover:text-gold-400 transition-colors"
              aria-label="Follow us on X (Twitter)"
            >
              <SiX className="h-5 w-5" />
            </a>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-navy-100 mb-2 font-medium">
              © {currentYear} Amazon RecomNow India. All rights reserved.
            </p>
            <p className="text-xs text-navy-200 flex items-center justify-center md:justify-end gap-1">
              Built with <Heart className="h-3 w-3 text-red-400 fill-red-400" aria-label="love" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-400 hover:text-gold-300 transition-colors font-semibold"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-navy-700">
          <p className="text-xs text-navy-200 text-center leading-relaxed">
            <strong className="text-navy-100">Affiliate Disclosure:</strong> As an Amazon Associate, Amazon RecomNow India may earn from qualifying purchases.
            We only recommend products we believe will add value to our readers.
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;

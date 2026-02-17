import { useState } from 'react';
import { SiFacebook } from 'react-icons/si';
import { MessageCircle, Mail, Heart } from 'lucide-react';
import { useSubscribeNewsletter } from '../hooks/useQueries';
import PageModal from './PageModal';
import OptimizedImage from './OptimizedImage';

export default function Footer() {
  const [email, setEmail] = useState('');
  const subscribeNewsletter = useSubscribeNewsletter();
  const [openPage, setOpenPage] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribeNewsletter.mutate(email, {
        onSuccess: () => setEmail(''),
      });
    }
  };

  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Fashion', href: '#fashion' },
    { name: 'Jewellery', href: '#jewellery' },
    { name: 'Blog', href: '#blog' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', key: 'privacy' },
    { name: 'Terms of Service', key: 'terms' },
    { name: 'Contact Us', key: 'contact' },
  ];

  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' 
    ? encodeURIComponent(window.location.hostname) 
    : 'recomnowindia-2gi.caffeine.xyz';

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <OptimizedImage
                src="/assets/generated/recomnow-logo.dim_200x200.png"
                alt="RecomNow India Logo"
                className="h-12 w-12 rounded-full"
                width={200}
                height={200}
              />
              <div>
                <h3 className="font-bold text-lg text-primary-magenta">RecomNow India</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your guide to chic fashion, costume jewellery, and trendsetting accessories
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/profile.php?id=61572088088088"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary-magenta transition-colors"
                aria-label="Visit RecomNow India on Facebook"
              >
                <SiFacebook className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href="https://wa.me/918232850139"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary-magenta transition-colors"
                aria-label="Contact RecomNow India on WhatsApp"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
            <nav className="space-y-2" aria-label="Footer quick links">
              {quickLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-sm text-muted-foreground hover:text-primary-magenta transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <nav className="space-y-2" aria-label="Footer legal links">
              {legalLinks.map((link) => (
                <button
                  key={link.key}
                  onClick={() => setOpenPage(link.key)}
                  className="block text-sm text-muted-foreground hover:text-primary-magenta transition-colors text-left"
                >
                  {link.name}
                </button>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe for the latest deals and fashion tips
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address for newsletter subscription
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-full border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                required
                aria-required="true"
              />
              <button
                type="submit"
                disabled={subscribeNewsletter.isPending}
                className="w-full px-4 py-2 rounded-full bg-gradient-rainbow text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                aria-label="Subscribe to newsletter"
              >
                {subscribeNewsletter.isPending ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            © {currentYear} RecomNow India. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with <Heart className="inline h-4 w-4 text-red-500" aria-label="love" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-magenta hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground italic">
            As an affiliate, RecomNow may earn from qualifying purchases.
          </p>
        </div>
      </div>

      {openPage && (
        <PageModal
          pageKey={openPage}
          onClose={() => setOpenPage(null)}
        />
      )}
    </footer>
  );
}

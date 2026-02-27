import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { SiFacebook, SiInstagram, SiYoutube } from 'react-icons/si';

interface FooterProps {
  onNavigate?: (path: string) => void;
  onOpenPage?: (page: string) => void;
}

export default function Footer({ onNavigate, onOpenPage }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const appId = encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'recomnow');

  return (
    <footer className="bg-navy-900 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/assets/generated/recomnow-logo.dim_200x200.png"
                alt="RecomNow"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-bold text-lg">RecomNow India</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Your trusted source for curated fashion and jewellery deals from Amazon India.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="Facebook" className="text-white/60 hover:text-pink-hot transition-colors">
                <SiFacebook className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Instagram" className="text-white/60 hover:text-pink-hot transition-colors">
                <SiInstagram className="w-5 h-5" />
              </a>
              <a href="#" aria-label="YouTube" className="text-white/60 hover:text-pink-hot transition-colors">
                <SiYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-3">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: 'Home', action: () => onNavigate?.('/') },
                { label: 'Products', action: () => onNavigate?.('/products') },
                { label: 'Featured Deals', action: () => { onNavigate?.('/'); setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
              ].map(link => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    className="text-white/60 hover:text-pink-hot transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-3">Legal</h3>
            <ul className="space-y-2">
              {[
                { label: 'Privacy Policy', page: 'privacy' },
                { label: 'Terms of Service', page: 'terms' },
                { label: 'Contact Us', page: 'contact' },
              ].map(link => (
                <li key={link.label}>
                  <button
                    onClick={() => onOpenPage?.(link.page)}
                    className="text-white/60 hover:text-pink-hot transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-white mb-3">Stay Updated</h3>
            <p className="text-white/60 text-sm mb-3">Get the latest deals delivered to your inbox.</p>
            {subscribed ? (
              <p className="text-pink-hot text-sm font-medium">✓ Thanks for subscribing!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-pink-hot"
                  required
                />
                <button
                  type="submit"
                  className="btn-pink px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-white/50">
          <p>© {new Date().getFullYear()} RecomNow India. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-pink-hot fill-pink-hot" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-hot hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

import { memo } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import TrustBadges from './TrustBadges';
import OptimizedImage from './OptimizedImage';

const Hero = memo(() => {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700">
      {/* Hero LCP image: eager loading, high fetchpriority, explicit dimensions for CLS prevention */}
      <div className="absolute inset-0 opacity-20" aria-hidden="true">
        <OptimizedImage
          src="/assets/generated/hero-banner.dim_1200x400.png"
          alt=""
          width={1200}
          height={400}
          priority={true}
          loading="eager"
          className="w-full h-full object-cover"
          sizes="100vw"
        />
      </div>

      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold drop-shadow-lg" style={{ color: '#FF00FF' }}>
            Discover Premium Fashion & Jewellery
          </h2>
          <p className="text-lg md:text-xl text-white drop-shadow-md font-medium">
            Curated collection of sarees, jewellery, and festive wear at unbeatable prices
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={scrollToProducts}
              size="lg"
              className="bg-gradient-to-r from-gold-600 to-gold-700 text-pink-500 hover:from-gold-700 hover:to-gold-800 font-bold text-base px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all cursor-pointer"
            >
              Shop Now
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={scrollToProducts}
              size="lg"
              variant="outline"
              className="bg-white/95 text-navy-900 border-2 border-white hover:bg-white font-bold text-base px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all cursor-pointer"
            >
              Browse Collection
            </Button>
          </div>

          <div className="pt-8">
            <TrustBadges
              badges={['kolkata', 'amazon-associates', 'safe-checkout', 'money-back', 'ssl-secure']}
              layout="horizontal"
            />
          </div>
        </div>
      </div>
    </section>
  );
});

Hero.displayName = 'Hero';

export default Hero;

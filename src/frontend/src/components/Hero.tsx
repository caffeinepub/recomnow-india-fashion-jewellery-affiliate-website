import { memo } from 'react';
import { ExternalLink, Package } from 'lucide-react';
import { Button } from './ui/button';
import OptimizedImage from './OptimizedImage';

const Hero = memo(() => {
  const scrollToProducts = () => {
    const productsSection = document.querySelector('[aria-labelledby="products-heading"]');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(/assets/generated/hero-banner.dim_1200x400.png)' }}
        aria-hidden="true"
      />
      
      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
            Discover Premium Fashion & Jewellery
          </h2>
          <p className="text-lg md:text-xl text-white drop-shadow-md font-medium">
            Curated collection of sarees, jewellery, and festive wear at unbeatable prices
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={scrollToProducts}
              size="lg"
              className="bg-gradient-to-r from-gold-600 to-gold-700 text-white hover:from-gold-700 hover:to-gold-800 font-bold text-base px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all"
            >
              Shop Now
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={scrollToProducts}
              size="lg"
              variant="outline"
              className="bg-white/95 text-navy-900 border-2 border-white hover:bg-white font-bold text-base px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all"
            >
              Browse Collection
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
            <div className="flex items-center justify-center min-w-fit h-24">
              <OptimizedImage
                src="/assets/generated/badge-ssl.dim_200x80.png"
                alt="SSL Secure - Safe and encrypted shopping"
                width={200}
                height={80}
                className="h-full w-auto object-contain"
                loading="eager"
              />
            </div>
            <div className="flex items-center justify-center min-w-fit h-24">
              <OptimizedImage
                src="/assets/generated/badge-amazon-verified.dim_200x80.png"
                alt="Amazon Verified - Authentic products from trusted sellers"
                width={200}
                height={80}
                className="h-full w-auto object-contain"
                loading="eager"
              />
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 bg-white/95 rounded-full shadow-lg min-w-fit">
              <Package className="h-5 w-5 text-gold-700 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm font-bold text-navy-900 whitespace-nowrap">Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

Hero.displayName = 'Hero';

export default Hero;

import { Sparkles, ShoppingBag } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-br from-primary-magenta/10 via-background to-accent-purple/10">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-rainbow/10 border border-primary-magenta/20">
              <Sparkles className="h-4 w-4 text-primary-magenta" aria-hidden="true" />
              <span className="text-sm font-medium text-primary-magenta">Curated Just for You</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Top Deals in{' '}
              <span className="text-gradient-rainbow">Fashion & Jewellery</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Handpicked affiliate picks from Amazon — curated for savings and style. Discover the latest trends in sarees, tunics, and costume jewellery.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="#fashion"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-rainbow text-white font-medium hover:opacity-90 transition-opacity"
                aria-label="Browse fashion deals collection"
              >
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                Shop Fashion Deals
              </a>
              <a
                href="#jewellery"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-primary-magenta text-primary-magenta font-medium hover:bg-primary-magenta/10 transition-colors"
                aria-label="Browse jewellery offers collection"
              >
                <Sparkles className="h-5 w-5" aria-hidden="true" />
                Jewellery Offers
              </a>
            </div>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-rainbow opacity-20 blur-3xl rounded-full" aria-hidden="true"></div>
            <OptimizedImage
              src="/assets/generated/hero-banner.dim_1200x400.png"
              alt="Fashion and Jewellery Collection - Trending sarees, tunics, and costume jewellery"
              className="relative rounded-2xl shadow-2xl w-full"
              width={1200}
              height={400}
              priority={true}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

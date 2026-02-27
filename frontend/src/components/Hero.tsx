import React from 'react';

interface HeroProps {
  onNavigate?: (path: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  return (
    <section
      className="relative min-h-[600px] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url('/assets/generated/hero-background.dim_1920x1080.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-navy-900/70" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          Discover Amazing Deals on
          <span className="block text-pink-hot mt-2">Fashion & Jewellery</span>
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Handpicked collections from top brands. Exclusive discounts on sarees, kurtis, jewellery and more — all on Amazon.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onNavigate?.('/products')}
            className="btn-pink px-8 py-3 text-lg font-semibold rounded-full shadow-lg"
          >
            Shop Now
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('products');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-pink-outline px-8 py-3 text-lg font-semibold rounded-full"
          >
            View Collections
          </button>
        </div>
      </div>
    </section>
  );
}

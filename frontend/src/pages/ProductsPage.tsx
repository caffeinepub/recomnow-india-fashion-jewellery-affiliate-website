import React from 'react';
import ProductGrid from '../components/ProductGrid';

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-navy-50">
      <div className="bg-navy-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Our Products</h1>
          <p className="text-navy-300 text-lg max-w-2xl mx-auto">
            Discover our curated collection of fashion and jewellery — handpicked for quality and style.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid />
      </div>
    </div>
  );
}

import { memo } from 'react';
import ProductGrid from '../components/ProductGrid';

const ProductsPage = memo(() => {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-8 px-4 bg-gradient-to-b from-navy-900 to-navy-800">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            All Products
          </h1>
          <p className="text-gold-300 text-lg">
            Browse our complete collection of fashion, jewellery, and accessories
          </p>
        </div>
      </section>
      <ProductGrid />
    </div>
  );
});

ProductsPage.displayName = 'ProductsPage';

export default ProductsPage;

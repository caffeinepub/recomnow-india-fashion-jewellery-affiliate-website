import React, { useState, useMemo } from 'react';
import { useGetAllProducts } from '../hooks/useQueries';
import type { Product } from '../backend';
import { FashionCategory, JewelleryCategory } from '../backend';

const PRODUCTS_PER_PAGE = 12;

type CategoryFilter =
  | 'all'
  | 'fashion'
  | 'fashion_sarees'
  | 'fashion_kurtaKurtis'
  | 'fashion_festive'
  | 'fashion_gowns'
  | 'fashion_salwarSuits'
  | 'fashion_lehengaCholis'
  | 'fashion_westernWear'
  | 'fashion_sportsWear'
  | 'jewellery'
  | 'jewellery_rings'
  | 'jewellery_necklaces';

function matchesCategory(product: Product, filter: CategoryFilter): boolean {
  if (filter === 'all') return true;
  const cat = product.category;
  if (filter === 'fashion') return cat.__kind__ === 'fashion';
  if (filter === 'jewellery') return cat.__kind__ === 'jewellery';
  if (filter.startsWith('fashion_') && cat.__kind__ === 'fashion') {
    const sub = filter.replace('fashion_', '');
    return cat.fashion === sub;
  }
  if (filter.startsWith('jewellery_') && cat.__kind__ === 'jewellery') {
    const sub = filter.replace('jewellery_', '');
    return cat.jewellery === sub;
  }
  return false;
}

function getCategoryLabel(filter: CategoryFilter): string {
  const labels: Record<CategoryFilter, string> = {
    all: 'All Products',
    fashion: 'Fashion',
    fashion_sarees: 'Sarees',
    fashion_kurtaKurtis: 'Kurta & Kurtis',
    fashion_festive: 'Festive',
    fashion_gowns: 'Gowns',
    fashion_salwarSuits: 'Salwar Suits',
    fashion_lehengaCholis: 'Lehenga Cholis',
    fashion_westernWear: 'Western Wear',
    fashion_sportsWear: 'Sports Wear',
    jewellery: 'Jewellery',
    jewellery_rings: 'Rings',
    jewellery_necklaces: 'Necklaces',
  };
  return labels[filter] || filter;
}

function ProductCard({ product }: { product: Product }) {
  const price = Number(product.price);
  const mrp = Number(product.mrp);
  const discount = Number(product.discountPercentage);

  const imageUrl = product.imageBlob
    ? product.imageBlob.getDirectURL()
    : product.imageUrl;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div className="relative aspect-[4/3] bg-navy-50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-navy-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discount}%
          </div>
        )}
        {product.isFeatured && (
          <div className="absolute top-2 left-2 bg-gold-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            ⭐ Featured
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-navy-900 text-sm leading-tight mb-2 line-clamp-2">
          {product.title}
        </h3>

        {product.description && (
          <p className="text-navy-500 text-xs mb-3 line-clamp-2">{product.description}</p>
        )}

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-navy-900">₹{price.toLocaleString('en-IN')}</span>
            {mrp > price && (
              <span className="text-sm text-navy-400 line-through">₹{mrp.toLocaleString('en-IN')}</span>
            )}
          </div>

          <a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2 px-4 bg-green-100 hover:bg-green-200 text-pink-600 font-semibold text-sm rounded-lg transition-colors"
          >
            Shop Now on Amazon
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid() {
  const { data: products, isLoading, isError, error } = useGetAllProducts();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [currentPage, setCurrentPage] = useState(1);
  const [fashionOpen, setFashionOpen] = useState(true);
  const [jewelleryOpen, setJewelleryOpen] = useState(true);

  const allProducts = products ?? [];

  const maxProductPrice = useMemo(() => {
    if (allProducts.length === 0) return 10000;
    return Math.max(...allProducts.map((p) => Number(p.price)), 10000);
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const priceMatch = Number(p.price) <= maxPrice;
      const catMatch = matchesCategory(p, categoryFilter);
      return priceMatch && catMatch;
    });
  }, [allProducts, categoryFilter, maxPrice]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * PRODUCTS_PER_PAGE,
    safePage * PRODUCTS_PER_PAGE
  );

  const handleCategoryChange = (filter: CategoryFilter) => {
    setCategoryFilter(filter);
    setCurrentPage(1);
  };

  const handlePriceChange = (value: number) => {
    setMaxPrice(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mb-4"></div>
        <p className="text-navy-600">Loading products...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-navy-900 mb-2">Failed to load products</h3>
        <p className="text-navy-600 text-sm">{error instanceof Error ? error.message : 'Please try again later.'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Filters */}
      <aside className="lg:w-64 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-md p-5 sticky top-4">
          <h2 className="font-bold text-navy-900 text-lg mb-4">Filters</h2>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="font-semibold text-navy-800 text-sm mb-2">Max Price</h3>
            <input
              type="range"
              min={0}
              max={maxProductPrice}
              value={maxPrice}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
              className="w-full price-range-slider"
            />
            <div className="flex justify-between text-xs text-navy-500 mt-1">
              <span>₹0</span>
              <span className="font-semibold text-navy-800">₹{maxPrice.toLocaleString('en-IN')}</span>
              <span>₹{maxProductPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Category Filters */}
          <div>
            <h3 className="font-semibold text-navy-800 text-sm mb-2">Category</h3>

            <button
              onClick={() => handleCategoryChange('all')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-gold-100 text-gold-800 font-semibold'
                  : 'text-navy-700 hover:bg-navy-50'
              }`}
            >
              All Products
            </button>

            {/* Fashion */}
            <div className="mb-1">
              <button
                onClick={() => setFashionOpen((o) => !o)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-navy-700 hover:bg-navy-50 transition-colors"
              >
                <span
                  className={`font-medium cursor-pointer ${categoryFilter === 'fashion' ? 'text-gold-700' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleCategoryChange('fashion'); }}
                >
                  Fashion
                </span>
                <span className="text-navy-400">{fashionOpen ? '▲' : '▼'}</span>
              </button>
              {fashionOpen && (
                <div className="ml-3 space-y-0.5">
                  {(
                    [
                      ['fashion_sarees', 'Sarees'],
                      ['fashion_kurtaKurtis', 'Kurta & Kurtis'],
                      ['fashion_festive', 'Festive'],
                      ['fashion_gowns', 'Gowns'],
                      ['fashion_salwarSuits', 'Salwar Suits'],
                      ['fashion_lehengaCholis', 'Lehenga Cholis'],
                      ['fashion_westernWear', 'Western Wear'],
                      ['fashion_sportsWear', 'Sports Wear'],
                    ] as [CategoryFilter, string][]
                  ).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => handleCategoryChange(val)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        categoryFilter === val
                          ? 'bg-gold-100 text-gold-800 font-semibold'
                          : 'text-navy-600 hover:bg-navy-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Jewellery */}
            <div>
              <button
                onClick={() => setJewelleryOpen((o) => !o)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-navy-700 hover:bg-navy-50 transition-colors"
              >
                <span
                  className={`font-medium cursor-pointer ${categoryFilter === 'jewellery' ? 'text-gold-700' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleCategoryChange('jewellery'); }}
                >
                  Jewellery
                </span>
                <span className="text-navy-400">{jewelleryOpen ? '▲' : '▼'}</span>
              </button>
              {jewelleryOpen && (
                <div className="ml-3 space-y-0.5">
                  {(
                    [
                      ['jewellery_rings', 'Rings'],
                      ['jewellery_necklaces', 'Necklaces'],
                    ] as [CategoryFilter, string][]
                  ).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => handleCategoryChange(val)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        categoryFilter === val
                          ? 'bg-gold-100 text-gold-800 font-semibold'
                          : 'text-navy-600 hover:bg-navy-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <p className="text-navy-600 text-sm">
            Showing <span className="font-semibold text-navy-900">{filteredProducts.length}</span> products
            {categoryFilter !== 'all' && (
              <span> in <span className="font-semibold text-gold-700">{getCategoryLabel(categoryFilter)}</span></span>
            )}
          </p>
        </div>

        {paginatedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-navy-900 mb-2">No products found</h3>
            <p className="text-navy-600 text-sm">Try adjusting your filters or browse all categories.</p>
            <button
              onClick={() => { handleCategoryChange('all'); setMaxPrice(maxProductPrice); }}
              className="mt-4 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {paginatedProducts.map((product) => (
              <ProductCard key={String(product.id)} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-2 rounded-lg border border-navy-200 text-navy-700 hover:bg-navy-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                  acc.push('...');
                }
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-navy-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      safePage === p
                        ? 'bg-gold-500 text-white'
                        : 'border border-navy-200 text-navy-700 hover:bg-navy-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-2 rounded-lg border border-navy-200 text-navy-700 hover:bg-navy-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

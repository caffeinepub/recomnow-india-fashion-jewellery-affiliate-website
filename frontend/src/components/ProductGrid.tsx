import React, { useState, useMemo } from 'react';
import { useGetAllProducts } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import type { Product } from '../backend';
import OptimizedImage from './OptimizedImage';
import Spinner from './Spinner';

const ITEMS_PER_PAGE = 12;

type CategoryFilter =
  | 'all'
  | 'sarees'
  | 'kurtaKurtis'
  | 'festive'
  | 'gowns'
  | 'salwarSuits'
  | 'lehengaCholis'
  | 'westernWear'
  | 'sportsWear'
  | 'rings'
  | 'necklaces';

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All',
  sarees: 'Sarees',
  kurtaKurtis: 'Kurta & Kurtis',
  festive: 'Festive',
  gowns: 'Gowns',
  salwarSuits: 'Salwar Suits',
  lehengaCholis: 'Lehenga Cholis',
  westernWear: 'Western Wear',
  sportsWear: 'Sports Wear',
  rings: 'Rings',
  necklaces: 'Necklaces',
};

function matchesCategory(product: Product, filter: CategoryFilter): boolean {
  if (filter === 'all') return true;
  const cat = product.category;
  if (cat.__kind__ === 'fashion') {
    return (cat.fashion as string) === filter;
  }
  if (cat.__kind__ === 'jewellery') {
    return (cat.jewellery as string) === filter;
  }
  return false;
}

function getProductImageUrl(product: Product): string {
  if (product.imageBlob) {
    return product.imageBlob.getDirectURL();
  }
  return product.imageUrl || '/assets/generated/costume-jewellery.dim_400x300.png';
}

/**
 * Formats a price stored in paise (integer) to a Rupee string with 2 decimal places.
 * e.g. 139900 paise → "₹1,399.00"
 */
function formatPrice(paise: number): string {
  const rupees = paise / 100;
  return '₹' + rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const price = Number(product.price);
  const mrp = Number(product.mrp);
  const discount = Number(product.discountPercentage);
  const imageUrl = getProductImageUrl(product);

  return (
    <a
      href={product.affiliateLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col border border-navy-100 hover:border-gold-300"
    >
      <div className="relative overflow-hidden bg-navy-50 aspect-[4/3]">
        <OptimizedImage
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-gold-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {discount}% OFF
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-2 bg-navy-900 text-white text-xs font-semibold px-2 py-1 rounded-full">
            ⭐ Featured
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-navy-900 font-semibold text-sm leading-snug line-clamp-2 mb-2 group-hover:text-gold-600 transition-colors">
          {product.title}
        </h3>
        {product.description && (
          <p className="text-navy-500 text-xs line-clamp-2 mb-3">{product.description}</p>
        )}
        <div className="mt-auto flex items-center gap-2 flex-wrap">
          <span className="text-gold-600 font-bold text-base">{formatPrice(price)}</span>
          {mrp > price && (
            <span className="text-navy-400 text-xs line-through">{formatPrice(mrp)}</span>
          )}
        </div>
        <div className="mt-3">
          <span className="inline-block w-full text-center bg-pink-300 hover:bg-pink-400 text-pink-900 text-xs font-semibold py-2 rounded-lg transition-colors">
            Shop on Amazon →
          </span>
        </div>
      </div>
    </a>
  );
}

export default function ProductGrid() {
  const { isFetching: actorFetching } = useActor();
  const { data: products, isLoading, isError, error, refetch } = useGetAllProducts();

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'discount'>('default');

  const filtered = useMemo(() => {
    let list = products ?? [];
    if (activeCategory !== 'all') {
      list = list.filter(p => matchesCategory(p, activeCategory));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q));
    }
    if (sortBy === 'price-asc') list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === 'price-desc') list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
    else if (sortBy === 'discount') list = [...list].sort((a, b) => Number(b.discountPercentage) - Number(a.discountPercentage));
    return list;
  }, [products, activeCategory, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleCategoryChange = (cat: CategoryFilter) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Show spinner while actor is initializing or products are loading
  const showSpinner = actorFetching || isLoading;

  return (
    <section id="products" className="py-10">
      {/* Search & Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search products…"
          className="flex-1 px-4 py-2 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white"
        />
        <select
          value={sortBy}
          onChange={e => { setSortBy(e.target.value as typeof sortBy); setCurrentPage(1); }}
          className="px-3 py-2 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white text-navy-700"
        >
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="discount">Highest Discount</option>
        </select>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              activeCategory === cat
                ? 'bg-gold-500 text-white border-gold-500'
                : 'bg-white text-navy-600 border-navy-200 hover:border-gold-400 hover:text-gold-600'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {showSpinner && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Spinner />
          <p className="text-navy-500 text-sm">Loading products…</p>
        </div>
      )}

      {/* Error state */}
      {!showSpinner && isError && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="text-4xl">⚠️</div>
          <p className="text-navy-700 font-semibold text-lg">Failed to load products</p>
          <p className="text-navy-500 text-sm text-center max-w-sm">
            {error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-5 py-2 bg-gold-500 text-white text-sm font-semibold rounded-lg hover:bg-gold-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!showSpinner && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="text-5xl">🛍️</div>
          <p className="text-navy-700 font-semibold text-lg">
            {searchQuery || activeCategory !== 'all' ? 'No products match your filters' : 'No products available yet'}
          </p>
          <p className="text-navy-500 text-sm text-center max-w-sm">
            {searchQuery || activeCategory !== 'all'
              ? 'Try adjusting your search or category filter.'
              : 'Check back soon — new products are being added regularly!'}
          </p>
          {(searchQuery || activeCategory !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="mt-2 px-4 py-2 bg-gold-500 text-white text-sm font-medium rounded-lg hover:bg-gold-600 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Product grid */}
      {!showSpinner && !isError && paginated.length > 0 && (
        <>
          <p className="text-navy-500 text-sm mb-4">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} products
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginated.map(product => (
              <ProductCard key={String(product.id)} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-navy-200 text-sm text-navy-600 hover:bg-navy-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
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
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === p
                          ? 'bg-gold-500 text-white border border-gold-500'
                          : 'border border-navy-200 text-navy-600 hover:bg-navy-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-navy-200 text-sm text-navy-600 hover:bg-navy-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

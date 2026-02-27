import React, { useState, useMemo } from 'react';
import { useGetAllProducts } from '../hooks/useQueries';
import { Product, ProductCategory, FashionCategory, JewelleryCategory } from '../backend';
import { ShoppingBag, Search, ChevronLeft, ChevronRight, SlidersHorizontal, Star } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

const ITEMS_PER_PAGE = 12;

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'discount_desc';

interface FilterState {
  category: string;
  search: string;
  sort: SortOption;
  minPrice: string;
  maxPrice: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  'fashion_sarees': 'Sarees',
  'fashion_kurtaKurtis': 'Kurta/Kurtis',
  'fashion_festive': 'Festive',
  'fashion_gowns': 'Gowns',
  'fashion_salwarSuits': 'Salwar Suits',
  'fashion_lehengaCholis': 'Lehenga Cholis',
  'fashion_westernWear': 'Western Wear',
  'fashion_sportsWear': 'Sports Wear',
  'jewellery_rings': 'Rings',
  'jewellery_necklaces': 'Necklaces',
};

function getProductCategoryKey(cat: ProductCategory): string {
  if (cat.__kind__ === 'fashion') return `fashion_${cat.fashion}`;
  return `jewellery_${cat.jewellery}`;
}

function ProductCard({ product }: { product: Product }) {
  const discount = Number(product.discountPercentage);
  const price = Number(product.price);
  const mrp = Number(product.mrp);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group">
      <div className="relative overflow-hidden bg-muted aspect-square">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={e => {
              (e.target as HTMLImageElement).src = '/assets/generated/recomnow-logo.dim_200x200.png';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ShoppingBag className="w-12 h-12" />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-pink-hot text-white text-xs font-bold px-2 py-1 rounded-full">
            {discount}% OFF
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-2 bg-gold-500 text-navy-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" /> Featured
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-2 flex-1">{product.title}</h3>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-foreground">₹{price.toLocaleString()}</span>
          {mrp > price && (
            <span className="text-sm text-muted-foreground line-through">₹{mrp.toLocaleString()}</span>
          )}
        </div>
        <a
          href={product.affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pink w-full text-center py-2 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          Shop on Amazon
        </a>
      </div>
    </div>
  );
}

export default function ProductGrid() {
  const { data: products = [], isLoading, error } = useGetAllProducts();
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    search: '',
    sort: 'default',
    minPrice: '',
    maxPrice: '',
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 300);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filters.category !== 'all') {
      result = result.filter(p => getProductCategoryKey(p.category) === filters.category);
    }

    if (debouncedSearch.trim()) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(term));
    }

    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice);
      if (!isNaN(min)) result = result.filter(p => Number(p.price) >= min);
    }
    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      if (!isNaN(max)) result = result.filter(p => Number(p.price) <= max);
    }

    switch (filters.sort) {
      case 'price_asc':
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price_desc':
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'discount_desc':
        result.sort((a, b) => Number(b.discountPercentage) - Number(a.discountPercentage));
        break;
    }

    return result;
  }, [products, filters.category, debouncedSearch, filters.minPrice, filters.maxPrice, filters.sort]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-pink-hot border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center text-red-500">
        Failed to load products. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-pink-hot/30 focus:border-pink-hot text-sm"
          />
        </div>
        <select
          value={filters.sort}
          onChange={e => updateFilter('sort', e.target.value as SortOption)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-pink-hot/30 focus:border-pink-hot"
        >
          <option value="default">Sort: Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="discount_desc">Biggest Discount</option>
        </select>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
            showFilters
              ? 'bg-pink-hot text-white border-pink-hot'
              : 'border-border text-foreground hover:bg-muted'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => updateFilter('category', key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filters.category === key
                    ? 'bg-pink-hot text-white'
                    : 'bg-background border border-border text-foreground hover:bg-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              type="number"
              value={filters.minPrice}
              onChange={e => updateFilter('minPrice', e.target.value)}
              placeholder="Min price ₹"
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-pink-hot/30"
            />
            <input
              type="number"
              value={filters.maxPrice}
              onChange={e => updateFilter('maxPrice', e.target.value)}
              placeholder="Max price ₹"
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-pink-hot/30"
            />
          </div>
        </div>
      )}

      {/* Category quick filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => updateFilter('category', key)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filters.category === key
                ? 'bg-pink-hot text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {paginatedProducts.length} of {filteredProducts.length} products
      </p>

      {/* Product grid */}
      {paginatedProducts.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No products found matching your criteria.</p>
          <button
            onClick={() => setFilters({ category: 'all', search: '', sort: 'default', minPrice: '', maxPrice: '' })}
            className="mt-3 text-pink-hot hover:underline text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedProducts.map(product => (
            <ProductCard key={String(product.id)} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-pink-hot text-white'
                  : 'border border-border hover:bg-muted text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

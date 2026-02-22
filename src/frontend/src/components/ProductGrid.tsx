import { useState, memo, useCallback, useMemo } from 'react';
import { useGetFashionProducts, useGetProductsByCategory } from '../hooks/useQueries';
import { ProductCategory } from '../backend';
import { ExternalLink, Loader2, Package, Filter, X, Star, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from './ui/sheet';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import OptimizedImage from './OptimizedImage';

// Memoized ProductCard component to prevent unnecessary re-renders
const ProductCard = memo(({ product, getCategoryLabel }: { product: any; getCategoryLabel: (cat: ProductCategory) => string }) => (
  <article className="group relative bg-white rounded-xl overflow-hidden border-2 border-gold-300 hover:border-gold-500 transition-all hover:shadow-2xl card-hover-effect">
    {/* Badge Overlay */}
    <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
      {Number(product.discountPercentage) >= 50 && (
        <div className="bg-gradient-to-r from-gold-600 to-gold-700 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <Zap className="h-3 w-3" />
          {Number(product.discountPercentage)}% OFF
        </div>
      )}
      <div className="bg-navy-800 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
        <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
        Genuine
      </div>
    </div>

    <div className="aspect-[3/4] overflow-hidden bg-gray-50 flex items-center justify-center p-2">
      <OptimizedImage
        src={product.imageUrl || '/assets/generated/recomnow-logo.dim_200x200.png'}
        alt={`${product.title} - ${getCategoryLabel(product.category)} available at discounted price`}
        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        width={300}
        height={400}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/assets/generated/recomnow-logo.dim_200x200.png';
        }}
      />
    </div>
    <div className="p-4 space-y-2">
      <h3 className="font-bold text-navy-900 line-clamp-2 min-h-[3rem] text-base">{product.title}</h3>
      {product.description && (
        <p className="text-sm text-navy-700 line-clamp-2 min-h-[2.5rem]">{product.description}</p>
      )}
      <div className="flex items-center gap-2 pt-2">
        <span className="text-sm text-navy-600 line-through">
          ₹{(Number(product.mrp) / 100).toFixed(2)}
        </span>
        <span className="text-xl font-bold text-gold-700">
          ₹{(Number(product.price) / 100).toFixed(2)}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-bold">
          {Number(product.discountPercentage)}% OFF
        </span>
      </div>
      <div className="pt-2">
        <a
          href={product.affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1 w-full px-4 py-3 rounded-full bg-gradient-to-r from-gold-600 to-gold-700 text-white text-sm font-bold hover:from-gold-700 hover:to-gold-800 transition-all shadow-md hover:shadow-lg"
          aria-label={`Shop ${product.title} on Amazon`}
        >
          Shop Now on Amazon
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  </article>
));

ProductCard.displayName = 'ProductCard';

const LoadingGrid = memo(() => (
  <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
    <Loader2 className="h-8 w-8 animate-spin text-gold-600" aria-hidden="true" />
    <span className="sr-only">Loading products...</span>
  </div>
));

LoadingGrid.displayName = 'LoadingGrid';

const EmptyState = memo(({ hasActiveFilters, onClearFilters }: { hasActiveFilters: boolean; onClearFilters: () => void }) => (
  <div className="text-center py-12 bg-gold-50 rounded-xl border-2 border-dashed border-gold-400">
    <Package className="h-12 w-12 text-gold-700 mx-auto mb-3" aria-hidden="true" />
    <p className="text-navy-900 font-bold text-lg">No products match your filters.</p>
    <p className="text-sm text-navy-700 mt-1">Try adjusting your filter criteria.</p>
    {hasActiveFilters && (
      <Button
        onClick={onClearFilters}
        variant="outline"
        className="mt-4 border-gold-500 text-gold-800 hover:bg-gold-100 font-semibold"
      >
        Clear Filters
      </Button>
    )}
  </div>
));

EmptyState.displayName = 'EmptyState';

const ProductGrid = memo(() => {
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: fashionProducts, isLoading: fashionLoading, error: fashionError } = useGetFashionProducts();
  const { data: jewelleryProducts, isLoading: jewelleryLoading, error: jewelleryError } = useGetProductsByCategory(ProductCategory.jewellery);
  const { data: festiveProducts, isLoading: festiveLoading, error: festiveError } = useGetProductsByCategory(ProductCategory.festive);

  const isLoading = fashionLoading || jewelleryLoading || festiveLoading;
  const hasError = fashionError || jewelleryError || festiveError;

  const handleCategoryToggle = useCallback((category: ProductCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedCategories([]);
    setPriceRange([0, 10000]);
  }, []);

  const hasActiveFilters = useMemo(() => 
    selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000,
    [selectedCategories.length, priceRange]
  );

  const filterProducts = useCallback((products: any[] | undefined) => {
    if (!products) return [];
    
    let filtered = products;

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    const minPrice = priceRange[0] * 100;
    const maxPrice = priceRange[1] * 100;
    filtered = filtered.filter(p => {
      const price = Number(p.price);
      return price >= minPrice && price <= maxPrice;
    });

    return filtered;
  }, [selectedCategories, priceRange]);

  const filteredFashionProducts = useMemo(() => filterProducts(fashionProducts), [filterProducts, fashionProducts]);
  const filteredJewelleryProducts = useMemo(() => filterProducts(jewelleryProducts), [filterProducts, jewelleryProducts]);
  const filteredFestiveProducts = useMemo(() => filterProducts(festiveProducts), [filterProducts, festiveProducts]);

  const getCategoryLabel = useCallback((category: ProductCategory): string => {
    const labels: Record<ProductCategory, string> = {
      [ProductCategory.bottomWear]: 'Bottom Wear',
      [ProductCategory.chunnisDupattas]: 'Chunnis & Dupattas',
      [ProductCategory.dressMaterial]: 'Dress Material',
      [ProductCategory.gowns]: 'Gowns',
      [ProductCategory.kurtasKurtis]: 'Kurtas & Kurtis',
      [ProductCategory.lehengaCholis]: 'Lehenga Cholis',
      [ProductCategory.salwarSuits]: 'Salwar Suits',
      [ProductCategory.sarees]: 'Sarees',
      [ProductCategory.westernWear]: 'Western Wear',
      [ProductCategory.sportswear]: 'Sportswear',
      [ProductCategory.jewellery]: 'Jewellery',
      [ProductCategory.festive]: 'Festive',
    };
    return labels[category] || category;
  }, []);

  const categories = useMemo(() => Object.values(ProductCategory), []);

  const totalProducts = useMemo(() => 
    filteredFashionProducts.length + filteredJewelleryProducts.length + filteredFestiveProducts.length,
    [filteredFashionProducts.length, filteredJewelleryProducts.length, filteredFestiveProducts.length]
  );

  if (hasError) {
    return (
      <section className="py-12 px-4" aria-labelledby="products-heading">
        <div className="container mx-auto">
          <div className="text-center py-12 bg-red-50 rounded-xl border-2 border-red-300">
            <p className="text-red-900 font-bold text-lg">Error loading products</p>
            <p className="text-sm text-red-700 mt-1">Please try refreshing the page.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-white to-gold-50" aria-labelledby="products-heading">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 id="products-heading" className="text-3xl md:text-4xl font-bold text-navy-900">
              Featured Products
            </h2>
            <p className="text-navy-700 mt-2">
              {isLoading ? 'Loading...' : `${totalProducts} products available`}
            </p>
          </div>
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                className="border-gold-500 text-gold-800 hover:bg-gold-100 font-semibold"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters {hasActiveFilters && `(${selectedCategories.length > 0 ? selectedCategories.length : ''})`}
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto bg-white">
              <SheetHeader>
                <SheetTitle className="text-navy-900">Filter Products</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-bold text-navy-900">Categories</Label>
                    {selectedCategories.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCategories([])}
                        className="text-gold-700 hover:text-gold-800 hover:bg-gold-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                          className="border-gold-500 data-[state=checked]:bg-gold-600"
                        />
                        <label
                          htmlFor={category}
                          className="text-sm font-medium text-navy-800 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {getCategoryLabel(category)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-bold mb-4 block text-navy-900">
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                  </Label>
                  <Slider
                    min={0}
                    max={10000}
                    step={100}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="mt-2"
                  />
                </div>

                <div className="pt-4 space-y-2">
                  <SheetClose asChild>
                    <Button className="w-full bg-gradient-to-r from-gold-600 to-gold-700 text-white hover:from-gold-700 hover:to-gold-800 font-bold">
                      Apply Filters
                    </Button>
                  </SheetClose>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      className="w-full border-gold-500 text-gold-800 hover:bg-gold-100 font-semibold"
                      onClick={handleClearFilters}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {isLoading ? (
          <LoadingGrid />
        ) : totalProducts === 0 ? (
          <EmptyState hasActiveFilters={hasActiveFilters} onClearFilters={handleClearFilters} />
        ) : (
          <div className="space-y-12">
            {filteredFashionProducts.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-navy-900 border-b-2 border-gold-400 pb-2">
                  Fashion Collection
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredFashionProducts.map((product) => (
                    <ProductCard key={product.id.toString()} product={product} getCategoryLabel={getCategoryLabel} />
                  ))}
                </div>
              </div>
            )}

            {filteredJewelleryProducts.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-navy-900 border-b-2 border-gold-400 pb-2">
                  Jewellery Collection
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredJewelleryProducts.map((product) => (
                    <ProductCard key={product.id.toString()} product={product} getCategoryLabel={getCategoryLabel} />
                  ))}
                </div>
              </div>
            )}

            {filteredFestiveProducts.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-navy-900 border-b-2 border-gold-400 pb-2">
                  Festive Collection
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredFestiveProducts.map((product) => (
                    <ProductCard key={product.id.toString()} product={product} getCategoryLabel={getCategoryLabel} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;

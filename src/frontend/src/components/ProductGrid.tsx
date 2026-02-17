import { useState, memo, useCallback, useMemo } from 'react';
import { useGetFashionProducts, useGetProductsByCategory } from '../hooks/useQueries';
import { ProductCategory } from '../backend';
import { ExternalLink, Loader2, Package, Filter, X } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from './ui/sheet';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import OptimizedImage from './OptimizedImage';

// Memoized ProductCard component to prevent unnecessary re-renders
const ProductCard = memo(({ product, getCategoryLabel }: { product: any; getCategoryLabel: (cat: ProductCategory) => string }) => (
  <article className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-primary-magenta/50 transition-all hover:shadow-xl card-hover-effect">
    <div className="aspect-[3/4] overflow-hidden bg-muted flex items-center justify-center p-2">
      <OptimizedImage
        src={product.imageUrl || '/assets/generated/recomnow-logo.dim_200x200.png'}
        alt={`${product.title} - ${getCategoryLabel(product.category)} available at discounted price`}
        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        width={300}
        height={400}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/assets/generated/recomnow-logo.dim_200x200.png';
        }}
      />
    </div>
    <div className="p-4 space-y-2">
      <h3 className="font-semibold text-foreground line-clamp-2 min-h-[3rem]">{product.title}</h3>
      {product.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{product.description}</p>
      )}
      <div className="flex items-center gap-2 pt-2">
        <span className="text-sm text-muted-foreground line-through">
          ₹{(Number(product.mrp) / 100).toFixed(2)}
        </span>
        <span className="text-lg font-bold text-primary-magenta">
          ₹{(Number(product.price) / 100).toFixed(2)}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium">
          {Number(product.discountPercentage)}% OFF
        </span>
      </div>
      <div className="pt-2">
        <a
          href={product.affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1 w-full px-4 py-2 rounded-full bg-gradient-rainbow text-white text-sm font-medium hover:opacity-90 transition-opacity"
          aria-label={`Shop ${product.title} on Amazon`}
        >
          Shop Now
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
    </div>
  </article>
));

ProductCard.displayName = 'ProductCard';

const LoadingGrid = memo(() => (
  <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
    <Loader2 className="h-8 w-8 animate-spin text-primary-magenta" aria-hidden="true" />
    <span className="sr-only">Loading products...</span>
  </div>
));

LoadingGrid.displayName = 'LoadingGrid';

const EmptyState = memo(({ hasActiveFilters, onClearFilters }: { hasActiveFilters: boolean; onClearFilters: () => void }) => (
  <div className="text-center py-12 bg-muted/10 rounded-xl border border-dashed border-border">
    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
    <p className="text-muted-foreground">No products match your filters.</p>
    <p className="text-sm text-muted-foreground mt-1">Try adjusting your filter criteria.</p>
    {hasActiveFilters && (
      <Button
        onClick={onClearFilters}
        variant="outline"
        className="mt-4"
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

  const { data: fashionProducts, isLoading: fashionLoading } = useGetFashionProducts();
  const { data: jewelleryProducts, isLoading: jewelleryLoading } = useGetProductsByCategory(ProductCategory.jewellery);
  const { data: festiveProducts, isLoading: festiveLoading } = useGetProductsByCategory(ProductCategory.festive);

  const isLoading = fashionLoading || jewelleryLoading || festiveLoading;

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

  const fashionCategories = useMemo(() => [
    ProductCategory.bottomWear,
    ProductCategory.chunnisDupattas,
    ProductCategory.dressMaterial,
    ProductCategory.gowns,
    ProductCategory.kurtasKurtis,
    ProductCategory.lehengaCholis,
    ProductCategory.salwarSuits,
    ProductCategory.sarees,
    ProductCategory.westernWear,
    ProductCategory.sportswear,
  ], []);

  return (
    <section className="py-16 bg-background" aria-labelledby="products-heading">
      <div className="container mx-auto px-4">
        <div className="flex justify-center mb-8">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button
                size="lg"
                className="bg-gradient-rainbow text-white hover:opacity-90 transition-opacity shadow-lg"
                aria-label="Open product filters"
              >
                <Filter className="h-5 w-5 mr-2" aria-hidden="true" />
                Filter Products
                {hasActiveFilters && (
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    Active
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold">Filter Products</SheetTitle>
              </SheetHeader>
              
              <div className="mt-8 space-y-8">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Category</Label>
                  <div className="space-y-3">
                    {fashionCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <Label htmlFor={category} className="cursor-pointer font-normal">
                          {getCategoryLabel(category)}
                        </Label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={ProductCategory.jewellery}
                        checked={selectedCategories.includes(ProductCategory.jewellery)}
                        onCheckedChange={() => handleCategoryToggle(ProductCategory.jewellery)}
                      />
                      <Label htmlFor={ProductCategory.jewellery} className="cursor-pointer font-normal">
                        Jewellery
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={ProductCategory.festive}
                        checked={selectedCategories.includes(ProductCategory.festive)}
                        onCheckedChange={() => handleCategoryToggle(ProductCategory.festive)}
                      />
                      <Label htmlFor={ProductCategory.festive} className="cursor-pointer font-normal">
                        Festive
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Price Range</Label>
                  <div className="space-y-4">
                    <Slider
                      min={0}
                      max={10000}
                      step={100}
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      className="w-full"
                      aria-label="Price range filter"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    className="flex-1"
                  >
                    Clear All
                  </Button>
                  <SheetClose asChild>
                    <Button className="flex-1 bg-gradient-rainbow text-white hover:opacity-90">
                      Apply Filters
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 justify-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedCategories.map((category) => (
              <div key={category} className="flex items-center gap-1 px-3 py-1 bg-primary-magenta/10 text-primary-magenta rounded-full text-sm">
                {getCategoryLabel(category)}
                <button
                  onClick={() => handleCategoryToggle(category)}
                  className="ml-1 hover:bg-primary-magenta/20 rounded-full p-0.5"
                  aria-label={`Remove ${getCategoryLabel(category)} filter`}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            ))}
            {(priceRange[0] > 0 || priceRange[1] < 10000) && (
              <div className="flex items-center gap-1 px-3 py-1 bg-primary-magenta/10 text-primary-magenta rounded-full text-sm">
                ₹{priceRange[0]} - ₹{priceRange[1]}
                <button
                  onClick={() => setPriceRange([0, 10000])}
                  className="ml-1 hover:bg-primary-magenta/20 rounded-full p-0.5"
                  aria-label="Remove price range filter"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <LoadingGrid />
        ) : (
          <div className="space-y-16">
            {filteredFashionProducts.length > 0 && (
              <section id="fashion" className="space-y-6">
                <header className="text-center space-y-2">
                  <h2 id="products-heading" className="text-3xl md:text-4xl font-bold text-foreground">
                    Latest Fashion Collection
                  </h2>
                  <p className="text-muted-foreground">Affordable Styles Online</p>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredFashionProducts.map((product) => (
                    <ProductCard key={Number(product.id)} product={product} getCategoryLabel={getCategoryLabel} />
                  ))}
                </div>
              </section>
            )}

            {filteredJewelleryProducts.length > 0 && (
              <section id="jewellery" className="space-y-6">
                <header className="text-center space-y-2">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Costume Jewellery Under ₹499
                  </h2>
                  <p className="text-muted-foreground">Trendy Accessories</p>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredJewelleryProducts.map((product) => (
                    <ProductCard key={Number(product.id)} product={product} getCategoryLabel={getCategoryLabel} />
                  ))}
                </div>
              </section>
            )}

            {filteredFestiveProducts.length > 0 && (
              <section id="festive" className="space-y-6">
                <header className="text-center space-y-2">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Festive Offers
                  </h2>
                  <p className="text-muted-foreground">Sarees & Jewellery</p>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredFestiveProducts.map((product) => (
                    <ProductCard key={Number(product.id)} product={product} getCategoryLabel={getCategoryLabel} />
                  ))}
                </div>
              </section>
            )}

            {filteredFashionProducts.length === 0 && 
             filteredJewelleryProducts.length === 0 && 
             filteredFestiveProducts.length === 0 && (
              <EmptyState hasActiveFilters={hasActiveFilters} onClearFilters={handleClearFilters} />
            )}
          </div>
        )}
      </div>
    </section>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;

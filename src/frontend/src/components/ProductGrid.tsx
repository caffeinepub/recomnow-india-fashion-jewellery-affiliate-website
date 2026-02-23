import { useState, memo, useCallback, useMemo } from 'react';
import { useGetAllProducts } from '../hooks/useQueries';
import { ProductCategory, FashionCategory, JewelleryCategory } from '../backend';
import { ExternalLink, Loader2, Package, Filter, X, Star, Zap, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from './ui/sheet';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import OptimizedImage from './OptimizedImage';

// Memoized ProductCard component to prevent unnecessary re-renders
const ProductCard = memo(({ product, getCategoryLabel }: { product: any; getCategoryLabel: (cat: ProductCategory) => string }) => (
  <article className="group relative bg-white rounded-xl overflow-hidden border-2 border-gold-300 hover:border-gold-500 transition-all hover:shadow-2xl card-hover-effect">
    {/* Badge Overlay */}
    <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
      {Number(product.discountPercentage) >= 50 && (
        <div className="bg-gradient-to-r from-gold-600 to-gold-700 text-navy-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <Zap className="h-3 w-3" />
          {Number(product.discountPercentage)}% OFF
        </div>
      )}
      <div className="bg-navy-800 text-navy-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
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
          className="inline-flex items-center justify-center gap-1 w-full px-4 py-3 rounded-full bg-green-400 text-pink-500 text-sm font-bold hover:bg-green-500 transition-all shadow-md hover:shadow-lg"
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
  const [selectedFashionCategories, setSelectedFashionCategories] = useState<FashionCategory[]>([]);
  const [selectedJewelleryCategories, setSelectedJewelleryCategories] = useState<JewelleryCategory[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fashionExpanded, setFashionExpanded] = useState(true);
  const [jewelleryExpanded, setJewelleryExpanded] = useState(true);

  const { data: allProducts, isLoading, error } = useGetAllProducts();

  const handleFashionCategoryToggle = useCallback((category: FashionCategory) => {
    setSelectedFashionCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  const handleJewelleryCategoryToggle = useCallback((category: JewelleryCategory) => {
    setSelectedJewelleryCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedFashionCategories([]);
    setSelectedJewelleryCategories([]);
    setPriceRange([0, 10000]);
  }, []);

  const hasActiveFilters = useMemo(() => 
    selectedFashionCategories.length > 0 || selectedJewelleryCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000,
    [selectedFashionCategories.length, selectedJewelleryCategories.length, priceRange]
  );

  const getCategoryLabel = useCallback((category: ProductCategory): string => {
    if (category.__kind__ === 'fashion') {
      const fashionLabels: Record<FashionCategory, string> = {
        [FashionCategory.sarees]: 'Sarees',
        [FashionCategory.kurtaKurtis]: 'Kurta & Kurtis',
        [FashionCategory.festive]: 'Festive',
        [FashionCategory.gowns]: 'Gowns',
        [FashionCategory.salwarSuits]: 'Salwar Suits',
        [FashionCategory.lehengaCholis]: 'Lehenga Cholis',
        [FashionCategory.westernWear]: 'Western Wear',
        [FashionCategory.sportsWear]: 'Sports Wear',
      };
      return fashionLabels[category.fashion];
    } else {
      const jewelleryLabels: Record<JewelleryCategory, string> = {
        [JewelleryCategory.rings]: 'Rings',
        [JewelleryCategory.necklaces]: 'Necklaces',
      };
      return jewelleryLabels[category.jewellery];
    }
  }, []);

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    
    let filtered = allProducts;

    // Filter by category
    if (selectedFashionCategories.length > 0 || selectedJewelleryCategories.length > 0) {
      filtered = filtered.filter(p => {
        if (p.category.__kind__ === 'fashion' && selectedFashionCategories.length > 0) {
          return selectedFashionCategories.includes(p.category.fashion);
        }
        if (p.category.__kind__ === 'jewellery' && selectedJewelleryCategories.length > 0) {
          return selectedJewelleryCategories.includes(p.category.jewellery);
        }
        return false;
      });
    }

    // Filter by price
    const minPrice = priceRange[0] * 100;
    const maxPrice = priceRange[1] * 100;
    filtered = filtered.filter(p => {
      const price = Number(p.price);
      return price >= minPrice && price <= maxPrice;
    });

    return filtered;
  }, [allProducts, selectedFashionCategories, selectedJewelleryCategories, priceRange]);

  const fashionProducts = useMemo(() => 
    filteredProducts.filter(p => p.category.__kind__ === 'fashion'),
    [filteredProducts]
  );

  const jewelleryProducts = useMemo(() => 
    filteredProducts.filter(p => p.category.__kind__ === 'jewellery'),
    [filteredProducts]
  );

  const fashionCategoryOptions = useMemo(() => [
    { value: FashionCategory.sarees, label: 'Sarees' },
    { value: FashionCategory.kurtaKurtis, label: 'Kurta & Kurtis' },
    { value: FashionCategory.festive, label: 'Festive' },
    { value: FashionCategory.gowns, label: 'Gowns' },
    { value: FashionCategory.salwarSuits, label: 'Salwar Suits' },
    { value: FashionCategory.lehengaCholis, label: 'Lehenga Cholis' },
    { value: FashionCategory.westernWear, label: 'Western Wear' },
    { value: FashionCategory.sportsWear, label: 'Sports Wear' },
  ], []);

  const jewelleryCategoryOptions = useMemo(() => [
    { value: JewelleryCategory.rings, label: 'Rings' },
    { value: JewelleryCategory.necklaces, label: 'Necklaces' },
  ], []);

  if (error) {
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
              {isLoading ? 'Loading...' : `${filteredProducts.length} products available`}
            </p>
          </div>
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                className="border-gold-500 text-gold-800 hover:bg-gold-100 font-semibold"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters {hasActiveFilters && `(${selectedFashionCategories.length + selectedJewelleryCategories.length})`}
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
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="text-gold-700 hover:text-gold-800 hover:bg-gold-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  
                  {/* Fashion Category */}
                  <Collapsible open={fashionExpanded} onOpenChange={setFashionExpanded} className="mb-4">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gold-50 rounded-lg transition-colors">
                      <span className="font-semibold text-navy-900">Fashion</span>
                      {fashionExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 pt-2 space-y-3">
                      {fashionCategoryOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`fashion-${option.value}`}
                            checked={selectedFashionCategories.includes(option.value)}
                            onCheckedChange={() => handleFashionCategoryToggle(option.value)}
                            className="border-gold-500 data-[state=checked]:bg-gold-600"
                          />
                          <label
                            htmlFor={`fashion-${option.value}`}
                            className="text-sm font-medium text-navy-800 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Jewellery Category */}
                  <Collapsible open={jewelleryExpanded} onOpenChange={setJewelleryExpanded}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gold-50 rounded-lg transition-colors">
                      <span className="font-semibold text-navy-900">Jewellery</span>
                      {jewelleryExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 pt-2 space-y-3">
                      {jewelleryCategoryOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`jewellery-${option.value}`}
                            checked={selectedJewelleryCategories.includes(option.value)}
                            onCheckedChange={() => handleJewelleryCategoryToggle(option.value)}
                            className="border-gold-500 data-[state=checked]:bg-gold-600"
                          />
                          <label
                            htmlFor={`jewellery-${option.value}`}
                            className="text-sm font-medium text-navy-800 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
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
                    className="mt-2 price-range-slider"
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
        ) : filteredProducts.length === 0 ? (
          <EmptyState hasActiveFilters={hasActiveFilters} onClearFilters={handleClearFilters} />
        ) : (
          <div className="space-y-12">
            {fashionProducts.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-navy-900 border-b-2 border-gold-400 pb-2">
                  Fashion Collection
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {fashionProducts.map((product) => (
                    <ProductCard key={product.id.toString()} product={product} getCategoryLabel={getCategoryLabel} />
                  ))}
                </div>
              </div>
            )}

            {jewelleryProducts.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-navy-900 border-b-2 border-gold-400 pb-2">
                  Jewellery Collection
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {jewelleryProducts.map((product) => (
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

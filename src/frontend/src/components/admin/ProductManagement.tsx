import { useState } from 'react';
import { useGetProducts, useDeleteProduct, useAddProduct, useUpdateProduct } from '../../hooks/useQueries';
import { ProductCategory, FashionCategory, JewelleryCategory, type Product } from '../../backend';
import { Trash2, Loader2, Package, Plus, Pencil, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../hooks/useAuth';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Category display names mapping
const FASHION_LABELS: Record<FashionCategory, string> = {
  [FashionCategory.sarees]: 'Sarees',
  [FashionCategory.kurtaKurtis]: 'Kurta & Kurtis',
  [FashionCategory.festive]: 'Festive',
  [FashionCategory.gowns]: 'Gowns',
  [FashionCategory.salwarSuits]: 'Salwar Suits',
  [FashionCategory.lehengaCholis]: 'Lehenga Cholis',
  [FashionCategory.westernWear]: 'Western Wear',
  [FashionCategory.sportsWear]: 'Sports Wear',
};

const JEWELLERY_LABELS: Record<JewelleryCategory, string> = {
  [JewelleryCategory.rings]: 'Rings',
  [JewelleryCategory.necklaces]: 'Necklaces',
};

function getCategoryLabel(category: ProductCategory): string {
  if (category.__kind__ === 'fashion') {
    return FASHION_LABELS[category.fashion];
  } else {
    return JEWELLERY_LABELS[category.jewellery];
  }
}

export default function ProductManagement() {
  const { data: products = [], isLoading } = useGetProducts();
  const deleteProductMutation = useDeleteProduct();
  const addProductMutation = useAddProduct();
  const updateProductMutation = useUpdateProduct();
  const { sessionToken, isAuthenticated: customAuthAuthenticated, username } = useAuth();
  const { identity } = useInternetIdentity();

  // User is authenticated if they have either custom auth session OR Internet Identity
  const isAuthenticated = customAuthAuthenticated || !!identity;

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<bigint | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [categoryType, setCategoryType] = useState<'fashion' | 'jewellery'>('fashion');
  const [fashionCategory, setFashionCategory] = useState<FashionCategory>(FashionCategory.sarees);
  const [jewelleryCategory, setJewelleryCategory] = useState<JewelleryCategory>(JewelleryCategory.rings);
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setAffiliateLink('');
    setCategoryType('fashion');
    setFashionCategory(FashionCategory.sarees);
    setJewelleryCategory(JewelleryCategory.rings);
    setPrice('');
    setMrp('');
    setDiscountPercentage('');
    setIsFeatured(false);
  };

  const loadProductForEdit = (product: Product) => {
    setTitle(product.title);
    setDescription(product.description || '');
    setImageUrl(product.imageUrl);
    setAffiliateLink(product.affiliateLink);
    
    if (product.category.__kind__ === 'fashion') {
      setCategoryType('fashion');
      setFashionCategory(product.category.fashion);
    } else {
      setCategoryType('jewellery');
      setJewelleryCategory(product.category.jewellery);
    }
    
    setPrice(product.price.toString());
    setMrp(product.mrp.toString());
    setDiscountPercentage(product.discountPercentage.toString());
    setIsFeatured(product.isFeatured);
    setEditingProduct(product);
    setShowEditDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.group('📝 PRODUCT FORM SUBMIT');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Form Mode:', editingProduct ? 'EDIT' : 'ADD');
    console.log('Authentication State:', {
      isAuthenticated,
      customAuthAuthenticated,
      hasSessionToken: !!sessionToken,
      hasInternetIdentity: !!identity,
      identityPrincipal: identity?.getPrincipal().toString(),
      username,
    });
    console.log('Form Data:', {
      title,
      price,
      mrp,
      discountPercentage,
      categoryType,
      isFeatured,
    });

    if (!isAuthenticated) {
      console.error('❌ User not authenticated');
      console.groupEnd();
      toast.error('Please log in to add products');
      return;
    }

    if (!title.trim() || !imageUrl.trim() || !affiliateLink.trim()) {
      console.error('❌ Validation failed: Missing required fields');
      console.groupEnd();
      toast.error('Please fill in all required fields');
      return;
    }

    const priceNum = parseInt(price);
    const mrpNum = parseInt(mrp);
    const discountNum = parseInt(discountPercentage);

    if (isNaN(priceNum) || isNaN(mrpNum) || isNaN(discountNum)) {
      console.error('❌ Validation failed: Invalid numbers');
      console.groupEnd();
      toast.error('Please enter valid numbers for price, MRP, and discount');
      return;
    }

    const category: ProductCategory = categoryType === 'fashion'
      ? { __kind__: 'fashion', fashion: fashionCategory }
      : { __kind__: 'jewellery', jewellery: jewelleryCategory };

    const productInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim(),
      affiliateLink: affiliateLink.trim(),
      category,
      price: BigInt(priceNum),
      mrp: BigInt(mrpNum),
      discountPercentage: BigInt(discountNum),
      isFeatured,
    };

    console.log('✅ Validation passed');
    console.log('Product Input Object:', productInput);

    try {
      if (editingProduct) {
        console.log('Calling UPDATE mutation...');
        await updateProductMutation.mutateAsync({
          id: editingProduct.id,
          ...productInput,
        });
        toast.success('Product updated successfully');
        setShowEditDialog(false);
      } else {
        console.log('Calling ADD mutation...');
        await addProductMutation.mutateAsync(productInput);
        toast.success('Product added successfully');
        setShowAddDialog(false);
      }
      console.log('✅ Operation completed successfully');
      resetForm();
      setEditingProduct(null);
    } catch (error: any) {
      console.group('❌ PRODUCT OPERATION ERROR (Component Level)');
      console.error('Error caught in component:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      // Extract detailed error information
      let errorMessage = 'Failed to save product';

      if (error?.message) {
        errorMessage = error.message;
      }

      console.log('Extracted error message:', errorMessage);
      toast.error(errorMessage);

      console.groupEnd();
      console.groupEnd();
    }
  };

  const handleDelete = async () => {
    if (deleteProductId === null) return;

    console.group('🗑️ DELETE PRODUCT (Component)');
    console.log('Product ID:', deleteProductId.toString());

    try {
      await deleteProductMutation.mutateAsync(deleteProductId);
      toast.success('Product deleted successfully');
      setDeleteProductId(null);
      console.log('✅ Delete successful');
    } catch (error: any) {
      console.error('❌ Delete failed:', error);
      
      let errorMessage = 'Failed to delete product';
      if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
    console.groupEnd();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-magenta" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Product Management</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your product catalog ({products.length} products)
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowAddDialog(true);
          }}
          disabled={!isAuthenticated}
          className="flex items-center gap-2 bg-gradient-rainbow hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="h-5 w-5 text-blue-600" />
          <span className="text-blue-600 font-medium">Add Product</span>
        </Button>
      </div>

      {!isAuthenticated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          Please log in to add or manage products.
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h4 className="text-lg font-semibold text-foreground mb-2">No products yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by adding your first product
          </p>
          <Button
            onClick={() => {
              resetForm();
              setShowAddDialog(true);
            }}
            disabled={!isAuthenticated}
            className="bg-gradient-rainbow hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="h-5 w-5 mr-2 text-blue-600" />
            <span className="text-blue-600 font-medium">Add Your First Product</span>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div
              key={product.id.toString()}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
            >
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate">{product.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {getCategoryLabel(product.category)} • ₹{product.price.toString()} • {product.discountPercentage.toString()}% off
                </p>
                {product.isFeatured && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary-magenta/10 text-primary-magenta rounded">
                    Featured
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={product.affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-blue-600"
                  title="View on Amazon"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
                <button
                  onClick={() => loadProductForEdit(product)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-blue-600"
                  title="Edit product"
                  disabled={!isAuthenticated}
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setDeleteProductId(product.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-destructive disabled:opacity-50"
                  title="Delete product"
                  disabled={!isAuthenticated}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-600">Add New Product</DialogTitle>
            <DialogDescription>
              Fill in the product details below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Product Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                placeholder="Enter product title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Image URL *
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Amazon Affiliate Link *
              </label>
              <input
                type="url"
                value={affiliateLink}
                onChange={(e) => setAffiliateLink(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                placeholder="https://amazon.in/..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category Type *
                </label>
                <select
                  value={categoryType}
                  onChange={(e) => setCategoryType(e.target.value as 'fashion' | 'jewellery')}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                >
                  <option value="fashion">Fashion</option>
                  <option value="jewellery">Jewellery</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {categoryType === 'fashion' ? 'Fashion Category' : 'Jewellery Category'} *
                </label>
                {categoryType === 'fashion' ? (
                  <select
                    value={fashionCategory}
                    onChange={(e) => setFashionCategory(e.target.value as FashionCategory)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                  >
                    {Object.entries(FASHION_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={jewelleryCategory}
                    onChange={(e) => setJewelleryCategory(e.target.value as JewelleryCategory)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                  >
                    {Object.entries(JEWELLERY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                  placeholder="499"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  MRP (₹) *
                </label>
                <input
                  type="number"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                  placeholder="999"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Discount (%) *
                </label>
                <input
                  type="number"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                  placeholder="50"
                  required
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary-magenta focus:ring-2 focus:ring-primary-magenta"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-foreground">
                Mark as Featured Product
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addProductMutation.isPending}
                className="bg-gradient-rainbow hover:opacity-90"
              >
                {addProductMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-600" />
                    <span className="text-blue-600">Adding...</span>
                  </>
                ) : (
                  <span className="text-blue-600 font-medium">Add Product</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-600">Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Product Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                placeholder="Enter product title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Image URL *
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Amazon Affiliate Link *
              </label>
              <input
                type="url"
                value={affiliateLink}
                onChange={(e) => setAffiliateLink(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                placeholder="https://amazon.in/..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category Type *
                </label>
                <select
                  value={categoryType}
                  onChange={(e) => setCategoryType(e.target.value as 'fashion' | 'jewellery')}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                >
                  <option value="fashion">Fashion</option>
                  <option value="jewellery">Jewellery</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {categoryType === 'fashion' ? 'Fashion Category' : 'Jewellery Category'} *
                </label>
                {categoryType === 'fashion' ? (
                  <select
                    value={fashionCategory}
                    onChange={(e) => setFashionCategory(e.target.value as FashionCategory)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                  >
                    {Object.entries(FASHION_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={jewelleryCategory}
                    onChange={(e) => setJewelleryCategory(e.target.value as JewelleryCategory)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                  >
                    {Object.entries(JEWELLERY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                  placeholder="499"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  MRP (₹) *
                </label>
                <input
                  type="number"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                  placeholder="999"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Discount (%) *
                </label>
                <input
                  type="number"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                  placeholder="50"
                  required
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeaturedEdit"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary-magenta focus:ring-2 focus:ring-primary-magenta"
              />
              <label htmlFor="isFeaturedEdit" className="text-sm font-medium text-foreground">
                Mark as Featured Product
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  resetForm();
                  setEditingProduct(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProductMutation.isPending}
                className="bg-gradient-rainbow hover:opacity-90"
              >
                {updateProductMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-600" />
                    <span className="text-blue-600">Updating...</span>
                  </>
                ) : (
                  <span className="text-blue-600 font-medium">Update Product</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteProductId !== null} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the product as inactive. You can restore it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProductMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

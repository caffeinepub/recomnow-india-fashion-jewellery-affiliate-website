import { useState } from 'react';
import { useGetAllProducts, useDeleteProduct, useAddProduct, useUpdateProduct } from '../../hooks/useQueries';
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
  const { data: products = [], isLoading } = useGetAllProducts();
  const deleteProductMutation = useDeleteProduct();
  const addProductMutation = useAddProduct();
  const updateProductMutation = useUpdateProduct();
  const { sessionToken, isSessionValid } = useAuth();
  const { identity } = useInternetIdentity();

  // User is authenticated if they have either a valid custom auth session OR Internet Identity
  const isAuthenticated = (!!sessionToken && isSessionValid()) || !!identity;

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

    if (!isAuthenticated) {
      toast.error('Please log in to manage products');
      return;
    }

    if (!title.trim() || !imageUrl.trim() || !affiliateLink.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const priceNum = parseInt(price);
    const mrpNum = parseInt(mrp);
    const discountNum = parseInt(discountPercentage);

    if (isNaN(priceNum) || isNaN(mrpNum) || isNaN(discountNum)) {
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

    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({ id: editingProduct.id, input: productInput });
        toast.success('Product updated successfully');
        setShowEditDialog(false);
      } else {
        await addProductMutation.mutateAsync(productInput);
        toast.success('Product added successfully');
        setShowAddDialog(false);
      }
      resetForm();
      setEditingProduct(null);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to save product';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (deleteProductId === null) return;
    try {
      await deleteProductMutation.mutateAsync(deleteProductId);
      toast.success('Product deleted successfully');
      setDeleteProductId(null);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete product';
      toast.error(errorMessage);
    }
  };

  const isMutating =
    addProductMutation.isPending ||
    updateProductMutation.isPending ||
    deleteProductMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  const ProductForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Product Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-400"
          placeholder="Enter product title"
          required
          disabled={isMutating}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-400"
          placeholder="Enter product description"
          rows={3}
          disabled={isMutating}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Image URL *</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-400"
          placeholder="https://example.com/image.jpg"
          required
          disabled={isMutating}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Amazon Affiliate Link *</label>
        <input
          type="url"
          value={affiliateLink}
          onChange={(e) => setAffiliateLink(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-400"
          placeholder="https://amazon.in/..."
          required
          disabled={isMutating}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Category Type *</label>
          <select
            value={categoryType}
            onChange={(e) => setCategoryType(e.target.value as 'fashion' | 'jewellery')}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-400"
            disabled={isMutating}
          >
            <option value="fashion">Fashion</option>
            <option value="jewellery">Jewellery</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {categoryType === 'fashion' ? 'Fashion Category' : 'Jewellery Category'} *
          </label>
          {categoryType === 'fashion' ? (
            <select
              value={fashionCategory}
              onChange={(e) => setFashionCategory(e.target.value as FashionCategory)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-400"
              disabled={isMutating}
            >
              {Object.entries(FASHION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          ) : (
            <select
              value={jewelleryCategory}
              onChange={(e) => setJewelleryCategory(e.target.value as JewelleryCategory)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-400"
              disabled={isMutating}
            >
              {Object.entries(JEWELLERY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Price (₹) *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-400"
            placeholder="999"
            required
            min="0"
            disabled={isMutating}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">MRP (₹) *</label>
          <input
            type="number"
            value={mrp}
            onChange={(e) => setMrp(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-400"
            placeholder="1499"
            required
            min="0"
            disabled={isMutating}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Discount % *</label>
          <input
            type="number"
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-400"
            placeholder="33"
            required
            min="0"
            max="100"
            disabled={isMutating}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isFeatured"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="rounded border-border"
          disabled={isMutating}
        />
        <label htmlFor="isFeatured" className="text-sm font-medium text-foreground">
          Featured Product
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isMutating}
          className="flex-1 bg-gold-500 hover:bg-gold-600 text-white font-semibold"
        >
          {isMutating ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            editingProduct ? 'Update Product' : 'Add Product'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetForm();
            setEditingProduct(null);
            setShowAddDialog(false);
            setShowEditDialog(false);
          }}
          disabled={isMutating}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

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
          className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold"
        >
          <Plus className="h-5 w-5" />
          Add Product
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
          <p className="text-sm text-muted-foreground mb-4">Get started by adding your first product</p>
          <Button
            onClick={() => { resetForm(); setShowAddDialog(true); }}
            disabled={!isAuthenticated}
            className="bg-gold-500 hover:bg-gold-600 text-white font-semibold"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Product
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div
              key={product.id.toString()}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-8 w-8 text-navy-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate">{product.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {getCategoryLabel(product.category)} • ₹{product.price.toString()} • {product.discountPercentage.toString()}% off
                </p>
                {product.isFeatured && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gold-100 text-gold-700 rounded">
                    ⭐ Featured
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
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
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-navy-600 disabled:opacity-50"
                  title="Edit product"
                  disabled={!isAuthenticated || isMutating}
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setDeleteProductId(product.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-destructive disabled:opacity-50"
                  title="Delete product"
                  disabled={!isAuthenticated || isMutating}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { resetForm(); } setShowAddDialog(open); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Fill in the product details below</DialogDescription>
          </DialogHeader>
          <ProductForm />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => { if (!open) { resetForm(); setEditingProduct(null); } setShowEditDialog(open); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details below</DialogDescription>
          </DialogHeader>
          <ProductForm />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteProductId !== null} onOpenChange={(open) => { if (!open) setDeleteProductId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProductMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </span>
              ) : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

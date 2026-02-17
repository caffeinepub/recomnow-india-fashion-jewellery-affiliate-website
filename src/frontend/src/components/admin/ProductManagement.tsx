import { useState } from 'react';
import { useGetProducts, useDeleteProduct, useAddProduct, useUpdateProduct } from '../../hooks/useQueries';
import { ProductCategory, type Product } from '../../backend';
import { Trash2, Loader2, Package, Plus, Pencil } from 'lucide-react';
import { toast } from 'sonner';
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

export default function ProductManagement() {
  const { data: products, isLoading } = useGetProducts();
  const deleteProduct = useDeleteProduct();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<bigint | null>(null);
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Manual Product Upload Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: '',
    discountPercentage: '',
    mrp: '',
    category: ProductCategory.sarees as ProductCategory,
    affiliateUrl: '',
    isFeatured: false,
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: '',
    discountPercentage: '',
    mrp: '',
    category: ProductCategory.sarees as ProductCategory,
    affiliateUrl: '',
    isFeatured: false,
  });

  const handleInputChange = (field: string, value: string | boolean | ProductCategory) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditInputChange = (field: string, value: string | boolean | ProductCategory) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation - required fields
    if (!formData.title.trim()) {
      toast.error('Please enter a product title');
      return;
    }
    if (!formData.imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }
    if (!formData.affiliateUrl.trim()) {
      toast.error('Please enter an affiliate URL');
      return;
    }
    if (!formData.price.trim()) {
      toast.error('Please enter a price');
      return;
    }
    if (!formData.discountPercentage.trim()) {
      toast.error('Please enter a discount percentage');
      return;
    }
    if (!formData.mrp.trim()) {
      toast.error('Please enter an M.R.P.');
      return;
    }

    // Validate URLs
    try {
      new URL(formData.imageUrl);
    } catch {
      toast.error('Please enter a valid image URL');
      return;
    }

    try {
      new URL(formData.affiliateUrl);
    } catch {
      toast.error('Please enter a valid affiliate URL');
      return;
    }

    // Validate numeric fields
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const discountNum = parseFloat(formData.discountPercentage);
    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
      toast.error('Please enter a valid discount percentage (0-100)');
      return;
    }

    const mrpNum = parseFloat(formData.mrp);
    if (isNaN(mrpNum) || mrpNum < 0) {
      toast.error('Please enter a valid M.R.P.');
      return;
    }

    try {
      await addProduct.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl.trim(),
        affiliateLink: formData.affiliateUrl.trim(),
        category: formData.category,
        price: BigInt(Math.round(priceNum * 100)),
        discountPercentage: BigInt(Math.round(discountNum)),
        mrp: BigInt(Math.round(mrpNum * 100)),
        isFeatured: formData.isFeatured,
      });

      // Clear form on success
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        price: '',
        discountPercentage: '',
        mrp: '',
        category: ProductCategory.sarees,
        affiliateUrl: '',
        isFeatured: false,
      });
    } catch (error) {
      console.error('Add product error:', error);
    }
  };

  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setEditFormData({
      title: product.title,
      description: product.description || '',
      imageUrl: product.imageUrl,
      price: (Number(product.price) / 100).toString(),
      discountPercentage: Number(product.discountPercentage).toString(),
      mrp: (Number(product.mrp) / 100).toString(),
      category: product.category,
      affiliateUrl: product.affiliateLink,
      isFeatured: product.isFeatured,
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productToEdit) return;

    // Validation - required fields
    if (!editFormData.title.trim()) {
      toast.error('Please enter a product title');
      return;
    }
    if (!editFormData.imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }
    if (!editFormData.affiliateUrl.trim()) {
      toast.error('Please enter an affiliate URL');
      return;
    }
    if (!editFormData.price.trim()) {
      toast.error('Please enter a price');
      return;
    }
    if (!editFormData.discountPercentage.trim()) {
      toast.error('Please enter a discount percentage');
      return;
    }
    if (!editFormData.mrp.trim()) {
      toast.error('Please enter an M.R.P.');
      return;
    }

    // Validate URLs
    try {
      new URL(editFormData.imageUrl);
    } catch {
      toast.error('Please enter a valid image URL');
      return;
    }

    try {
      new URL(editFormData.affiliateUrl);
    } catch {
      toast.error('Please enter a valid affiliate URL');
      return;
    }

    // Validate numeric fields
    const priceNum = parseFloat(editFormData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const discountNum = parseFloat(editFormData.discountPercentage);
    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
      toast.error('Please enter a valid discount percentage (0-100)');
      return;
    }

    const mrpNum = parseFloat(editFormData.mrp);
    if (isNaN(mrpNum) || mrpNum < 0) {
      toast.error('Please enter a valid M.R.P.');
      return;
    }

    try {
      await updateProduct.mutateAsync({
        id: productToEdit.id,
        title: editFormData.title.trim(),
        description: editFormData.description.trim() || undefined,
        imageUrl: editFormData.imageUrl.trim(),
        affiliateLink: editFormData.affiliateUrl.trim(),
        category: editFormData.category,
        price: BigInt(Math.round(priceNum * 100)),
        discountPercentage: BigInt(Math.round(discountNum)),
        mrp: BigInt(Math.round(mrpNum * 100)),
        isFeatured: editFormData.isFeatured,
      });

      setEditDialogOpen(false);
      setProductToEdit(null);
    } catch (error) {
      console.error('Update product error:', error);
    }
  };

  const handleDeleteClick = (id: bigint) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete !== null) {
      try {
        await deleteProduct.mutateAsync(productToDelete);
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const getCategoryLabel = (category: ProductCategory): string => {
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
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-magenta" />
      </div>
    );
  }

  const isProcessing = addProduct.isPending;
  const isEditProcessing = updateProduct.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">Product Management</h3>
        <div className="text-sm text-muted-foreground">
          {products?.length || 0} product{products?.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Manual Product Upload Form */}
      <div className="bg-muted/20 rounded-xl p-6 border border-border">
        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary-magenta" />
          Add New Product
        </h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5">
                Product Title <span className="text-destructive">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Elegant Silk Saree with Golden Border"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta transition-shadow"
                disabled={isProcessing}
              />
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-foreground mb-1.5">
                Image URL <span className="text-destructive">*</span>
              </label>
              <input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                placeholder="https://example.com/product-image.jpg"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta transition-shadow"
                disabled={isProcessing}
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1.5">
                Category <span className="text-destructive">*</span>
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value as ProductCategory)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta transition-shadow"
                disabled={isProcessing}
              >
                <option value={ProductCategory.bottomWear}>Bottom Wear</option>
                <option value={ProductCategory.chunnisDupattas}>Chunnis & Dupattas</option>
                <option value={ProductCategory.dressMaterial}>Dress Material</option>
                <option value={ProductCategory.gowns}>Gowns</option>
                <option value={ProductCategory.kurtasKurtis}>Kurtas & Kurtis</option>
                <option value={ProductCategory.lehengaCholis}>Lehenga Cholis</option>
                <option value={ProductCategory.salwarSuits}>Salwar Suits</option>
                <option value={ProductCategory.sarees}>Sarees</option>
                <option value={ProductCategory.westernWear}>Western Wear</option>
                <option value={ProductCategory.sportswear}>Sportswear</option>
                <option value={ProductCategory.jewellery}>Jewellery</option>
                <option value={ProductCategory.festive}>Festive</option>
              </select>
            </div>

            {/* Affiliate URL */}
            <div>
              <label htmlFor="affiliateUrl" className="block text-sm font-medium text-foreground mb-1.5">
                Affiliate URL <span className="text-destructive">*</span>
              </label>
              <input
                id="affiliateUrl"
                type="url"
                value={formData.affiliateUrl}
                onChange={(e) => handleInputChange('affiliateUrl', e.target.value)}
                placeholder="https://www.amazon.in/... or https://www.flipkart.com/..."
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta transition-shadow"
                disabled={isProcessing}
              />
            </div>

            {/* Description - Optional */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
                Description <span className="text-muted-foreground text-xs">(optional)</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the product features, materials, and benefits..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta transition-shadow resize-none"
                disabled={isProcessing}
              />
            </div>

            {/* Price - Required */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1.5">
                Price (₹) <span className="text-destructive">*</span>
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="e.g., 1999"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta transition-shadow"
                disabled={isProcessing}
                required
              />
            </div>

            {/* Discount Percentage - Required */}
            <div>
              <label htmlFor="discountPercentage" className="block text-sm font-medium text-foreground mb-1.5">
                Discount % <span className="text-destructive">*</span>
              </label>
              <input
                id="discountPercentage"
                type="number"
                step="1"
                min="0"
                max="100"
                value={formData.discountPercentage}
                onChange={(e) => handleInputChange('discountPercentage', e.target.value)}
                placeholder="e.g., 25"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta transition-shadow"
                disabled={isProcessing}
                required
              />
            </div>

            {/* M.R.P. - Required */}
            <div className="md:col-span-2">
              <label htmlFor="mrp" className="block text-sm font-medium text-foreground mb-1.5">
                M.R.P. with Strike off (₹) <span className="text-destructive">*</span>
              </label>
              <input
                id="mrp"
                type="number"
                step="0.01"
                min="0"
                value={formData.mrp}
                onChange={(e) => handleInputChange('mrp', e.target.value)}
                placeholder="e.g., 2999"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta transition-shadow"
                disabled={isProcessing}
                required
              />
            </div>

            {/* Featured Checkbox */}
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                id="isFeatured"
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary-magenta focus:ring-2 focus:ring-primary-magenta"
                disabled={isProcessing}
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-foreground cursor-pointer">
                Mark as Featured Product
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary-magenta text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Adding Product...
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Add Product
              </>
            )}
          </button>
        </form>
      </div>

      {/* Product List */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground">All Products</h4>
        
        {products && products.length === 0 && (
          <div className="text-center py-12 bg-muted/10 rounded-xl border border-dashed border-border">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No products yet. Add your first product using the form above!</p>
          </div>
        )}
        
        <div className="grid gap-4">
          {products?.map((product) => (
            <div
              key={Number(product.id)}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary-magenta/30 transition-colors"
            >
              <img
                src={product.imageUrl || '/assets/generated/recomnow-logo.dim_200x200.png'}
                alt={product.title}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/generated/recomnow-logo.dim_200x200.png';
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate">{product.title}</h4>
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                )}
                <div className="flex items-center gap-4 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground line-through">
                    ₹{(Number(product.mrp) / 100).toFixed(2)}
                  </span>
                  <span className="text-sm font-medium text-primary-magenta">
                    ₹{(Number(product.price) / 100).toFixed(2)}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                    {Number(product.discountPercentage)}% OFF
                  </span>
                  <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-muted">
                    {getCategoryLabel(product.category)}
                  </span>
                  {product.isFeatured && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gradient-rainbow text-white">Featured</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleEditClick(product)}
                  disabled={updateProduct.isPending}
                  className="p-2 rounded-lg hover:bg-primary-magenta/10 text-primary-magenta transition-colors disabled:opacity-50"
                  title="Edit product"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(product.id)}
                  disabled={deleteProduct.isPending}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50"
                  title="Delete product"
                >
                  {deleteProduct.isPending && productToDelete === product.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details below. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="edit-title" className="block text-sm font-medium text-foreground mb-1.5">
                  Product Title <span className="text-destructive">*</span>
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => handleEditInputChange('title', e.target.value)}
                  placeholder="e.g., Elegant Silk Saree with Golden Border"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta transition-shadow"
                  disabled={isEditProcessing}
                />
              </div>

              {/* Image URL */}
              <div className="md:col-span-2">
                <label htmlFor="edit-imageUrl" className="block text-sm font-medium text-foreground mb-1.5">
                  Image URL <span className="text-destructive">*</span>
                </label>
                <input
                  id="edit-imageUrl"
                  type="url"
                  value={editFormData.imageUrl}
                  onChange={(e) => handleEditInputChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/product-image.jpg"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta transition-shadow"
                  disabled={isEditProcessing}
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="edit-category" className="block text-sm font-medium text-foreground mb-1.5">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  id="edit-category"
                  value={editFormData.category}
                  onChange={(e) => handleEditInputChange('category', e.target.value as ProductCategory)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta transition-shadow"
                  disabled={isEditProcessing}
                >
                  <option value={ProductCategory.bottomWear}>Bottom Wear</option>
                  <option value={ProductCategory.chunnisDupattas}>Chunnis & Dupattas</option>
                  <option value={ProductCategory.dressMaterial}>Dress Material</option>
                  <option value={ProductCategory.gowns}>Gowns</option>
                  <option value={ProductCategory.kurtasKurtis}>Kurtas & Kurtis</option>
                  <option value={ProductCategory.lehengaCholis}>Lehenga Cholis</option>
                  <option value={ProductCategory.salwarSuits}>Salwar Suits</option>
                  <option value={ProductCategory.sarees}>Sarees</option>
                  <option value={ProductCategory.westernWear}>Western Wear</option>
                  <option value={ProductCategory.sportswear}>Sportswear</option>
                  <option value={ProductCategory.jewellery}>Jewellery</option>
                  <option value={ProductCategory.festive}>Festive</option>
                </select>
              </div>

              {/* Affiliate URL */}
              <div>
                <label htmlFor="edit-affiliateUrl" className="block text-sm font-medium text-foreground mb-1.5">
                  Affiliate URL <span className="text-destructive">*</span>
                </label>
                <input
                  id="edit-affiliateUrl"
                  type="url"
                  value={editFormData.affiliateUrl}
                  onChange={(e) => handleEditInputChange('affiliateUrl', e.target.value)}
                  placeholder="https://www.amazon.in/... or https://www.flipkart.com/..."
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta transition-shadow"
                  disabled={isEditProcessing}
                />
              </div>

              {/* Description - Optional */}
              <div className="md:col-span-2">
                <label htmlFor="edit-description" className="block text-sm font-medium text-foreground mb-1.5">
                  Description <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => handleEditInputChange('description', e.target.value)}
                  placeholder="Describe the product features, materials, and benefits..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta transition-shadow resize-none"
                  disabled={isEditProcessing}
                />
              </div>

              {/* Price - Required */}
              <div>
                <label htmlFor="edit-price" className="block text-sm font-medium text-foreground mb-1.5">
                  Price (₹) <span className="text-destructive">*</span>
                </label>
                <input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.price}
                  onChange={(e) => handleEditInputChange('price', e.target.value)}
                  placeholder="e.g., 1999"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta transition-shadow"
                  disabled={isEditProcessing}
                  required
                />
              </div>

              {/* Discount Percentage - Required */}
              <div>
                <label htmlFor="edit-discountPercentage" className="block text-sm font-medium text-foreground mb-1.5">
                  Discount % <span className="text-destructive">*</span>
                </label>
                <input
                  id="edit-discountPercentage"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={editFormData.discountPercentage}
                  onChange={(e) => handleEditInputChange('discountPercentage', e.target.value)}
                  placeholder="e.g., 25"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta transition-shadow"
                  disabled={isEditProcessing}
                  required
                />
              </div>

              {/* M.R.P. - Required */}
              <div className="md:col-span-2">
                <label htmlFor="edit-mrp" className="block text-sm font-medium text-foreground mb-1.5">
                  M.R.P. with Strike off (₹) <span className="text-destructive">*</span>
                </label>
                <input
                  id="edit-mrp"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.mrp}
                  onChange={(e) => handleEditInputChange('mrp', e.target.value)}
                  placeholder="e.g., 2999"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta transition-shadow"
                  disabled={isEditProcessing}
                  required
                />
              </div>

              {/* Featured Checkbox */}
              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  id="edit-isFeatured"
                  type="checkbox"
                  checked={editFormData.isFeatured}
                  onChange={(e) => handleEditInputChange('isFeatured', e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary-magenta focus:ring-2 focus:ring-primary-magenta"
                  disabled={isEditProcessing}
                />
                <label htmlFor="edit-isFeatured" className="text-sm font-medium text-foreground cursor-pointer">
                  Mark as Featured Product
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setEditDialogOpen(false);
                  setProductToEdit(null);
                }}
                disabled={isEditProcessing}
                className="flex-1 px-6 py-3 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isEditProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-magenta text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isEditProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Pencil className="h-5 w-5" />
                    Update Product
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from your store and remove it from all displays.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

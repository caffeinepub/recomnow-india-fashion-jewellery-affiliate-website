import { useState } from 'react';
import { useGetProducts, useDeleteProduct, useAddProduct, useUpdateProduct } from '../../hooks/useQueries';
import { ProductCategory, FashionCategory, JewelleryCategory, type Product } from '../../backend';
import { Trash2, Loader2, Package, Plus, Pencil, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
    mainCategory: 'fashion' as 'fashion' | 'jewellery',
    fashionCategory: FashionCategory.sarees,
    jewelleryCategory: JewelleryCategory.rings,
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
    mainCategory: 'fashion' as 'fashion' | 'jewellery',
    fashionCategory: FashionCategory.sarees,
    jewelleryCategory: JewelleryCategory.rings,
    affiliateUrl: '',
    isFeatured: false,
  });

  const handleInputChange = (field: string, value: string | boolean | FashionCategory | JewelleryCategory) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditInputChange = (field: string, value: string | boolean | FashionCategory | JewelleryCategory) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const getCategoryLabel = (category: ProductCategory): string => {
    if (category.__kind__ === 'fashion') {
      return FASHION_LABELS[category.fashion];
    } else {
      return JEWELLERY_LABELS[category.jewellery];
    }
  };

  const validateForm = (data: typeof formData) => {
    // Required fields
    if (!data.title.trim()) {
      toast.error('Please enter a product title');
      return false;
    }
    if (!data.imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return false;
    }
    if (!data.affiliateUrl.trim()) {
      toast.error('Please enter an Amazon affiliate URL');
      return false;
    }
    if (!data.price.trim()) {
      toast.error('Please enter a price');
      return false;
    }
    if (!data.discountPercentage.trim()) {
      toast.error('Please enter a discount percentage');
      return false;
    }
    if (!data.mrp.trim()) {
      toast.error('Please enter an M.R.P.');
      return false;
    }

    // Validate URLs
    try {
      new URL(data.imageUrl);
    } catch {
      toast.error('Please enter a valid image URL');
      return false;
    }

    try {
      new URL(data.affiliateUrl);
    } catch {
      toast.error('Please enter a valid affiliate URL');
      return false;
    }

    // Validate numeric fields
    const priceNum = parseFloat(data.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price (greater than 0)');
      return false;
    }

    const discountNum = parseFloat(data.discountPercentage);
    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
      toast.error('Please enter a valid discount percentage (0-100)');
      return false;
    }

    const mrpNum = parseFloat(data.mrp);
    if (isNaN(mrpNum) || mrpNum <= 0) {
      toast.error('Please enter a valid M.R.P. (greater than 0)');
      return false;
    }

    // Validate price logic
    if (priceNum > mrpNum) {
      toast.error('Price cannot be greater than M.R.P.');
      return false;
    }

    return true;
  };

  const buildCategory = (data: typeof formData): ProductCategory => {
    if (data.mainCategory === 'fashion') {
      return { __kind__: 'fashion', fashion: data.fashionCategory };
    } else {
      return { __kind__: 'jewellery', jewellery: data.jewelleryCategory };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(formData)) {
      return;
    }

    const priceNum = parseFloat(formData.price);
    const discountNum = parseFloat(formData.discountPercentage);
    const mrpNum = parseFloat(formData.mrp);

    try {
      await addProduct.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl.trim(),
        affiliateLink: formData.affiliateUrl.trim(),
        category: buildCategory(formData),
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
        mainCategory: 'fashion',
        fashionCategory: FashionCategory.sarees,
        jewelleryCategory: JewelleryCategory.rings,
        affiliateUrl: '',
        isFeatured: false,
      });
    } catch (error) {
      console.error('Add product error:', error);
    }
  };

  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    const mainCategory = product.category.__kind__;
    setEditFormData({
      title: product.title,
      description: product.description || '',
      imageUrl: product.imageUrl,
      price: (Number(product.price) / 100).toFixed(2),
      discountPercentage: Number(product.discountPercentage).toString(),
      mrp: (Number(product.mrp) / 100).toFixed(2),
      mainCategory,
      fashionCategory: mainCategory === 'fashion' ? product.category.fashion : FashionCategory.sarees,
      jewelleryCategory: mainCategory === 'jewellery' ? product.category.jewellery : JewelleryCategory.rings,
      affiliateUrl: product.affiliateLink,
      isFeatured: product.isFeatured,
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productToEdit) return;

    if (!validateForm(editFormData)) {
      return;
    }

    const priceNum = parseFloat(editFormData.price);
    const discountNum = parseFloat(editFormData.discountPercentage);
    const mrpNum = parseFloat(editFormData.mrp);

    try {
      await updateProduct.mutateAsync({
        id: productToEdit.id,
        title: editFormData.title.trim(),
        description: editFormData.description.trim() || undefined,
        imageUrl: editFormData.imageUrl.trim(),
        affiliateLink: editFormData.affiliateUrl.trim(),
        category: buildCategory(editFormData),
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

  const handleDeleteClick = (productId: bigint) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete === null) return;

    try {
      await deleteProduct.mutateAsync(productToDelete);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Delete product error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Add Product Form */}
      <div className="bg-muted/50 rounded-xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-6">
          <Plus className="h-5 w-5 text-gold-600" />
          <h3 className="text-xl font-bold text-foreground">Add New Product</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Product Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                placeholder="e.g., Banarasi Silk Saree"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Main Category <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.mainCategory}
                onChange={(e) => handleInputChange('mainCategory', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                required
              >
                <option value="fashion">Fashion</option>
                <option value="jewellery">Jewellery</option>
              </select>
            </div>

            {formData.mainCategory === 'fashion' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fashion Category <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.fashionCategory}
                  onChange={(e) => handleInputChange('fashionCategory', e.target.value as FashionCategory)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                  required
                >
                  {Object.entries(FASHION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.mainCategory === 'jewellery' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Jewellery Category <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.jewelleryCategory}
                  onChange={(e) => handleInputChange('jewelleryCategory', e.target.value as JewelleryCategory)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                  required
                >
                  {Object.entries(JEWELLERY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Price (₹) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                placeholder="499.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                M.R.P. (₹) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.mrp}
                onChange={(e) => handleInputChange('mrp', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                placeholder="999.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Discount (%) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={formData.discountPercentage}
                onChange={(e) => handleInputChange('discountPercentage', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                placeholder="50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Image URL <span className="text-destructive">*</span>
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Amazon Affiliate URL <span className="text-destructive">*</span>
              </label>
              <input
                type="url"
                value={formData.affiliateUrl}
                onChange={(e) => handleInputChange('affiliateUrl', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                placeholder="https://www.amazon.in/..."
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                placeholder="Product description..."
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                  className="w-4 h-4 rounded border-border text-gold-600 focus:ring-2 focus:ring-gold-600"
                />
                <span className="text-sm font-medium text-foreground">
                  Mark as Featured Product
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={addProduct.isPending}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-gold-600 to-gold-700 text-white font-medium hover:from-gold-700 hover:to-gold-800 transition-all disabled:opacity-50"
          >
            {addProduct.isPending ? (
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

      {/* Products List */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-gold-600" />
          <h3 className="text-xl font-bold text-foreground">
            All Products ({products?.length || 0})
          </h3>
        </div>

        {!products || products.length === 0 ? (
          <div className="text-center py-12 bg-muted/50 rounded-xl border border-border">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No products yet. Add your first product above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {products.map((product) => (
              <div
                key={product.id.toString()}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full md:w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-foreground">{product.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {getCategoryLabel(product.category)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
                          title="Edit product"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Price: </span>
                        <span className="font-bold text-foreground">
                          ₹{(Number(product.price) / 100).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">M.R.P.: </span>
                        <span className="line-through text-muted-foreground">
                          ₹{(Number(product.mrp) / 100).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Discount: </span>
                        <span className="font-bold text-green-600">
                          {Number(product.discountPercentage)}% OFF
                        </span>
                      </div>
                      {product.isFeatured && (
                        <span className="px-2 py-1 bg-gold-100 text-gold-800 rounded-full text-xs font-bold">
                          Featured
                        </span>
                      )}
                    </div>
                    <a
                      href={product.affiliateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-gold-700 hover:text-gold-800 font-medium"
                    >
                      View on Amazon
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => handleEditInputChange('title', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Main Category <span className="text-destructive">*</span>
                </label>
                <select
                  value={editFormData.mainCategory}
                  onChange={(e) => handleEditInputChange('mainCategory', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                  required
                >
                  <option value="fashion">Fashion</option>
                  <option value="jewellery">Jewellery</option>
                </select>
              </div>

              {editFormData.mainCategory === 'fashion' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Fashion Category <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={editFormData.fashionCategory}
                    onChange={(e) => handleEditInputChange('fashionCategory', e.target.value as FashionCategory)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                    required
                  >
                    {Object.entries(FASHION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editFormData.mainCategory === 'jewellery' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Jewellery Category <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={editFormData.jewelleryCategory}
                    onChange={(e) => handleEditInputChange('jewelleryCategory', e.target.value as JewelleryCategory)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                    required
                  >
                    {Object.entries(JEWELLERY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price (₹) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.price}
                  onChange={(e) => handleEditInputChange('price', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  M.R.P. (₹) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.mrp}
                  onChange={(e) => handleEditInputChange('mrp', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Discount (%) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={editFormData.discountPercentage}
                  onChange={(e) => handleEditInputChange('discountPercentage', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Image URL <span className="text-destructive">*</span>
                </label>
                <input
                  type="url"
                  value={editFormData.imageUrl}
                  onChange={(e) => handleEditInputChange('imageUrl', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Amazon Affiliate URL <span className="text-destructive">*</span>
                </label>
                <input
                  type="url"
                  value={editFormData.affiliateUrl}
                  onChange={(e) => handleEditInputChange('affiliateUrl', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => handleEditInputChange('description', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold-600"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.isFeatured}
                    onChange={(e) => handleEditInputChange('isFeatured', e.target.checked)}
                    className="w-4 h-4 rounded border-border text-gold-600 focus:ring-2 focus:ring-gold-600"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Mark as Featured Product
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProduct.isPending}
                className="bg-gradient-to-r from-gold-600 to-gold-700 text-white hover:from-gold-700 hover:to-gold-800"
              >
                {updateProduct.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Product'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

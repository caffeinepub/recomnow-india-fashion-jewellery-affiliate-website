import { useState } from 'react';
import { useGetProducts, useDeleteProduct, useAddProduct, useUpdateProduct } from '../../hooks/useQueries';
import { ProductCategory, FashionCategory, JewelleryCategory, type Product } from '../../backend';
import { Trash2, Loader2, Package, Plus, Pencil, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../hooks/useAuth';
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
  const { sessionToken, username, isAuthenticated } = useAuth();

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

    console.log('[ProductManagement] handleSubmit called', {
      timestamp: new Date().toISOString(),
      hasSessionToken: !!sessionToken,
      sessionTokenLength: sessionToken?.length,
      sessionTokenPreview: sessionToken ? sessionToken.substring(0, 10) + '...' : 'null',
      username,
      isAuthenticated,
      productTitle: formData.title,
    });

    if (!validateForm(formData)) {
      console.log('[ProductManagement] Form validation failed');
      return;
    }

    const priceNum = parseFloat(formData.price);
    const discountNum = parseFloat(formData.discountPercentage);
    const mrpNum = parseFloat(formData.mrp);

    const productInput = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      imageUrl: formData.imageUrl.trim(),
      affiliateLink: formData.affiliateUrl.trim(),
      category: buildCategory(formData),
      price: BigInt(Math.round(priceNum * 100)),
      discountPercentage: BigInt(Math.round(discountNum)),
      mrp: BigInt(Math.round(mrpNum * 100)),
      isFeatured: formData.isFeatured,
    };

    console.log('[ProductManagement] Calling addProduct.mutateAsync', {
      timestamp: new Date().toISOString(),
      productInput: {
        title: productInput.title,
        category: productInput.category,
        price: productInput.price.toString(),
      },
    });

    try {
      await addProduct.mutateAsync(productInput);

      console.log('[ProductManagement] Product added successfully', {
        timestamp: new Date().toISOString(),
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
      console.error('[ProductManagement] Add product error', {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : error,
        errorType: typeof error,
      });
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
      console.error('Edit product error:', error);
    }
  };

  const handleDeleteClick = (id: bigint) => {
    setProductToDelete(id);
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Plus className="h-6 w-6 text-gold-600" />
          <h2 className="text-2xl font-bold text-navy-900">Add New Product</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="Enter product title"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Image URL *
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Affiliate URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Amazon Affiliate URL *
              </label>
              <input
                type="url"
                value={formData.affiliateUrl}
                onChange={(e) => handleInputChange('affiliateUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="https://www.amazon.in/..."
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="Enter product description (optional)"
              />
            </div>

            {/* Main Category */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Main Category *
              </label>
              <select
                value={formData.mainCategory}
                onChange={(e) => handleInputChange('mainCategory', e.target.value as 'fashion' | 'jewellery')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="fashion">Fashion</option>
                <option value="jewellery">Jewellery</option>
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Subcategory *
              </label>
              {formData.mainCategory === 'fashion' ? (
                <select
                  value={formData.fashionCategory}
                  onChange={(e) => handleInputChange('fashionCategory', e.target.value as FashionCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  {Object.entries(FASHION_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={formData.jewelleryCategory}
                  onChange={(e) => handleInputChange('jewelleryCategory', e.target.value as JewelleryCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  {Object.entries(JEWELLERY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="299.00"
              />
            </div>

            {/* MRP */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                M.R.P. (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.mrp}
                onChange={(e) => handleInputChange('mrp', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="499.00"
              />
            </div>

            {/* Discount Percentage */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Discount (%) *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={formData.discountPercentage}
                onChange={(e) => handleInputChange('discountPercentage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="40"
              />
            </div>

            {/* Featured */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-navy-700">
                Featured Product
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={addProduct.isPending}
              className="bg-gold-600 hover:bg-gold-700 text-white"
            >
              {addProduct.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Package className="h-6 w-6 text-gold-600" />
          <h2 className="text-2xl font-bold text-navy-900">All Products</h2>
          <span className="ml-2 text-sm text-navy-600">({products?.length || 0} products)</span>
        </div>

        {!products || products.length === 0 ? (
          <p className="text-center text-navy-600 py-8">No products found. Add your first product above!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy-700">Image</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy-700">Title</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy-700">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy-700">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy-700">Discount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy-700">Featured</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-navy-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id.toString()} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-navy-900">{product.title}</div>
                      {product.description && (
                        <div className="text-sm text-navy-600 truncate max-w-xs">
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-navy-700">
                      {getCategoryLabel(product.category)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-navy-900">
                        ₹{(Number(product.price) / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-navy-600 line-through">
                        ₹{(Number(product.mrp) / 100).toFixed(2)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {Number(product.discountPercentage)}% OFF
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {product.isFeatured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-800">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={product.affiliateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-navy-600 hover:text-navy-900 hover:bg-navy-50 rounded transition-colors"
                          title="View on Amazon"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleEditClick(product)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title="Edit product"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
              Update the product details below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => handleEditInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Enter product title"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={editFormData.imageUrl}
                  onChange={(e) => handleEditInputChange('imageUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Affiliate URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Amazon Affiliate URL *
                </label>
                <input
                  type="url"
                  value={editFormData.affiliateUrl}
                  onChange={(e) => handleEditInputChange('affiliateUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="https://www.amazon.in/..."
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => handleEditInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Enter product description (optional)"
                />
              </div>

              {/* Main Category */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Main Category *
                </label>
                <select
                  value={editFormData.mainCategory}
                  onChange={(e) => handleEditInputChange('mainCategory', e.target.value as 'fashion' | 'jewellery')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="fashion">Fashion</option>
                  <option value="jewellery">Jewellery</option>
                </select>
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Subcategory *
                </label>
                {editFormData.mainCategory === 'fashion' ? (
                  <select
                    value={editFormData.fashionCategory}
                    onChange={(e) => handleEditInputChange('fashionCategory', e.target.value as FashionCategory)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    {Object.entries(FASHION_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={editFormData.jewelleryCategory}
                    onChange={(e) => handleEditInputChange('jewelleryCategory', e.target.value as JewelleryCategory)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    {Object.entries(JEWELLERY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editFormData.price}
                  onChange={(e) => handleEditInputChange('price', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="299.00"
                />
              </div>

              {/* MRP */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  M.R.P. (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editFormData.mrp}
                  onChange={(e) => handleEditInputChange('mrp', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="499.00"
                />
              </div>

              {/* Discount Percentage */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Discount (%) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={editFormData.discountPercentage}
                  onChange={(e) => handleEditInputChange('discountPercentage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="40"
                />
              </div>

              {/* Featured */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsFeatured"
                  checked={editFormData.isFeatured}
                  onChange={(e) => handleEditInputChange('isFeatured', e.target.checked)}
                  className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                />
                <label htmlFor="editIsFeatured" className="text-sm font-medium text-navy-700">
                  Featured Product
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
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
                className="bg-gold-600 hover:bg-gold-700 text-white"
              >
                {updateProduct.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

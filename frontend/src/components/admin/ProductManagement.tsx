import React, { useState } from 'react';
import { useGetAllProducts, useAddProduct, useUpdateProduct, useDeleteProduct } from '../../hooks/useQueries';
import { useAuth } from '../../hooks/useAuth';
import { ProductCategory, FashionCategory, JewelleryCategory, ProductInput } from '../../backend';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Pencil, Trash2, Plus, ExternalLink } from 'lucide-react';

type CategoryKey =
  | 'fashion_sarees'
  | 'fashion_kurtaKurtis'
  | 'fashion_festive'
  | 'fashion_gowns'
  | 'fashion_salwarSuits'
  | 'fashion_lehengaCholis'
  | 'fashion_westernWear'
  | 'fashion_sportsWear'
  | 'jewellery_rings'
  | 'jewellery_necklaces';

const CATEGORY_OPTIONS: { value: CategoryKey; label: string }[] = [
  { value: 'fashion_sarees', label: 'Fashion - Sarees' },
  { value: 'fashion_kurtaKurtis', label: 'Fashion - Kurta/Kurtis' },
  { value: 'fashion_festive', label: 'Fashion - Festive' },
  { value: 'fashion_gowns', label: 'Fashion - Gowns' },
  { value: 'fashion_salwarSuits', label: 'Fashion - Salwar Suits' },
  { value: 'fashion_lehengaCholis', label: 'Fashion - Lehenga Cholis' },
  { value: 'fashion_westernWear', label: 'Fashion - Western Wear' },
  { value: 'fashion_sportsWear', label: 'Fashion - Sports Wear' },
  { value: 'jewellery_rings', label: 'Jewellery - Rings' },
  { value: 'jewellery_necklaces', label: 'Jewellery - Necklaces' },
];

function categoryKeyToProductCategory(key: CategoryKey): ProductCategory {
  const [type, sub] = key.split('_');
  if (type === 'fashion') {
    return { __kind__: 'fashion', fashion: sub as FashionCategory };
  }
  return { __kind__: 'jewellery', jewellery: sub as JewelleryCategory };
}

function productCategoryToCategoryKey(cat: ProductCategory): CategoryKey {
  if (cat.__kind__ === 'fashion') {
    return `fashion_${cat.fashion}` as CategoryKey;
  }
  return `jewellery_${cat.jewellery}` as CategoryKey;
}

interface ProductFormData {
  title: string;
  description: string;
  imageUrl: string;
  affiliateLink: string;
  categoryKey: CategoryKey;
  price: string;
  mrp: string;
  discountPercentage: string;
  isFeatured: boolean;
}

const DEFAULT_FORM: ProductFormData = {
  title: '',
  description: '',
  imageUrl: '',
  affiliateLink: '',
  categoryKey: 'fashion_sarees',
  price: '',
  mrp: '',
  discountPercentage: '0',
  isFeatured: false,
};

function formDataToProductInput(form: ProductFormData): ProductInput {
  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    imageUrl: form.imageUrl.trim(),
    affiliateLink: form.affiliateLink.trim(),
    category: categoryKeyToProductCategory(form.categoryKey),
    price: BigInt(Math.round(parseFloat(form.price) || 0)),
    mrp: BigInt(Math.round(parseFloat(form.mrp) || 0)),
    discountPercentage: BigInt(Math.round(parseFloat(form.discountPercentage) || 0)),
    isFeatured: form.isFeatured,
  };
}

function validateForm(form: ProductFormData): string[] {
  const errors: string[] = [];
  if (!form.title.trim()) errors.push('Title is required');
  if (!form.imageUrl.trim()) errors.push('Image URL is required');
  if (!form.affiliateLink.trim()) errors.push('Affiliate link is required');
  if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0) errors.push('Valid price is required');
  if (!form.mrp || isNaN(parseFloat(form.mrp)) || parseFloat(form.mrp) < 0) errors.push('Valid MRP is required');
  return errors;
}

export default function ProductManagement() {
  const { isSessionValid } = useAuth();
  const { data: products = [], isLoading } = useGetAllProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingProductId, setEditingProductId] = useState<bigint | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<bigint | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string>('');

  if (!isSessionValid()) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Session expired. Please log in again.</p>
      </div>
    );
  }

  const openAddDialog = () => {
    setFormData(DEFAULT_FORM);
    setFormErrors([]);
    setSubmitError('');
    setShowAddDialog(true);
  };

  const openEditDialog = (productId: bigint) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    setEditingProductId(productId);
    setFormData({
      title: product.title,
      description: product.description || '',
      imageUrl: product.imageUrl,
      affiliateLink: product.affiliateLink,
      categoryKey: productCategoryToCategoryKey(product.category),
      price: Number(product.price).toString(),
      mrp: Number(product.mrp).toString(),
      discountPercentage: Number(product.discountPercentage).toString(),
      isFeatured: product.isFeatured,
    });
    setFormErrors([]);
    setSubmitError('');
    setShowEditDialog(true);
  };

  const openDeleteDialog = (productId: bigint) => {
    setDeletingProductId(productId);
    setShowDeleteDialog(true);
  };

  const handleAddSubmit = async () => {
    const errors = validateForm(formData);
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors([]);
    setSubmitError('');
    try {
      const input = formDataToProductInput(formData);
      await addProduct.mutateAsync(input);
      setShowAddDialog(false);
      setFormData(DEFAULT_FORM);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to add product. Please try again.');
    }
  };

  const handleEditSubmit = async () => {
    if (editingProductId === null) return;
    const errors = validateForm(formData);
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors([]);
    setSubmitError('');
    try {
      const input = formDataToProductInput(formData);
      await updateProduct.mutateAsync({ id: editingProductId, input });
      setShowEditDialog(false);
      setEditingProductId(null);
      setFormData(DEFAULT_FORM);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to update product. Please try again.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingProductId === null) return;
    try {
      await deleteProduct.mutateAsync(deletingProductId);
      setShowDeleteDialog(false);
      setDeletingProductId(null);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to delete product.');
    }
  };

  const updateField = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isAddSubmitting = addProduct.isPending;
  const isEditSubmitting = updateProduct.isPending;
  const isDeleteSubmitting = deleteProduct.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Product Management</h2>
        <Button
          onClick={openAddDialog}
          className="bg-pink-hot hover:bg-pink-hot-dark text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No products found. Add your first product!
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-semibold text-foreground">Product</th>
                <th className="text-left p-3 font-semibold text-foreground">Category</th>
                <th className="text-left p-3 font-semibold text-foreground">Price</th>
                <th className="text-left p-3 font-semibold text-foreground">MRP</th>
                <th className="text-left p-3 font-semibold text-foreground">Discount</th>
                <th className="text-left p-3 font-semibold text-foreground">Featured</th>
                <th className="text-left p-3 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={String(product.id)} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-10 h-10 object-cover rounded"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      <div>
                        <p className="font-medium text-foreground line-clamp-1 max-w-[200px]">{product.title}</p>
                        {product.affiliateLink && (
                          <a
                            href={product.affiliateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-pink-hot hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Amazon
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary" className="text-xs">
                      {product.category.__kind__ === 'fashion'
                        ? `Fashion - ${product.category.fashion}`
                        : `Jewellery - ${product.category.jewellery}`}
                    </Badge>
                  </td>
                  <td className="p-3 text-foreground">₹{Number(product.price).toLocaleString()}</td>
                  <td className="p-3 text-muted-foreground">₹{Number(product.mrp).toLocaleString()}</td>
                  <td className="p-3">
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {Number(product.discountPercentage)}% off
                    </Badge>
                  </td>
                  <td className="p-3">
                    {product.isFeatured ? (
                      <Badge className="bg-pink-hot text-white text-xs">Featured</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">No</Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(product.id)}
                        className="border-pink-hot text-pink-hot hover:bg-pink-hot hover:text-white"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteDialog(product.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={open => { if (!open) setShowAddDialog(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Fill in the product details below.</DialogDescription>
          </DialogHeader>
          <ProductFormFields formData={formData} updateField={updateField} />
          {formErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-3 space-y-1">
              {formErrors.map((e, i) => (
                <p key={i} className="text-red-600 text-sm">{e}</p>
              ))}
            </div>
          )}
          {submitError && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">{submitError}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isAddSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSubmit}
              disabled={isAddSubmitting}
              className="bg-pink-hot hover:bg-pink-hot-dark text-white"
            >
              {isAddSubmitting ? 'Adding...' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={open => { if (!open) { setShowEditDialog(false); setEditingProductId(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details below.</DialogDescription>
          </DialogHeader>
          <ProductFormFields formData={formData} updateField={updateField} />
          {formErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-3 space-y-1">
              {formErrors.map((e, i) => (
                <p key={i} className="text-red-600 text-sm">{e}</p>
              ))}
            </div>
          )}
          {submitError && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">{submitError}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditingProductId(null); }} disabled={isEditSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={isEditSubmitting}
              className="bg-pink-hot hover:bg-pink-hot-dark text-white"
            >
              {isEditSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={open => { if (!open) setShowDeleteDialog(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {submitError && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">{submitError}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleteSubmitting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleteSubmitting}
            >
              {isDeleteSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Extracted as a stable named component (not defined inside render) to prevent remounting
interface ProductFormFieldsProps {
  formData: ProductFormData;
  updateField: (field: keyof ProductFormData, value: string | boolean) => void;
}

function ProductFormFields({ formData, updateField }: ProductFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={e => updateField('title', e.target.value)}
          placeholder="Product title"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={e => updateField('description', e.target.value)}
          placeholder="Optional description"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="imageUrl">Image URL *</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={e => updateField('imageUrl', e.target.value)}
          placeholder="https://..."
          className="mt-1"
        />
        {formData.imageUrl && (
          <img
            src={formData.imageUrl}
            alt="Preview"
            className="mt-2 w-20 h-20 object-cover rounded border"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
      </div>

      <div>
        <Label htmlFor="affiliateLink">Amazon Affiliate Link *</Label>
        <Input
          id="affiliateLink"
          value={formData.affiliateLink}
          onChange={e => updateField('affiliateLink', e.target.value)}
          placeholder="https://amazon.in/..."
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Select
          value={formData.categoryKey}
          onValueChange={val => updateField('categoryKey', val)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="price">Price (₹) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            value={formData.price}
            onChange={e => updateField('price', e.target.value)}
            placeholder="0"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="mrp">MRP (₹) *</Label>
          <Input
            id="mrp"
            type="number"
            min="0"
            value={formData.mrp}
            onChange={e => updateField('mrp', e.target.value)}
            placeholder="0"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="discountPercentage">Discount %</Label>
          <Input
            id="discountPercentage"
            type="number"
            min="0"
            max="100"
            value={formData.discountPercentage}
            onChange={e => updateField('discountPercentage', e.target.value)}
            placeholder="0"
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="isFeatured"
          type="checkbox"
          checked={formData.isFeatured}
          onChange={e => updateField('isFeatured', e.target.checked)}
          className="w-4 h-4 accent-pink-500"
        />
        <Label htmlFor="isFeatured" className="cursor-pointer">Mark as Featured Product</Label>
      </div>
    </div>
  );
}

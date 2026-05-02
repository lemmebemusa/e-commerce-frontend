import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../lib/api';
import { formatPrice } from '../lib/utils';
import { Plus, Pencil, Trash2, X, Search, Package, Upload, Image as ImageIcon, SlidersHorizontal } from 'lucide-react';
import BottomSheet from '../components/BottomSheet';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminProducts() {
  const { adminPassword } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDiscounted, setShowDiscounted] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [form, setForm] = useState({
    name: '', brand: '', genericName: '', categoryId: '',
    price: '', discountPrice: '', availability: 'available', description: '', imageFile: null
  });

  useEffect(() => {
    fetchData();
  }, [adminPassword]);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.admin.products.list(adminPassword),
        api.admin.categories.list(adminPassword)
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setForm({
        name: product.name,
        brand: product.brand || '',
        genericName: product.generic_name || '',
        categoryId: product.category_id || '',
        price: product.price,
        discountPrice: product.discount_price || '',
        availability: product.availability,
        description: product.description || '',
        imageFile: null
      });
      setImagePreview(product.image || null);
    } else {
      setEditingProduct(null);
      setForm({ name: '', brand: '', genericName: '', categoryId: '', price: '', discountPrice: '', availability: 'available', description: '', imageFile: null });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, imageFile: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('brand', form.brand);
      data.append('genericName', form.genericName);
      data.append('categoryId', form.categoryId);
      data.append('price', parseFloat(form.price));
      if (form.discountPrice) data.append('discountPrice', parseFloat(form.discountPrice));
      data.append('availability', form.availability);
      data.append('description', form.description);
      if (form.imageFile) data.append('image', form.imageFile);

      if (editingProduct) {
        await api.admin.products.update(editingProduct.id, data, adminPassword);
      } else {
        await api.admin.products.create(data, adminPassword);
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.admin.products.delete(id, adminPassword);
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
      await api.admin.products.toggleAvailability(id, newStatus, adminPassword);
      fetchData();
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Failed to toggle availability: ' + error.message);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setShowDiscounted(false);
    setSortBy('');
  };

  const applyFilters = () => {
    setShowFilters(false);
  };

  const hasActiveFilters = selectedCategory || showDiscounted || sortBy;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || p.category_name === selectedCategory;
    const matchesDiscount = !showDiscounted || (p.discount_price && p.discount_price < p.price);
    return matchesSearch && matchesCategory && matchesDiscount;
  }).sort((a, b) => {
    if (sortBy === 'az') return a.name.localeCompare(b.name);
    if (sortBy === 'price_asc') return (a.discount_price || a.price) - (b.discount_price || b.price);
    if (sortBy === 'price_desc') return (b.discount_price || b.price) - (a.discount_price || a.price);
    return 0;
  });

  if (loading) {
    return <LoadingSpinner className="min-h-[50vh]" />;
  }

  return (
    <div className="pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-medium">Products</h1>
        <div className="relative w-full sm:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
          />
          <button
            onClick={() => setShowFilters(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {hasActiveFilters && <span className="w-2 h-2 bg-black rounded-full absolute -top-0.5 -right-0.5" />}
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Product</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Category</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Price</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img src={product.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          {product.brand && <p className="text-xs text-gray-500">{product.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{product.category_name || '-'}</td>
                    <td className="p-4">
                      {product.discount_price ? (
                        <div>
                          <span className="text-sm font-medium">{formatPrice(product.discount_price)}</span>
                          <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(product.price)}</span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium">{formatPrice(product.price)}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleAvailability(product.id, product.availability)}
                        className={`text-xs px-2 py-1 rounded-full cursor-pointer ${product.availability === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {product.availability === 'available' ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(product)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button
        onClick={() => openModal()}
        className="fixed right-4 bottom-6 w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      <BottomSheet
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gray-300 transition-colors"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg mx-auto" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload image</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview && (
              <button
                type="button"
                onClick={() => { setForm({ ...form, imageFile: null }); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="mt-2 text-xs text-gray-500 hover:text-black"
              >
                Remove image
              </button>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Generic Name</label>
              <input
                type="text"
                value={form.genericName}
                onChange={(e) => setForm({ ...form, genericName: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price *</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Price</label>
              <input
                type="number"
                step="0.01"
                value={form.discountPrice}
                onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Availability</label>
            <select
              value={form.availability}
              onChange={(e) => setForm({ ...form, availability: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </BottomSheet>

      <BottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filters"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            >
              <option value="">Default</option>
              <option value="az">A - Z</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-3 cursor-pointer py-2">
              <input
                type="checkbox"
                checked={showDiscounted}
                onChange={(e) => setShowDiscounted(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 bg-white"
              />
              <span className="text-sm">Discounted Only</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex-1 py-3 border border-gray-200 text-sm rounded-xl hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={applyFilters}
            className="flex-1 py-3 bg-black text-white text-sm rounded-xl hover:bg-gray-800 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../lib/api';
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, Upload } from 'lucide-react';
import BottomSheet from '../components/BottomSheet';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminBanners() {
  const { adminPassword } = useOutletContext();
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    image: null,
    link: '',
    title: '',
    subtitle: '',
    display_order: 0,
    is_active: true,
    product_id: '',
  });

  useEffect(() => {
    fetchBanners();
  }, [adminPassword]);

  const fetchBanners = async () => {
    try {
      const data = await api.admin.banners.list(adminPassword);
      setBanners(data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await api.admin.products.list(adminPassword);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const openModal = (banner = null) => {
    fetchProducts();
    if (banner) {
      setEditingBanner(banner);
      setForm({
        image: banner.image || null,
        link: banner.link || '',
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        display_order: banner.display_order || 0,
        is_active: banner.is_active !== false,
        product_id: banner.product_id || '',
      });
      setImagePreview(banner.image || null);
    } else {
      setEditingBanner(null);
      setForm({
        image: null,
        link: '',
        title: '',
        subtitle: '',
        display_order: banners.length + 1,
        is_active: true,
        product_id: '',
      });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      if (form.image) data.append('image', form.image);
      data.append('link', form.link);
      data.append('title', form.title);
      data.append('subtitle', form.subtitle);
      data.append('display_order', form.display_order);
      data.append('is_active', form.is_active);
      if (form.product_id) data.append('product_id', form.product_id);

      if (editingBanner) {
        await api.admin.banners.update(editingBanner.id, data, adminPassword);
      } else {
        await api.admin.banners.create(data, adminPassword);
      }
      fetchBanners();
      closeModal();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Failed to save banner: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await api.admin.banners.delete(id, adminPassword);
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };

  const filteredBanners = banners.filter(b =>
    (b.title && b.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.subtitle && b.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <LoadingSpinner className="min-h-[50vh]" />;
  }

  return (
    <div className="pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-medium">Banners</h1>
        <div className="relative w-full sm:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search banners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
          />
        </div>
      </div>

      {filteredBanners.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">No banners found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="aspect-[3/1] bg-gray-100 relative">
                {banner.image ? (
                  <img src={banner.image} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                {!banner.is_active && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-white px-3 py-1 rounded-full text-xs font-medium">Inactive</span>
                  </div>
                )}
                {banner.product_name && (
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {banner.product_name}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium truncate">{banner.title || 'Untitled'}</h3>
                {banner.subtitle && <p className="text-sm text-gray-500 truncate mt-1">{banner.subtitle}</p>}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-400">Order: {banner.display_order}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(banner)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
        title={editingBanner ? 'Edit Banner' : 'Add Banner'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gray-300 transition-colors"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg mx-auto" />
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
                onClick={() => { setForm({ ...form, image: null }); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="mt-2 text-xs text-gray-500 hover:text-black"
              >
                Remove image
              </button>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              placeholder="e.g., Flat 20% Off"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              placeholder="e.g., Use code HEALTH20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Link (fallback if no product)</label>
            <input
              type="text"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              placeholder="e.g., / or /products?discounted=true"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Product (opens bottom sheet on click)</label>
            <select
              value={form.product_id}
              onChange={(e) => setForm({ ...form, product_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            >
              <option value="">No product (use link above)</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Display Order</label>
              <input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={form.is_active ? 'active' : 'inactive'}
                onChange={(e) => setForm({ ...form, is_active: e.target.value === 'active' })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              {editingBanner ? 'Update Banner' : 'Add Banner'}
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}
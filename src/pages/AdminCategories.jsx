import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../lib/api';
import { Plus, Pencil, Trash2, Grid, Search } from 'lucide-react';
import BottomSheet from '../components/BottomSheet';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminCategories() {
  const { adminPassword } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [adminPassword]);

  const fetchCategories = async () => {
    try {
      const data = await api.admin.categories.list(adminPassword);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
    } else {
      setEditingCategory(null);
      setName('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.admin.categories.update(editingCategory.id, { name }, adminPassword);
      } else {
        await api.admin.categories.create({ name }, adminPassword);
      }
      fetchCategories();
      closeModal();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.admin.categories.delete(id, adminPassword);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner className="min-h-[50vh]" />;
  }

  return (
    <div className="pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-medium">Categories</h1>
        <div className="relative w-full sm:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
          />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Grid className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'No categories match your search' : 'No categories yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{category.name}</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => openModal(category)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              placeholder="e.g., Medicine"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            {editingCategory ? 'Update Category' : 'Add Category'}
          </button>
        </form>
      </BottomSheet>
    </div>
  );
}
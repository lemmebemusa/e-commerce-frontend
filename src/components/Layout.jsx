import { Outlet, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Pill, Search, SlidersHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';
import CartModal from './CartModal';
import { api } from '../lib/api';
import PillNav from './PillNav';
import BottomSheet from './BottomSheet';

export default function Layout() {
  const { setIsCartOpen, getCartCount } = useCart();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDiscounted, setShowDiscounted] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [company, setCompany] = useState(null);

  const fetchCompany = async () => {
    try {
      const data = await api.company.get();
      if (data && Object.keys(data).length > 0) {
        setCompany(data);
      }
    } catch (error) {
      console.error('Error fetching company info:', error);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  useEffect(() => {
    if (!company) return;
    if (company.name) {
      document.title = company.name;
    }
    if (company.favicon) {
      let favicon = document.querySelector("link[rel='icon']");
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/svg+xml';
        document.head.appendChild(favicon);
      }
      favicon.href = company.favicon;
    }
  }, [company]);
  

  const search = searchParams.get('q') || '';

  const fetchCategories = async () => {
    try {
      const data = await api.categories.list();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearchChange = (value) => {
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (selectedCategory) params.set('category', selectedCategory);
    if (showDiscounted) params.set('discounted', 'true');
    if (sortBy) params.set('sort', sortBy);
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setShowDiscounted(false);
    setSortBy('');
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    setSearchParams(params);
  };

  const hasActiveFilters = selectedCategory || showDiscounted || sortBy;

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4 md:py-4 md:h-20">
            <div className="flex items-center justify-between">
<Link to="/" className="flex items-center gap-2">
              {company?.logo_url && (
                <img src={company.logo_url} alt={company.name} className="w-8 h-8 object-contain" />
              )}
              {company && <span className="text-lg font-medium tracking-tight">{company.name}</span>}
            </Link>

              <div className="md:hidden">
                <PillNav />
              </div>
            </div>

            <div className="relative w-full sm:max-w-xl sm:mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-black rounded-full absolute -top-0.5 -right-0.5" />
                )}
              </button>
            </div>

            <div className="hidden md:block">
              <PillNav />
            </div>
          </div>
      </nav>
    </header>

      <main>
        <Outlet />
      </main>

<footer className="border-t border-gray-100 mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
      <p className="text-xs text-gray-400">
        By{' '}
        <a
          href="https://musaaddwan.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-black transition-colors"
        >
          Musa Adwan
        </a>
      </p>
    </div>
  </footer>

<CartModal />

      <BottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filters"
        animate={true}
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
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';
import { formatPrice } from '../lib/utils';
import { ShoppingBag, Package, Plus, Minus, X } from 'lucide-react';
import BottomSheet from '../components/BottomSheet';
import BannerSlider from '../components/BannerSlider';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function Home() {
  const { getCartCount, setIsCartOpen, addToCart } = useCart();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({ nextCursor: null, hasMore: false });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const observerRef = useRef(null);

  const search = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const showDiscounted = searchParams.get('discounted') === 'true';
  const sortBy = searchParams.get('sort') || '';

  const fetchProducts = useCallback(async (cursor = null, reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = {
        limit: 8,
        search: search || undefined,
        category: selectedCategory || undefined,
        discounted: showDiscounted || undefined,
        sort: sortBy || undefined,
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const data = await api.products.list(params);

      if (reset || !cursor) {
        setProducts(data.products);
      } else {
        setProducts(prev => [...prev, ...data.products]);
      }
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, selectedCategory, showDiscounted, sortBy]);

  useEffect(() => {
    fetchProducts(null, true);
  }, [fetchProducts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasMore && !loadingMore) {
          fetchProducts(pagination.nextCursor);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [pagination.hasMore, pagination.nextCursor, loadingMore, fetchProducts]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setIsDrawerOpen(true);
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, quantity);
      addToast(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart`, 'success');
      setQuantity(1);
    }
  };

  const incrementQuantity = () => setQuantity(q => q + 1);
  const decrementQuantity = () => setQuantity(q => Math.max(1, q - 1));

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    setSearchParams(params);
  };

  const hasActiveFilters = selectedCategory || showDiscounted || sortBy;

  const footerContent = selectedProduct?.availability === 'available' ? (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 bg-gray-100 rounded-2xl px-1 py-1">
        <button
          onClick={decrementQuantity}
          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full hover:bg-white transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-medium text-sm sm:text-base">{quantity}</span>
        <button
          onClick={incrementQuantity}
          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full hover:bg-white transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <button
        onClick={handleAddToCart}
        className="flex-1 py-3 sm:py-4 bg-black text-white rounded-2xl font-medium hover:bg-gray-800 transition-colors text-sm sm:text-base px-4"
      >
        Add to Cart
      </button>
    </div>
  ) : null;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-medium tracking-tight">Pharmacy at Your Fingertips</h1>
          <p className="text-gray-500 mt-2">Browse our complete catalog of medicines and healthcare products. Avoid long queues and get all your medicines and health essentials delivered safely to you.</p>
        </div>

        <BannerSlider onBannerClick={handleProductClick} />

{loading ? (
        <LoadingSpinner className="py-16" />
      ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-black underline"
              >
                Clear all filters
              </button>
            )}
          </div>
) : (
<>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map(product => (
            <button
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="text-left group bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-200 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={product.availability === 'unavailable'}
            >
<div className="relative aspect-square overflow-hidden bg-gray-50">
                {product.image ? (
                  <>
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 right-2">
                      {product.discount_price ? (
                        <div className="flex items-baseline gap-2 justify-end">
                          <span className="font-bold text-base text-white drop-shadow-md">{formatPrice(product.discount_price)}</span>
                          <span className="text-xs text-white/70 line-through">{formatPrice(product.price)}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-base text-white drop-shadow-md">{formatPrice(product.price)}</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-gray-300" />
                  </div>
                )}

                {product.availability === 'unavailable' && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <span className="bg-white px-3 py-1 rounded-full text-xs font-medium shadow-sm text-gray-600">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-bold text-base text-gray-900 truncate">{product.name}</h3>
                {product.brand && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">{product.brand}</p>
                )}
              </div>
            </button>
          ))}
        </div>

{loadingMore && (
        <LoadingSpinner size="small" className="py-8" />
      )}

            <div ref={observerRef} className="h-10" />
          </>
        )}
      </div>

      {selectedProduct && (
        <BottomSheet
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          animate={true}
          showHeader={true}
          headerContent={
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          }
          footerContent={footerContent}
        >
          <div className="flex gap-6">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
              {selectedProduct.image ? (
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="w-12 h-12 text-gray-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-medium">{selectedProduct.name}</h2>
              {selectedProduct.brand && (
                <p className="text-sm text-gray-500 mt-1">{selectedProduct.brand}</p>
              )}
              {selectedProduct.generic_name && (
                <p className="text-xs text-gray-400 mt-0.5">{selectedProduct.generic_name}</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                {selectedProduct.discount_price ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-medium">{formatPrice(selectedProduct.discount_price)}</span>
                    <span className="text-sm text-gray-400 line-through">{formatPrice(selectedProduct.price)}</span>
                    <span className="text-xs text-green-600 font-medium">
                      {Math.round((1 - selectedProduct.discount_price / selectedProduct.price) * 100)}% OFF
                    </span>
                  </div>
                ) : (
                  <span className="text-xl font-medium">{formatPrice(selectedProduct.price)}</span>
                )}
              </div>
              <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedProduct.availability === 'available'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {selectedProduct.availability === 'available' ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>

          {selectedProduct.description && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedProduct.description}</p>
            </div>
          )}

          {selectedProduct.category_name && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Category</h3>
              <p className="text-sm text-gray-600">{selectedProduct.category_name}</p>
            </div>
          )}

          {selectedProduct.availability === 'unavailable' && (
            <div className="mt-6">
              <button
                disabled
                className="w-full py-4 bg-gray-300 text-gray-500 rounded-2xl font-medium cursor-not-allowed"
              >
                Out of Stock
              </button>
            </div>
          )}
        </BottomSheet>
      )}

      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors z-40"
      >
        <ShoppingBag className="w-6 h-6" />
        {getCartCount() > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-black text-xs font-medium rounded-full flex items-center justify-center">
            {getCartCount()}
          </span>
        )}
      </button>
    </div>
  );
}
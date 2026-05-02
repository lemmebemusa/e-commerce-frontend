import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function CartModal() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-50 animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 animate-slide-right shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Cart ({cart.length})
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
            <p className="text-gray-500 text-center">Your cart is empty</p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="mt-4 px-6 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.name}</h3>
                    {item.brand && (
                      <p className="text-xs text-gray-500 truncate">{item.brand}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        {item.discountPrice ? (
                          <div>
                            <span className="text-sm font-medium">{formatPrice(item.discountPrice * item.quantity)}</span>
                            <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-100 space-y-4">
              <div className="flex justify-between text-lg font-medium">
                <span>Total</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={clearCart}
                  className="flex-1 py-3 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Cart
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 py-3 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
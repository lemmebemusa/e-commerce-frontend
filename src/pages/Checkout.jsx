import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { validateBDPhone, formatPrice } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, CheckCircle } from 'lucide-react';

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products to checkout</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-black text-white text-sm rounded-xl hover:bg-gray-800 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-medium mb-2">Order Placed!</h2>
          <p className="text-gray-500 mb-2">Thank you for your order</p>
          {orderId && (
            <p className="text-sm text-gray-400 mb-6">Order ID: {orderId.slice(0, 8)}...</p>
          )}
          <button
            onClick={() => {
              setIsSuccess(false);
              setForm({ name: '', phone: '', address: '' });
            }}
            className="px-6 py-3 bg-black text-white text-sm rounded-xl hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validateBDPhone(form.phone)) {
      newErrors.phone = 'Invalid phone number. Use BD format: 01XXXXXXXXX';
    }

    if (!form.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const orderData = {
        customerName: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          brand: item.brand,
          genericName: item.generic_name,
          price: item.price,
          discountPrice: item.discountPrice,
          quantity: item.quantity,
        })),
      };

      const result = await api.orders.create(orderData);
      setOrderId(result.id);
      clearCart();
      setIsSuccess(true);
      addToast('Order placed successfully!', 'success');
    } catch (error) {
      addToast(error.message || 'Failed to place order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to shopping
      </button>

      <h1 className="text-3xl font-medium tracking-tight mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-lg font-medium mb-6">Delivery Information</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all ${errors.name ? 'border-red-400' : 'border-gray-200 focus:border-gray-300'}`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="01XXXXXXXXX"
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all ${errors.phone ? 'border-red-400' : 'border-gray-200 focus:border-gray-300'}`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Delivery Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Enter your complete delivery address"
                rows={4}
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none ${errors.address ? 'border-red-400' : 'border-gray-200 focus:border-gray-300'}`}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-medium mb-3">Payment Method</h3>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                Cash on Delivery (COD)
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Placing Order...' : `Place Order - ${formatPrice(getCartTotal())}`}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-6">Order Summary</h2>
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium mt-1">
                      {formatPrice((item.discountPrice || item.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-6 pt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2">
                <span>Total</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
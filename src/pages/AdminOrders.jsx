import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../lib/api';
import { formatPrice } from '../lib/utils';
import { Search, X, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import BottomSheet from '../components/BottomSheet';

export default function AdminOrders() {
  const { adminPassword } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [adminPassword]);

  const fetchOrders = async (phone = '') => {
    try {
      const data = await api.admin.orders.list(adminPassword, phone || undefined);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchOrders(searchTerm);
  };

  const handleStatusUpdate = async (orderId, data) => {
    try {
      await api.admin.orders.updateStatus(orderId, data, adminPassword);
      fetchOrders(searchTerm);
      if (selectedOrder) {
        const updated = orders.find(o => o.id === orderId);
        if (updated) setSelectedOrder({ ...updated, ...data });
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.admin.orders.delete(orderId, adminPassword);
      fetchOrders(searchTerm);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner className="min-h-[50vh]" />;
  }

  const filteredOrders = orders.filter(order =>
    order.phone.includes(searchTerm) ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-medium">Orders</h1>
        <div className="relative w-full sm:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Order ID</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Phone</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Items</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Payment</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="p-4 text-xs font-mono text-gray-500">{order.id.slice(0, 8)}...</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-sm">{order.customer_name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-32">{order.address}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{order.phone}</td>
                    <td className="p-4 text-sm">
                      {order.items?.length || 0} item(s)
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                        order.payment_status === 'refunded' ? 'bg-purple-100 text-purple-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.order_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        order.order_status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-sm text-black underline hover:text-gray-600"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BottomSheet
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Order
              </button>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Info</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium">{selectedOrder.customer_name}</p>
                <p className="text-sm text-gray-500">{selectedOrder.phone}</p>
                <p className="text-sm text-gray-500 mt-2">{selectedOrder.address}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-sm">{item.productName}</p>
                        {item.productBrand && <p className="text-xs text-gray-500">{item.productBrand}</p>}
                        <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-sm">
                        {formatPrice((item.productDiscountPrice || item.productPrice) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Status Updates</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Payment Status</label>
                  <select
                    value={selectedOrder.payment_status}
                    onChange={(e) => handleStatusUpdate(selectedOrder.id, { paymentStatus: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Order Status</label>
                  <select
                    value={selectedOrder.order_status}
                    onChange={(e) => handleStatusUpdate(selectedOrder.id, { orderStatus: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-400">
              Order ID: {selectedOrder.id}<br />
              Created: {new Date(selectedOrder.created_at).toLocaleString()}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
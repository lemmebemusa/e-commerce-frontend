import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../lib/api';
import { formatPrice } from '../lib/utils';
import { Package, ShoppingCart, DollarSign, Clock, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminDashboard() {
  const { adminPassword } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await api.admin.dashboard(adminPassword);
        setData(result);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [adminPassword]);

  if (loading) {
    return <LoadingSpinner className="min-h-[50vh]" />;
  }

  const stats = [
    { label: 'Total Orders', value: data?.totalOrders || 0, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Revenue', value: formatPrice(data?.totalRevenue || 0), icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'Pending Orders', value: data?.pendingOrders || 0, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Total Products', value: data?.totalProducts || 0, icon: Package, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-medium mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-medium">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-medium mb-4">Recent Orders</h2>
        {data?.recentOrders?.length > 0 ? (
          <div className="space-y-4">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-sm">{order.customer_name}</p>
                  <p className="text-xs text-gray-500">{order.phone}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.order_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    order.order_status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.order_status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">No orders yet</p>
        )}
      </div>
    </div>
  );
}
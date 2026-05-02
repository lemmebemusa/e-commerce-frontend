import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Grid, Users, LogOut, Menu, X, Pill, Lock, Eye, EyeOff, Image, Building2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin_auth');
    if (savedAuth) {
      setIsAuthenticated(true);
      setAdminPassword(savedAuth);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await api.admin.verify(loginPassword);
      sessionStorage.setItem('admin_auth', loginPassword);
      setAdminPassword(loginPassword);
      setIsAuthenticated(true);
      setLoginPassword('');
    } catch (err) {
      setLoginError('Invalid password');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    setAdminPassword('');
    setLoginPassword('');
    navigate('/admin');
  };

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/categories', label: 'Categories', icon: Grid },
  { href: '/admin/employees', label: 'Employees', icon: Users },
  { href: '/admin/banners', label: 'Banners', icon: Image },
  { href: '/admin/company', label: 'Company', icon: Building2 },
];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Pill className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-medium">Admin Login</h1>
            <p className="text-gray-500 text-sm mt-2">Enter your admin password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="relative mb-4">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>

            {loginError && (
              <p className="text-red-500 text-sm mb-4">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || !loginPassword}
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? 'Verifying...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link to="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <Pill className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-medium hidden sm:block">Admin Panel</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-sm text-gray-500 hover:text-black transition-colors"
              >
                View Store
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <Outlet context={{ adminPassword }} />
      </main>

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-72 bg-white border-r border-gray-200 shadow-2xl transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <span className="font-medium text-lg">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-gray-100 text-black font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-black"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>
    </div>
  );
}
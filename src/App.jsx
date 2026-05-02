import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminCategories from './pages/AdminCategories';
import AdminEmployees from './pages/AdminEmployees';
import AdminBanners from './pages/AdminBanners';
import AdminCompany from './pages/AdminCompany';
import AdminLayout from './components/AdminLayout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="about" element={<About />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="categories" element={<AdminCategories />} />
<Route path="employees" element={<AdminEmployees />} />
      <Route path="banners" element={<AdminBanners />} />
      <Route path="company" element={<AdminCompany />} />
      </Route>
    </Routes>
  );
}

export default App;
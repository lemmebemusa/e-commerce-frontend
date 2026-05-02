const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

async function fetchAPI(endpoint, options = {}) {
  const { headers, ...rest } = options;
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  products: {
    list: (params = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value);
        }
      });
      return fetchAPI(`/products?${searchParams.toString()}`);
    },
    get: (id) => fetchAPI(`/products/${id}`),
  },

  categories: {
    list: () => fetchAPI('/categories'),
  },

  orders: {
    create: (data) => fetchAPI('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    byPhone: (phone) => fetchAPI(`/orders/phone/${phone}`),
  },

  employees: {
    list: () => fetchAPI('/employees'),
  },

  banners: {
    list: () => fetchAPI('/banners'),
  },

  company: {
    get: () => fetchAPI('/company'),
  },

  admin: {
    verify: (password) => fetchAPI('/admin/verify', {
      headers: { password },
    }),
    dashboard: (password) => fetchAPI('/admin/dashboard', {
      headers: { password },
    }),
    products: {
      list: (password) => fetchAPI('/admin/products', {
        headers: { password },
      }),
      create: (data, password) => {
        return fetch(`${API_BASE}/admin/products`, {
          method: 'POST',
          headers: { password },
          body: data,
        }).then(r => r.json());
      },
      update: (id, data, password) => {
        return fetch(`${API_BASE}/admin/products/${id}`, {
          method: 'PUT',
          headers: { password },
          body: data,
        }).then(r => r.json());
      },
      delete: (id, password) => fetchAPI(`/admin/products/${id}`, {
        method: 'DELETE',
        headers: { password },
      }),
      toggleAvailability: (id, availability, password) => {
        return fetchAPI(`/admin/products/${id}/availability`, {
          method: 'PATCH',
          headers: { password },
          body: JSON.stringify({ availability }),
        });
      },
    },
    categories: {
      list: (password) => fetchAPI('/admin/categories', {
        headers: { password },
      }),
      create: (data, password) => fetchAPI('/admin/categories', {
        method: 'POST',
        headers: { password },
        body: JSON.stringify(data),
      }),
      update: (id, data, password) => fetchAPI(`/admin/categories/${id}`, {
        method: 'PUT',
        headers: { password },
        body: JSON.stringify(data),
      }),
      delete: (id, password) => fetchAPI(`/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { password },
      }),
    },
    orders: {
      list: (password, phone) => {
        const params = phone ? `?phone=${phone}` : '';
        return fetchAPI(`/admin/orders${params}`, {
          headers: { password },
        });
      },
      updateStatus: (id, data, password) => fetchAPI(`/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { password },
        body: JSON.stringify(data),
      }),
      delete: (id, password) => fetchAPI(`/admin/orders/${id}`, {
        method: 'DELETE',
        headers: { password },
      }),
    },
    employees: {
      list: (password) => fetchAPI('/admin/employees', {
        headers: { password },
      }),
      create: (formData, password) => {
        return fetch(`${API_BASE}/admin/employees`, {
          method: 'POST',
          headers: { password },
          body: formData,
        }).then(r => r.json());
      },
      update: (id, formData, password) => {
        return fetch(`${API_BASE}/admin/employees/${id}`, {
          method: 'PUT',
          headers: { password },
          body: formData,
        }).then(r => r.json());
      },
      delete: (id, password) => fetchAPI(`/admin/employees/${id}`, {
        method: 'DELETE',
        headers: { password },
      }),
    },
    banners: {
      list: (password) => fetchAPI('/admin/banners', {
        headers: { password },
      }),
      create: (formData, password) => {
        return fetch(`${API_BASE}/admin/banners`, {
          method: 'POST',
          headers: { password },
          body: formData,
        }).then(r => r.json());
      },
      update: (id, formData, password) => {
        return fetch(`${API_BASE}/admin/banners/${id}`, {
          method: 'PUT',
          headers: { password },
          body: formData,
        }).then(r => r.json());
      },
      delete: (id, password) => fetchAPI(`/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { password },
      }),
    },
company: {
        get: (password) => fetchAPI('/admin/company', {
          headers: { password },
        }),
        update: (formData, password) => {
          return fetch(`${API_BASE}/admin/company`, {
            method: 'PUT',
            headers: { password },
            body: formData,
          }).then(r => r.json());
        },
      },
  },
};
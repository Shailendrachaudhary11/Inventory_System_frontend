import axios from 'axios';

const API = axios.create({
  baseURL: 'https://inventory-management-1-lb0n.onrender.com/api/',
});

// Request interceptor to add authorization token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const registerUser = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const getProfile = async () => {
  const response = await API.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await API.put('/auth/profile', profileData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await API.put('/auth/change-password', passwordData);
  return response.data;
};

// Category APIs
export const getCategories = async () => {
  const response = await API.get('/categories');
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await API.post('/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await API.put(`/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await API.delete(`/categories/${id}`);
  return response.data;
};

// Product APIs
export const getProducts = async (params) => {
  const response = await API.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await API.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await API.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await API.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await API.delete(`/products/${id}`);
  return response.data;
};

export const getLowStockProducts = async () => {
  const response = await API.get('/products/low-stock');
  return response.data;
};

// Inventory APIs
export const stockIn = async (data) => {
  const response = await API.post('/inventory/stock-in', data);
  return response.data;
};

export const stockOut = async (data) => {
  const response = await API.post('/inventory/stock-out', data);
  return response.data;
};

export const getInventoryLogs = async () => {
  const response = await API.get('/inventory/logs');
  return response.data;
};

export default API;

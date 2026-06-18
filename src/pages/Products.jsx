import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getCategories,
  stockIn,
  stockOut
} from '../api';
import { motion } from 'framer-motion';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdSearch, 
  MdClose, 
  MdTrendingUp, 
  MdTrendingDown,
  MdInfoOutline
} from 'react-icons/md';

const Products = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Products Table States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(0); // MUI uses 0-based page index
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add/Edit Product Modal State
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productDialogType, setProductDialogType] = useState('add'); // 'add' or 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    quantity: '',
    category: '',
  });
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [productError, setProductError] = useState('');

  // Stock Adjust Modal State
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [stockType, setStockType] = useState('IN'); // 'IN' or 'OUT'
  const [stockQty, setStockQty] = useState('');
  const [stockSubmitting, setStockSubmitting] = useState(false);
  const [stockError, setStockError] = useState('');

  // Delete Confirm Dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Fetch Categories once for dropdown
  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      if (res.success && res.data) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Fetch Products with API parameters
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      // API page is 1-based, MUI Pagination is 0-based
      const res = await getProducts({
        page: page + 1,
        limit,
        search
      });
      if (res.success && res.data) {
        setProducts(res.data.products || []);
        setTotalProducts(res.data.pagination?.totalProducts || 0);
      } else {
        setError(res.message || 'Failed to load products');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, limit]);

  // Handle Search Input (with manual click/enter or simple debouncing)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0); // reset page
    fetchProducts();
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(0);
    // Directly fetch with cleared search (needs state update, so we run next tick or inline)
    setTimeout(() => {
      fetchProducts();
    }, 0);
  };

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Product CRUD Modal Handlers
  const handleOpenProductDialog = (type, prod = null) => {
    setProductDialogType(type);
    setProductError('');
    setProductDialogOpen(true);

    if (type === 'edit' && prod) {
      setSelectedProduct(prod);
      setProductForm({
        name: prod.name,
        price: prod.price.toString(),
        quantity: prod.quantity.toString(),
        category: typeof prod.category === 'object' ? prod.category._id : prod.category,
      });
    } else {
      setSelectedProduct(null);
      setProductForm({
        name: '',
        price: '',
        quantity: '0',
        category: '',
      });
    }
  };

  const handleCloseProductDialog = () => {
    setProductDialogOpen(false);
    setSelectedProduct(null);
    setProductForm({ name: '', price: '', quantity: '', category: '' });
  };

  const handleProductFormChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value
    });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductError('');

    const { name, price, quantity, category } = productForm;
    if (!name.trim()) {
      setProductError('Product name is required.');
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setProductError('Price must be a positive number or 0.');
      return;
    }
    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum < 0) {
      setProductError('Quantity must be a positive whole number or 0.');
      return;
    }
    if (!category) {
      setProductError('Please select a category.');
      return;
    }

    setProductSubmitting(true);

    try {
      let res;
      const payload = {
        name: name.trim(),
        price: priceNum,
        quantity: qtyNum,
        category
      };

      if (productDialogType === 'add') {
        res = await createProduct(payload);
      } else {
        res = await updateProduct(selectedProduct._id, payload);
      }

      if (res.success) {
        handleCloseProductDialog();
        fetchProducts();
      } else {
        setProductError(res.message || 'Operation failed');
      }
    } catch (err) {
      setProductError(err.response?.data?.message || 'Error occurred while saving product.');
    } finally {
      setProductSubmitting(false);
    }
  };

  // Stock Adjustment Modal Handlers
  const handleOpenStockDialog = (type, prod) => {
    setSelectedProduct(prod);
    setStockType(type);
    setStockQty('');
    setStockError('');
    setStockDialogOpen(true);
  };

  const handleCloseStockDialog = () => {
    setStockDialogOpen(false);
    setSelectedProduct(null);
    setStockQty('');
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    setStockError('');

    const qtyNum = parseInt(stockQty, 10);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setStockError('Quantity must be a positive whole number.');
      return;
    }

    if (stockType === 'OUT' && qtyNum > selectedProduct.quantity) {
      setStockError(`Not enough stock available. Current stock is ${selectedProduct.quantity} units.`);
      return;
    }

    setStockSubmitting(true);
    try {
      let res;
      if (stockType === 'IN') {
        res = await stockIn({ productId: selectedProduct._id, quantity: qtyNum });
      } else {
        res = await stockOut({ productId: selectedProduct._id, quantity: qtyNum });
      }

      if (res.success) {
        handleCloseStockDialog();
        fetchProducts();
      } else {
        setStockError(res.message || 'Failed to update stock');
      }
    } catch (err) {
      setStockError(err.response?.data?.message || 'Error executing stock operation');
    } finally {
      setStockSubmitting(false);
    }
  };

  // Delete Handlers
  const handleOpenDelete = (prod) => {
    setSelectedProduct(prod);
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteSubmit = async () => {
    setDeleteSubmitting(true);
    try {
      const res = await deleteProduct(selectedProduct._id);
      if (res.success) {
        handleCloseDelete();
        fetchProducts();
      } else {
        setError(res.message || 'Failed to delete product');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting product');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Helper to render Category name safely
  const renderCategoryName = (prod) => {
    if (typeof prod.category === 'object' && prod.category !== null) {
      return prod.category.name;
    }
    // Fallback: look up in categories list
    const found = categories.find(c => c._id === prod.category);
    return found ? found.name : 'Unknown';
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top Search & Actions bar */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', width: '100%', maxWidth: 400 }}>
          <TextField
            placeholder="Search products & press enter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" style={{ color: '#9ca3af' }}>
                  <MdSearch size={20} />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} edge="end" sx={{ color: '#9ca3af' }}>
                    <MdClose size={18} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </form>

        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<MdAdd />}
            onClick={() => handleOpenProductDialog('add')}
            sx={{ height: 44 }}
          >
            Add Product
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Products Table */}
      <Card>
        <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
          {loading ? (
            <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={40} color="primary" />
            </Box>
          ) : products.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                No products found.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="center">Price</TableCell>
                  <TableCell align="center">Stock Level</TableCell>
                  {isAdmin && <TableCell align="center">Quick Adjust</TableCell>}
                  {isAdmin && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((prod) => {
                  const isLowStock = prod.quantity < 5;
                  return (
                    <TableRow 
                      key={prod._id}
                      sx={{ 
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' },
                        ...(isLowStock && {
                          backgroundColor: 'rgba(239, 68, 68, 0.02)',
                        })
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {prod.name}
                          {isLowStock && (
                            <Tooltip title="Low Stock Warning">
                              <Box sx={{ color: 'error.main', display: 'flex' }}>
                                <MdInfoOutline size={16} />
                              </Box>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={renderCategoryName(prod)} 
                          size="small" 
                          sx={{ backgroundColor: '#1f2937', color: 'secondary.light', fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell align="center">₹{prod.price.toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${prod.quantity} units`}
                          color={isLowStock ? 'error' : 'success'}
                          variant="outlined"
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      
                      {/* Quick Adjust Buttons (Stock In/Out) */}
                      {isAdmin && (
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="Stock In (Add Stock)">
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenStockDialog('IN', prod)}
                                sx={{ 
                                  color: 'success.main', 
                                  border: '1px solid rgba(16, 185, 129, 0.1)',
                                  '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.08)' } 
                                }}
                              >
                                <MdTrendingUp size={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Stock Out (Remove Stock)">
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenStockDialog('OUT', prod)}
                                sx={{ 
                                  color: 'error.main', 
                                  border: '1px solid rgba(239, 68, 68, 0.1)',
                                  '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.08)' } 
                                }}
                              >
                                <MdTrendingDown size={18} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      )}

                      {/* CRUD Actions */}
                      {isAdmin && (
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Tooltip title="Edit Product">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenProductDialog('edit', prod)}
                                sx={{ color: 'text.secondary', '&:hover': { color: 'secondary.main', backgroundColor: 'rgba(6, 182, 212, 0.08)' } }}
                              >
                                <MdEdit size={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Product">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDelete(prod)}
                                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', backgroundColor: 'rgba(239, 68, 68, 0.08)' } }}
                              >
                                <MdDelete size={18} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        
        {/* Pagination Footer */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalProducts}
          rowsPerPage={limit}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            '& .MuiTablePagination-selectIcon': { color: 'text.secondary' }
          }}
        />
      </Card>

      {/* Add / Edit Product Form Dialog */}
      <Dialog
        open={productDialogOpen}
        onClose={handleCloseProductDialog}
        PaperProps={{
          sx: {
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
            width: '100%',
            maxWidth: 480,
            borderRadius: '12px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {productDialogType === 'add' ? 'Create New Product' : 'Edit Product'}
        </DialogTitle>
        <form onSubmit={handleProductSubmit}>
          <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.2 }}>
            {productError && <Alert severity="error">{productError}</Alert>}

            <TextField
              label="Product Name"
              name="name"
              value={productForm.name}
              onChange={handleProductFormChange}
              required
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Price (₹)"
                name="price"
                type="number"
                inputProps={{ step: 'any', min: 0 }}
                value={productForm.price}
                onChange={handleProductFormChange}
                required
              />
              <TextField
                label="Stock Quantity"
                name="quantity"
                type="number"
                inputProps={{ min: 0 }}
                value={productForm.quantity}
                onChange={handleProductFormChange}
                disabled={productDialogType === 'edit'} // API update product doesn't update stock directly; use operations
                required
              />
            </Box>

            <FormControl fullWidth required>
              <InputLabel id="category-select-label" sx={{ color: 'text.secondary' }}>Category</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                name="category"
                value={productForm.category}
                label="Category"
                onChange={handleProductFormChange}
                sx={{
                  backgroundColor: '#1f2937',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#10b981',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#10b981',
                  },
                }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseProductDialog} sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={productSubmitting}
            >
              {productSubmitting ? 'Saving...' : 'Save Product'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Stock Adjust (In/Out) Dialog */}
      <Dialog
        open={stockDialogOpen}
        onClose={handleCloseStockDialog}
        PaperProps={{
          sx: {
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
            width: '100%',
            maxWidth: 400,
            borderRadius: '12px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {stockType === 'IN' ? 'Stock In Operation' : 'Stock Out Operation'}
        </DialogTitle>
        <form onSubmit={handleStockSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {stockError && <Alert severity="error" sx={{ mb: 2 }}>{stockError}</Alert>}
            
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Product: <strong>{selectedProduct?.name}</strong> <br />
              Current Inventory: <strong>{selectedProduct?.quantity} units</strong>
            </Typography>

            <TextField
              autoFocus
              label={`Quantity to Stock ${stockType === 'IN' ? 'In' : 'Out'}`}
              type="number"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              inputProps={{ min: 1 }}
              required
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseStockDialog} sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color={stockType === 'IN' ? 'primary' : 'error'}
              disabled={stockSubmitting}
            >
              {stockSubmitting ? 'Processing...' : `Confirm Stock ${stockType === 'IN' ? 'In' : 'Out'}`}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        PaperProps={{
          sx: {
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
            width: '100%',
            maxWidth: 400,
            borderRadius: '12px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Delete Product
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Are you sure you want to permanently delete <strong>{selectedProduct?.name}</strong>? This is a hard delete operation and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDelete} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteSubmit}
            variant="contained"
            color="error"
            disabled={deleteSubmitting}
          >
            {deleteSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;

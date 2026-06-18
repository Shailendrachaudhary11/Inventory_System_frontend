import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProducts, getInventoryLogs, stockIn, stockOut } from '../api';
import { motion } from 'framer-motion';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField, 
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  MdListAlt, 
  MdSwapVert, 
  MdTrendingUp, 
  MdTrendingDown, 
  MdSearch,
  MdClose,
  MdLock
} from 'react-icons/md';

const StockOperations = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // State
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    productId: '',
    type: 'IN', // IN or OUT
    quantity: ''
  });

  const fetchData = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setError('');
      // Fetch products (all for the select list - we can fetch with high limit)
      // and logs in parallel
      const [prodRes, logRes] = await Promise.all([
        getProducts({ limit: 100 }),
        getInventoryLogs()
      ]);

      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data.products || []);
      }
      if (logRes.success && logRes.data) {
        const logsList = logRes.data.logs || [];
        // Sort logs descending by createdAt
        const sortedLogs = [...logsList].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setLogs(sortedLogs);
        setFilteredLogs(sortedLogs);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data from API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter logs locally based on search (filter by product name)
  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = logs.filter(log => 
      log.productId?.name?.toLowerCase().includes(term) ||
      log.type?.toLowerCase().includes(term)
    );
    setFilteredLogs(filtered);
  }, [search, logs]);

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const { productId, type, quantity } = formData;
    if (!productId) {
      setError('Please select a product.');
      return;
    }
    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('Quantity must be a positive whole number.');
      return;
    }

    // Verify stock availability on stock out
    const selectedProd = products.find(p => p._id === productId);
    if (type === 'OUT' && selectedProd && qtyNum > selectedProd.quantity) {
      setError(`Stock Out quantity exceeds current stock. Only ${selectedProd.quantity} units available.`);
      return;
    }

    setSubmitting(true);
    try {
      let res;
      const payload = { productId, quantity: qtyNum };
      
      if (type === 'IN') {
        res = await stockIn(payload);
      } else {
        res = await stockOut(payload);
      }

      if (res.success) {
        setSuccessMsg(`Successfully processed Stock-${type === 'IN' ? 'In' : 'Out'} for ${res.data?.productId?.name || 'product'}.`);
        setFormData({ productId: '', type: 'IN', quantity: '' });
        fetchData(); // refresh table & product counts
      } else {
        setError(res.message || 'Operation failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', textAlign: 'center', p: 3 }}>
        <Box sx={{ color: 'error.main', mb: 2 }}>
          <MdLock size={60} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 450 }}>
          You do not have administrative permissions to perform stock adjustments or view inventory transaction logs.
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <CircularProgress size={50} color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={4}>
        {/* Transaction Entry Form */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ position: 'sticky', top: 100 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdSwapVert size={24} style={{ color: '#10b981' }} /> Stock Adjustment
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  
                  {/* Select Product */}
                  <FormControl fullWidth required>
                    <InputLabel id="ops-product-label" sx={{ color: 'text.secondary' }}>Select Product</InputLabel>
                    <Select
                      labelId="ops-product-label"
                      id="ops-product"
                      name="productId"
                      value={formData.productId}
                      label="Select Product"
                      onChange={handleFormChange}
                      sx={{
                        backgroundColor: '#1f2937',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#10b981',
                        },
                      }}
                    >
                      {products.map((p) => (
                        <MenuItem key={p._id} value={p._id}>
                          {p.name} ({p.quantity} units left)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Operation Type (IN vs OUT) */}
                  <FormControl component="fieldset">
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>
                      Adjustment Type
                    </Typography>
                    <RadioGroup 
                      row 
                      name="type" 
                      value={formData.type} 
                      onChange={handleFormChange}
                    >
                      <FormControlLabel 
                        value="IN" 
                        control={<Radio color="primary" />} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#10b981', fontWeight: 600 }}>
                            <MdTrendingUp /> Stock In (Add)
                          </Box>
                        } 
                      />
                      <FormControlLabel 
                        value="OUT" 
                        control={<Radio color="error" />} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#ef4444', fontWeight: 600 }}>
                            <MdTrendingDown /> Stock Out (Remove)
                          </Box>
                        } 
                      />
                    </RadioGroup>
                  </FormControl>

                  {/* Quantity */}
                  <TextField
                    label="Transaction Quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    placeholder="e.g. 5"
                    inputProps={{ min: 1 }}
                    required
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color={formData.type === 'IN' ? 'primary' : 'error'}
                    size="large"
                    disabled={submitting}
                    sx={{ height: 48, fontWeight: 700 }}
                  >
                    {submitting ? 'Executing...' : `Confirm Stock ${formData.type === 'IN' ? 'In' : 'Out'}`}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction History Logs */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdListAlt size={24} style={{ color: '#06b6d4' }} /> Movement Log
                </Typography>
                
                <TextField
                  placeholder="Filter logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ width: 220 }}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" style={{ color: '#9ca3af' }}>
                        <MdSearch size={18} />
                      </InputAdornment>
                    ),
                    endAdornment: search && (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setSearch('')} size="small" edge="end" sx={{ color: '#9ca3af' }}>
                          <MdClose size={16} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              {filteredLogs.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    No inventory movements match your filter.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Type</TableCell>
                        <TableCell align="center">Adjusted</TableCell>
                        <TableCell align="center">Stock State</TableCell>
                        <TableCell align="right">Date & Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredLogs.map((log) => {
                        const isIN = log.type === 'IN';
                        return (
                          <TableRow 
                            key={log._id}
                            component={motion.tr}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}
                          >
                            <TableCell sx={{ fontWeight: 600 }}>
                              {log.productId?.name || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Deleted Product</span>}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={log.type}
                                size="small"
                                color={isIN ? 'success' : 'error'}
                                sx={{ 
                                  fontWeight: 700, 
                                  height: 20, 
                                  fontSize: '0.75rem',
                                  backgroundColor: isIN ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' 
                                }}
                              />
                            </TableCell>
                            <TableCell 
                              align="center" 
                              sx={{ 
                                fontWeight: 700, 
                                color: isIN ? 'success.main' : 'error.main' 
                              }}
                            >
                              {isIN ? '+' : '-'}{log.quantity}
                            </TableCell>
                            <TableCell align="center" sx={{ color: 'text.secondary' }}>
                              {log.productId?.quantity !== undefined ? `${log.productId.quantity} left` : 'N/A'}
                            </TableCell>
                            <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                              {new Date(log.date || log.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StockOperations;

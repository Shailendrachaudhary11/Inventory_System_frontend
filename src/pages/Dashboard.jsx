import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getProducts, 
  getLowStockProducts, 
  getCategories, 
  getInventoryLogs,
  stockIn 
} from '../api';
import { motion } from 'framer-motion';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  MdInventory, 
  MdWarning, 
  MdCategory, 
  MdListAlt, 
  MdAdd, 
  MdRefresh,
  MdArrowForward,
  MdTrendingUp,
  MdTrendingDown
} from 'react-icons/md';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  // State variables
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalCategories: 0,
    totalLogs: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Stock In Modal State
  const [stockInOpen, setStockInOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockQty, setStockQty] = useState('');
  const [stockInSubmitting, setStockInSubmitting] = useState(false);
  const [stockInError, setStockInError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setError('');
      // Run in parallel for speed
      const [prodRes, lowStockRes, catRes] = await Promise.all([
        getProducts({ page: 1, limit: 1 }),
        getLowStockProducts(),
        getCategories()
      ]);

      const lowStockProductsList = lowStockRes.data?.products || [];
      const categoriesList = catRes.data?.categories || [];
      const totalProductsCount = prodRes.data?.pagination?.totalProducts || 0;

      let logCount = 0;
      let logs = [];
      if (isAdmin) {
        try {
          const logRes = await getInventoryLogs();
          if (logRes.success && logRes.data) {
            logs = logRes.data.logs || [];
            logCount = logs.length;
          }
        } catch (logErr) {
          console.error('Failed to load logs:', logErr);
        }
      }

      setMetrics({
        totalProducts: totalProductsCount,
        lowStockCount: lowStockProductsList.length,
        totalCategories: categoriesList.length,
        totalLogs: logCount,
      });

      setLowStockItems(lowStockProductsList);
      setRecentLogs(logs.slice(0, 5)); // Show last 5 logs
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Stock In Handlers
  const handleOpenStockIn = (product) => {
    setSelectedProduct(product);
    setStockQty('');
    setStockInError('');
    setStockInOpen(true);
  };

  const handleCloseStockIn = () => {
    setStockInOpen(false);
    setSelectedProduct(null);
  };

  const handleStockInSubmit = async (e) => {
    e.preventDefault();
    if (!stockQty || isNaN(stockQty) || parseInt(stockQty) <= 0) {
      setStockInError('Please enter a valid positive quantity.');
      return;
    }

    setStockInSubmitting(true);
    setStockInError('');

    try {
      const res = await stockIn({
        productId: selectedProduct._id,
        quantity: parseInt(stockQty)
      });

      if (res.success) {
        handleCloseStockIn();
        fetchDashboardData(); // Refresh counts and lists
      } else {
        setStockInError(res.message || 'Failed to update stock');
      }
    } catch (err) {
      setStockInError(err.response?.data?.message || 'Error executing stock adjustment');
    } finally {
      setStockInSubmitting(false);
    }
  };

  const statCards = [
    { 
      title: 'Total Products', 
      value: metrics.totalProducts, 
      icon: <MdInventory size={26} />, 
      color: '#06b6d4', 
      bgColor: 'rgba(6, 182, 212, 0.1)',
      clickable: true,
      onClick: () => navigate('/products')
    },
    { 
      title: 'Low Stock Alerts', 
      value: metrics.lowStockCount, 
      icon: <MdWarning size={26} />, 
      color: '#ef4444', 
      bgColor: 'rgba(239, 68, 68, 0.1)',
      subtitle: 'Items quantity < 5',
      glow: metrics.lowStockCount > 0
    },
    { 
      title: 'Active Categories', 
      value: metrics.totalCategories, 
      icon: <MdCategory size={26} />, 
      color: '#10b981', 
      bgColor: 'rgba(16, 185, 129, 0.1)',
      clickable: true,
      onClick: () => navigate('/categories')
    },
    { 
      title: isAdmin ? 'Stock Movements' : 'Role Access', 
      value: isAdmin ? metrics.totalLogs : 'User Mode', 
      icon: <MdListAlt size={26} />, 
      color: '#a855f7', 
      bgColor: 'rgba(168, 85, 247, 0.1)',
      clickable: isAdmin,
      onClick: () => isAdmin ? navigate('/stock-ops') : null
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <CircularProgress size={50} color="primary" />
      </Box>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header and Refresh Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Welcome back, {user?.name}! Here's what's happening with your inventory today.
          </Typography>
        </Box>
        <IconButton 
          onClick={handleRefresh} 
          disabled={refreshing}
          sx={{ border: '1px solid rgba(255,255,255,0.08)', '&:hover': { color: 'primary.main', borderColor: 'primary.main' } }}
        >
          {refreshing ? <CircularProgress size={20} color="inherit" /> : <MdRefresh size={20} />}
        </IconButton>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Metrics Grid */}
      <Grid 
        container 
        spacing={3} 
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        sx={{ mb: 4 }}
      >
        {statCards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card
              component={motion.div}
              variants={itemVariants}
              onClick={card.onClick}
              sx={{
                cursor: card.clickable ? 'pointer' : 'default',
                ...(card.glow && {
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.25)',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                })
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {card.value}
                  </Typography>
                  {card.subtitle && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                      {card.subtitle}
                    </Typography>
                  )}
                </Box>
                <Box
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: card.bgColor,
                    color: card.color,
                  }}
                >
                  {card.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Double Column Layout */}
      <Grid container spacing={3}>
        {/* Low Stock Panel */}
        <Grid item xs={12} md={isAdmin ? 7 : 12}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdWarning size={22} style={{ color: '#ef4444' }} /> Low Stock Products
                </Typography>
                <Chip 
                  label={`${lowStockItems.length} Warning(s)`} 
                  color={lowStockItems.length > 0 ? 'error' : 'success'} 
                  size="small" 
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {lowStockItems.length === 0 ? (
                <Box sx={{ py: 6, textTransform: 'center', textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    No products have low stock! Good job!
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', boxShadow: 'none', border: 'none' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product Name</TableCell>
                        <TableCell align="center">Price</TableCell>
                        <TableCell align="center">Current Stock</TableCell>
                        {isAdmin && <TableCell align="right">Quick Action</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lowStockItems.map((prod) => (
                        <TableRow key={prod._id} sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}>
                          <TableCell sx={{ fontWeight: 600 }}>{prod.name}</TableCell>
                          <TableCell align="center">₹{prod.price.toLocaleString()}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={`${prod.quantity} Left`} 
                              color="error" 
                              variant="outlined" 
                              size="small" 
                              sx={{ fontWeight: 700, borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }} 
                            />
                          </TableCell>
                          {isAdmin && (
                            <TableCell align="right">
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<MdAdd />}
                                onClick={() => handleOpenStockIn(prod)}
                                sx={{ py: 0.5 }}
                              >
                                Stock In
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent logs Panel (Admin Only) */}
        {isAdmin && (
          <Grid item xs={12} md={5}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MdListAlt size={22} style={{ color: '#a855f7' }} /> Recent Movements
                  </Typography>
                  <Button 
                    variant="text" 
                    endIcon={<MdArrowForward />} 
                    onClick={() => navigate('/stock-ops')}
                    sx={{ color: 'primary.main', fontSize: '0.85rem' }}
                  >
                    View All
                  </Button>
                </Box>

                {recentLogs.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      No inventory movements recorded yet.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                    {recentLogs.map((log) => {
                      const isStockIn = log.type === 'IN';
                      return (
                        <Box 
                          key={log._id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.04)',
                            backgroundColor: 'rgba(255, 255, 255, 0.01)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.02)',
                              borderColor: 'rgba(255, 255, 255, 0.08)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box 
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: isStockIn ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: isStockIn ? '#10b981' : '#ef4444'
                              }}
                            >
                              {isStockIn ? <MdTrendingUp size={20} /> : <MdTrendingDown size={20} />}
                            </Box>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {log.productId?.name || 'Deleted Product'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {new Date(log.date || log.createdAt).toLocaleDateString(undefined, { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 700, 
                                color: isStockIn ? '#10b981' : '#ef4444' 
                              }}
                            >
                              {isStockIn ? '+' : '-'}{log.quantity}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              Stock Left: {log.productId?.quantity ?? 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Stock In Quick Modal Dialog */}
      <Dialog 
        open={stockInOpen} 
        onClose={handleCloseStockIn}
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
          Quick Stock In
        </DialogTitle>
        <form onSubmit={handleStockInSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {stockInError && <Alert severity="error" sx={{ mb: 2 }}>{stockInError}</Alert>}
            
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Add inventory stock for <strong>{selectedProduct?.name}</strong>. Currently at {selectedProduct?.quantity} units.
            </Typography>

            <TextField
              autoFocus
              label="Quantity to Add"
              type="number"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              inputProps={{ min: 1 }}
              required
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseStockIn} sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={stockInSubmitting}
            >
              {stockInSubmitting ? 'Adding...' : 'Add Stock'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Dashboard;

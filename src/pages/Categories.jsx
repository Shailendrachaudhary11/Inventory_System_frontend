import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api';
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
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  InputAdornment
} from '@mui/material';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdCategory, MdClose } from 'react-icons/md';

const Categories = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // State
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // 'add' or 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [dialogSubmitting, setDialogSubmitting] = useState(false);
  const [dialogError, setDialogError] = useState('');

  // Delete Confirm Dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setError('');
      const res = await getCategories();
      if (res.success && res.data) {
        const categoriesList = res.data.categories || [];
        setCategories(categoriesList);
        setFilteredCategories(categoriesList);
      } else {
        setError(res.message || 'Failed to fetch categories');
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

  // Handle Client Search
  useEffect(() => {
    const filtered = categories.filter(cat => 
      cat.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [search, categories]);

  // Dialog Handlers
  const handleOpenDialog = (type, category = null) => {
    setDialogType(type);
    setDialogOpen(true);
    setDialogError('');
    if (type === 'edit' && category) {
      setSelectedCategory(category);
      setCategoryName(category.name);
    } else {
      setSelectedCategory(null);
      setCategoryName('');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCategory(null);
    setCategoryName('');
  };

  const handleDialogSubmit = async (e) => {
    e.preventDefault();
    const nameTrimmed = categoryName.trim();
    
    if (nameTrimmed.length < 2) {
      setDialogError('Category name must be at least 2 characters long.');
      return;
    }

    // Check duplicate local validation (active category only)
    const duplicate = categories.find(cat => 
      cat.name.toLowerCase() === nameTrimmed.toLowerCase() && 
      (!selectedCategory || cat._id !== selectedCategory._id)
    );
    if (duplicate) {
      setDialogError('A category with this name already exists.');
      return;
    }

    setDialogSubmitting(true);
    setDialogError('');

    try {
      let res;
      if (dialogType === 'add') {
        res = await createCategory({ name: nameTrimmed });
      } else {
        res = await updateCategory(selectedCategory._id, { name: nameTrimmed });
      }

      if (res.success) {
        handleCloseDialog();
        fetchCategories();
      } else {
        setDialogError(res.message || 'Operation failed');
      }
    } catch (err) {
      setDialogError(err.response?.data?.message || 'Error occurred. Please try again.');
    } finally {
      setDialogSubmitting(false);
    }
  };

  // Delete Handlers
  const handleOpenDelete = (category) => {
    setSelectedCategory(category);
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteSubmit = async () => {
    setDeleteSubmitting(true);
    try {
      const res = await deleteCategory(selectedCategory._id);
      if (res.success) {
        handleCloseDelete();
        fetchCategories();
      } else {
        setError(res.message || 'Failed to delete category');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting category');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <CircularProgress size={50} color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top Search & Actions */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <TextField
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 300 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" style={{ color: '#9ca3af' }}>
                <MdSearch size={20} />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearch('')} edge="end" sx={{ color: '#9ca3af' }}>
                  <MdClose size={18} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<MdAdd />}
            onClick={() => handleOpenDialog('add')}
            sx={{ height: 44 }}
          >
            Add Category
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Grid List */}
      {filteredCategories.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {search ? 'No categories match your search query.' : 'No active categories found.'}
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredCategories.map((cat, idx) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={cat._id}
              component={motion.div}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card 
                sx={{ 
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px 0 rgba(6, 182, 212, 0.15)',
                    borderColor: 'secondary.main'
                  }
                }}
              >
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box 
                      sx={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: '10px', 
                        backgroundColor: 'rgba(6, 182, 212, 0.1)', 
                        color: 'secondary.main', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}
                    >
                      <MdCategory size={22} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {cat.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Created: {new Date(cat.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Actions Drawer Footer */}
                  {isAdmin && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <Tooltip title="Edit Category">
                        <IconButton 
                          onClick={() => handleOpenDialog('edit', cat)}
                          sx={{ 
                            color: 'text.secondary', 
                            '&:hover': { color: 'secondary.main', backgroundColor: 'rgba(6, 182, 212, 0.1)' } 
                          }}
                        >
                          <MdEdit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Category">
                        <IconButton 
                          onClick={() => handleOpenDelete(cat)}
                          sx={{ 
                            color: 'text.secondary', 
                            '&:hover': { color: 'error.main', backgroundColor: 'rgba(239, 68, 68, 0.1)' } 
                          }}
                        >
                          <MdDelete size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add / Edit Category Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
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
          {dialogType === 'add' ? 'Create New Category' : 'Edit Category'}
        </DialogTitle>
        <form onSubmit={handleDialogSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
            
            <TextField
              autoFocus
              label="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Home Appliances"
              required
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseDialog} sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={dialogSubmitting}
            >
              {dialogSubmitting ? 'Saving...' : 'Save'}
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
          Delete Category
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Are you sure you want to delete <strong>{selectedCategory?.name}</strong>? This action will hide it from the active categories list.
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

export default Categories;

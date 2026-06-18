import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLowStockProducts } from '../api';
import { 
  MdNotifications, 
  MdPerson, 
  MdLogout, 
  MdMenu, 
  MdWarning,
  MdOutlineArrowForwardIos,
  MdLock
} from 'react-icons/md';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Badge, 
  Box, 
  Menu, 
  MenuItem, 
  Avatar, 
  Popover, 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  Divider, 
  ListItemIcon
} from '@mui/material';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Profile dropdown menu
  const [profileAnchor, setProfileAnchor] = useState(null);
  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);

  // Notification / Low Stock popover
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

  const fetchLowStock = async () => {
    try {
      const res = await getLowStockProducts();
      if (res.success && res.data) {
        setLowStockProducts(res.data.products || []);
      }
    } catch (err) {
      console.error('Failed to load low stock items for notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLowStock();
      // Fetch every 30 seconds
      const interval = setInterval(fetchLowStock, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Determine current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/products')) return 'Products Management';
    if (path.startsWith('/categories')) return 'Categories';
    if (path.startsWith('/stock-ops')) return 'Stock Operations';
    if (path.startsWith('/profile')) return 'User Profile';
    return 'ApexInventory';
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: '#0b0f19', 
        backgroundImage: 'none', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: 'none',
        zIndex: 999 
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 80 }}>
        {/* Left section: Drawer Toggle for Mobile & Page Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MdMenu size={24} />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: -0.5 }}>
            {getPageTitle()}
          </Typography>
        </Box>

        {/* Right section: Search / Alerts / Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          
          {/* Notifications / Low Stock Alerts */}
          <IconButton 
            onClick={handleNotifOpen}
            sx={{ 
              color: 'text.secondary', 
              border: '1px solid rgba(255, 255, 255, 0.08)',
              p: 1.25,
              '&:hover': { color: 'primary.main', backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'primary.main' }
            }}
          >
            <Badge badgeContent={lowStockProducts.length} color="error">
              <MdNotifications size={20} />
            </Badge>
          </IconButton>

          {/* User Profile Avatar Dropdown */}
          <IconButton
            onClick={handleProfileOpen}
            sx={{ p: 0.5, border: '2px solid rgba(16, 185, 129, 0.2)', '&:hover': { borderColor: 'primary.main' } }}
          >
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36, 
                backgroundColor: 'primary.main', 
                color: 'primary.contrastText',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '0.95rem'
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
        </Box>

        {/* Profile Dropdown Menu */}
        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={handleProfileClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
              mt: 1.5,
              minWidth: 200,
              borderRadius: '12px',
              '& .MuiMenuItem-root': {
                py: 1.25,
                px: 2,
                borderRadius: '6px',
                mx: 1,
                my: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  color: 'primary.main',
                }
              }
            }
          }}
        >
          <Box sx={{ px: 2.5, py: 1.5, pointerEvents: 'none' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textTransform: 'capitalize' }}>
              {user?.role}
            </Typography>
          </Box>
          <Divider sx={{ my: 0.5, opacity: 0.5 }} />
          
          <MenuItem onClick={() => { handleProfileClose(); navigate('/profile'); }}>
            <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
              <MdPerson size={18} />
            </ListItemIcon>
            <ListItemText primary="My Profile" />
          </MenuItem>
          
          <MenuItem onClick={() => { handleProfileClose(); navigate('/profile'); }}>
            <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
              <MdLock size={18} />
            </ListItemIcon>
            <ListItemText primary="Change Password" />
          </MenuItem>

          <Divider sx={{ my: 0.5, opacity: 0.5 }} />

          <MenuItem onClick={() => { handleProfileClose(); logout(); }} sx={{ color: 'error.main', '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.08) !important', color: 'error.main !important' } }}>
            <ListItemIcon sx={{ color: 'error.main', minWidth: 32 }}>
              <MdLogout size={18} />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Menu>

        {/* Notifications Popover */}
        <Popover
          open={Boolean(notifAnchor)}
          anchorEl={notifAnchor}
          onClose={handleNotifClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              width: 320,
              maxHeight: 400,
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
              mt: 1.5,
              borderRadius: '12px',
              p: 1.5
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.75 }}>
              Notifications
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {lowStockProducts.length} Alert(s)
            </Typography>
          </Box>
          <Divider sx={{ mb: 1, opacity: 0.5 }} />

          {lowStockProducts.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                All products are sufficiently stocked.
              </Typography>
            </Box>
          ) : (
            <>
              <List sx={{ p: 0, maxHeight: 250, overflowY: 'auto' }}>
                {lowStockProducts.map((prod) => (
                  <ListItem 
                    key={prod._id} 
                    alignItems="flex-start"
                    sx={{ 
                      px: 1, 
                      py: 1, 
                      borderRadius: '6px',
                      mb: 0.75,
                      border: '1px solid rgba(239, 68, 68, 0.1)',
                      backgroundColor: 'rgba(239, 68, 68, 0.02)',
                      '&:hover': {
                        backgroundColor: 'rgba(239, 68, 68, 0.05)'
                      }
                    }}
                  >
                    <Box sx={{ mr: 1.5, mt: 0.5, color: 'error.main' }}>
                      <MdWarning size={18} />
                    </Box>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {prod.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Only {prod.quantity} remaining in inventory
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              {user?.role === 'admin' && (
                <>
                  <Divider sx={{ my: 1, opacity: 0.5 }} />
                  <Button 
                    fullWidth 
                    variant="contained" 
                    size="small"
                    onClick={() => { handleNotifClose(); navigate('/stock-ops'); }}
                    endIcon={<MdOutlineArrowForwardIos size={12} />}
                  >
                    Manage Stock Operations
                  </Button>
                </>
              )}
            </>
          )}
        </Popover>

      </Toolbar>
    </AppBar>
  );
};

export default Header;

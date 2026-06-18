import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  MdDashboard, 
  MdCategory, 
  MdInventory, 
  MdListAlt, 
  MdPerson, 
  MdLogout,
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos
} from 'react-icons/md';
import { Box, Typography, Button, IconButton, Badge, Tooltip } from '@mui/material';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <MdDashboard size={22} />, roles: ['admin', 'user'] },
    { name: 'Products', path: '/products', icon: <MdInventory size={22} />, roles: ['admin', 'user'] },
    { name: 'Categories', path: '/categories', icon: <MdCategory size={22} />, roles: ['admin', 'user'] },
    { 
      name: 'Stock Operations', 
      path: '/stock-ops', 
      icon: <MdListAlt size={22} />, 
      roles: ['admin'], 
      badge: 'Admin' 
    },
    { name: 'Profile', path: '/profile', icon: <MdPerson size={22} />, roles: ['admin', 'user'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <Box
      component={motion.div}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      sx={{
        height: '100vh',
        backgroundColor: '#111827',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        overflowX: 'hidden',
      }}
    >
      {/* Brand Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 80, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)',
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 0.5 }}>
              ApexInventory
            </Typography>
          </Box>
        )}
        {collapsed && (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)',
              mx: 'auto',
            }}
          />
        )}
        <IconButton 
          onClick={() => setCollapsed(!collapsed)} 
          sx={{ 
            color: 'text.secondary', 
            '&:hover': { color: 'primary.main', backgroundColor: 'rgba(255,255,255,0.03)' },
            display: { xs: 'none', md: 'inline-flex' }
          }}
        >
          {collapsed ? <MdOutlineArrowForwardIos size={16} /> : <MdOutlineArrowBackIosNew size={16} />}
        </IconButton>
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flexGrow: 1, py: 3, px: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {filteredMenuItems.map((item) => (
          <Tooltip key={item.name} title={collapsed ? item.name : ''} placement="right">
            <Box
              component={NavLink}
              to={item.path}
              style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? '#10b981' : '#9ca3af',
              })}
              sx={{
                '&.active': {
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  borderLeft: '4px solid #10b981',
                  '& svg': { color: '#10b981' },
                },
                '&:not(.active):hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  color: '#f3f4f6',
                  '& svg': { color: '#f3f4f6' },
                },
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: collapsed ? 2.5 : 2,
                py: 1.5,
                borderRadius: '8px',
                transition: 'all 0.2s',
                height: 48,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </Box>
              {!collapsed && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Typography sx={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.name}</Typography>
                  {item.badge && (
                    <Typography 
                      sx={{ 
                        fontSize: '0.7rem', 
                        px: 1, 
                        py: 0.25, 
                        borderRadius: '4px', 
                        backgroundColor: 'primary.dark', 
                        color: 'primary.contrastText', 
                        fontWeight: 600,
                        textTransform: 'uppercase' 
                      }}
                    >
                      {item.badge}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Tooltip>
        ))}
      </Box>

      {/* Bottom Profile / Logout Info */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
        {!collapsed ? (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: '#1f2937',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: 'primary.main',
                  textTransform: 'uppercase',
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Box>
              <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', noWrap: true }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textTransform: 'capitalize' }}>
                  {user?.role}
                </Typography>
              </Box>
            </Box>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={logout}
              startIcon={<MdLogout />}
              sx={{ borderColor: 'rgba(239, 68, 68, 0.2)', '&:hover': { borderColor: 'error.main', backgroundColor: 'rgba(239, 68, 68, 0.05)' } }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Tooltip title="Logout" placement="right">
            <IconButton
              color="error"
              onClick={logout}
              sx={{
                mx: 'auto',
                display: 'flex',
                width: 44,
                height: 44,
                '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
              }}
            >
              <MdLogout size={20} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;

import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  InputAdornment, 
  IconButton, 
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdPerson, MdPhone, MdAssignmentInd } from 'react-icons/md';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'user', // default role
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const { name, phone, email, password } = formData;

    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters long.';
    }

    // Indian phone number validator (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return 'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address.';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const res = await register(formData);
    if (res.success) {
      navigate('/', { replace: true });
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.1) 0%, rgba(0, 0, 0, 0) 40%), radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.1) 0%, rgba(0, 0, 0, 0) 40%), #0b0f19',
        p: 2,
        py: 6,
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ width: '100%', maxWidth: 500 }}
      >
        <Card
          sx={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(17, 24, 39, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 10px 44px 0 rgba(0,0,0,0.5)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            {/* Logo and Brand */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)',
                  mb: 2,
                }}
              />
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5, mb: 1 }}>
                Create Account
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Join ApexInventory to track stock efficiently
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" style={{ color: '#9ca3af' }}>
                        <MdPerson size={20} />
                      </InputAdornment>
                    ),
                  }}
                  required
                />

                <TextField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" style={{ color: '#9ca3af' }}>
                        <MdPhone size={20} />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
                
                <TextField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" style={{ color: '#9ca3af' }}>
                        <MdEmail size={20} />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
                
                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" style={{ color: '#9ca3af' }}>
                        <MdLock size={20} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#9ca3af' }}
                        >
                          {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  required
                />

                <FormControl fullWidth required>
                  <InputLabel id="role-select-label" sx={{ color: 'text.secondary' }}>Account Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    name="role"
                    value={formData.role}
                    label="Account Role"
                    onChange={handleChange}
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
                    startAdornment={
                      <InputAdornment position="start" style={{ color: '#9ca3af', marginRight: 8 }}>
                        <MdAssignmentInd size={20} />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="user">User (View-Only / Request)</MenuItem>
                    <MenuItem value="admin">Administrator (Full Access)</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ height: 48, fontSize: '1rem', mt: 1 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                </Button>
              </Box>
            </form>

            <Box sx={{ textAlign: 'center', mt: 3.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Already have an account?{' '}
                <RouterLink
                  to="/login"
                  style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}
                >
                  Sign In
                </RouterLink>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Register;

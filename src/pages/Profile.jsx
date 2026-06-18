import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../api';
import { motion } from 'framer-motion';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField, 
  Grid,
  Avatar,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import { 
  MdPerson, 
  MdPhone, 
  MdEmail, 
  MdLock, 
  MdVisibility, 
  MdVisibilityOff, 
  MdSecurity 
} from 'react-icons/md';

const Profile = () => {
  const { user, refreshUser } = useAuth();

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  // Profile Submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    const { name, phone, email } = profileForm;
    if (name.trim().length < 2) {
      setProfileError('Name must be at least 2 characters long.');
      return;
    }
    // 10 digit Indian mobile number validator
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setProfileError('Please enter a valid 10-digit Indian phone number.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setProfileError('Please enter a valid email address.');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await updateProfile({
        name: name.trim(),
        phone,
        email
      });
      // The API documentation doesn't specify response object but usually it's success: true
      setProfileSuccess('Profile updated successfully!');
      refreshUser(); // reload the user info in header and sidebar
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    const { oldPassword, newPassword, confirmPassword } = passwordForm;
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassError('Please fill in all fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Confirm password does not match.');
      return;
    }

    setPassLoading(true);
    try {
      const res = await changePassword({
        oldPassword,
        newPassword,
        confirmPassword
      });
      setPassSuccess('Password changed successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed to change password. Please verify old password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={4}>
        {/* User Card Info */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  boxShadow: '0 8px 24px 0 rgba(16, 185, 129, 0.3)',
                  mb: 3,
                  border: '3px solid rgba(255,255,255,0.08)'
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                {user?.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {user?.email}
              </Typography>
              
              <Chip 
                label={user?.role} 
                color="primary" 
                sx={{ 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  fontSize: '0.75rem',
                  px: 1.5,
                  mb: 4
                }} 
              />

              <Divider sx={{ width: '100%', mb: 3, opacity: 0.5 }} />

              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.2, textAlign: 'left' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: 'primary.main', display: 'flex' }}><MdPhone size={20} /></Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Phone Number</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.phone}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: 'primary.main', display: 'flex' }}><MdEmail size={20} /></Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Email Address</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.email}</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Update Forms */}
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          
          {/* Edit Profile Form */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdPerson size={22} style={{ color: '#10b981' }} /> Personal Details
              </Typography>

              {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}
              {profileSuccess && <Alert severity="success" sx={{ mb: 2 }}>{profileSuccess}</Alert>}

              <form onSubmit={handleProfileSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Full Name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone Number"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="e.g. 9876543210"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ textAlign: 'right' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={profileLoading}
                      sx={{ px: 4, height: 44 }}
                    >
                      {profileLoading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Form */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdSecurity size={22} style={{ color: '#06b6d4' }} /> Security & Password
              </Typography>

              {passError && <Alert severity="error" sx={{ mb: 2 }}>{passError}</Alert>}
              {passSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passSuccess}</Alert>}

              <form onSubmit={handlePasswordSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Current Password"
                      name="oldPassword"
                      type={showOldPass ? 'text' : 'password'}
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowOldPass(!showOldPass)} edge="end" sx={{ color: '#9ca3af' }}>
                              {showOldPass ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="New Password"
                      name="newPassword"
                      type={showNewPass ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowNewPass(!showNewPass)} edge="end" sx={{ color: '#9ca3af' }}>
                              {showNewPass ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Confirm New Password"
                      name="confirmPassword"
                      type={showConfirmPass ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPass(!showConfirmPass)} edge="end" sx={{ color: '#9ca3af' }}>
                              {showConfirmPass ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ textAlign: 'right' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      disabled={passLoading}
                      sx={{ px: 4, height: 44 }}
                    >
                      {passLoading ? <CircularProgress size={20} color="inherit" /> : 'Change Password'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>

        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;

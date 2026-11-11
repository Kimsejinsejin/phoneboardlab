import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';

export default function Header() {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'background.paper', color: 'text.primary', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <PhoneAndroidIcon sx={{ color: 'primary.main', mr: 1 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, background: 'linear-gradient(45deg, #1a73e8 30%, #aa3bff 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AutoBoard Pro
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>A</Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

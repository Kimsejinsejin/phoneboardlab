import React from 'react';
import { Drawer, Box, Typography, Button, Divider, List, ListItem, ListItemIcon, ListItemText, ListItemButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const NAV_ITEMS = [
  { label: 'Dashboard',  path: '/',          Icon: DashboardIcon },
  { label: 'Campaigns',  path: '/campaigns', Icon: AssignmentIcon },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #0d0d1a 0%, #111827 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        },
      }}
    >
      {/* 로고 영역 */}
      <Box sx={{ px: 2.5, py: 2, minHeight: 64, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 2,
          background: 'linear-gradient(135deg, #1a73e8 0%, #aa3bff 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <SmartphoneIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'white', lineHeight: 1.1 }}>
            AutoBoard
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>
            Pro
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* 네비게이션 */}
      <Box sx={{ p: 1.5, flex: 1 }}>
        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.3)', px: 1.5, fontSize: '0.6rem', letterSpacing: '0.1em' }}>
          메뉴
        </Typography>
        <List dense sx={{ mt: 0.5 }}>
          {NAV_ITEMS.map(({ label, path, Icon }) => {
            const isActive = pathname === path || (path !== '/' && pathname.startsWith(path));
            return (
              <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(path)}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    px: 1.5,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(26,115,232,0.15)',
                      '&:hover': { bgcolor: 'rgba(26,115,232,0.22)' },
                    },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Icon sx={{ fontSize: 20, color: isActive ? 'primary.main' : 'rgba(255,255,255,0.4)' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 700 : 400,
                      color: isActive ? 'primary.main' : 'rgba(255,255,255,0.7)',
                      fontSize: '0.9rem',
                    }}
                  />
                  {isActive && (
                    <Box sx={{
                      width: 4, height: 4, borderRadius: '50%',
                      bgcolor: 'primary.main',
                    }} />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* 하단 설정 */}
      <Box sx={{ p: 1.5 }}>
        <ListItemButton
          sx={{
            borderRadius: 2, px: 1.5,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <SettingsIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.3)' }} />
          </ListItemIcon>
          <ListItemText
            primary="Settings"
            primaryTypographyProps={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}
          />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}

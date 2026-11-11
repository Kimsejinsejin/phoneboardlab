import React from 'react';
import { Box, Toolbar, CssBaseline, Container, Grid, Paper, Typography } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import DeviceGrid from './DeviceGrid';

export default function Dashboard() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, pt: 10, width: { sm: `calc(100% - 280px)` } }}
      >
        <Container maxWidth="xl">
          {/* Top Metrics Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 3, borderTop: '4px solid', borderColor: 'primary.main' }}>
                <Typography variant="body2" color="text.secondary">Total Devices</Typography>
                <Typography variant="h3" fontWeight="bold">100</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 3, borderTop: '4px solid', borderColor: 'success.main' }}>
                <Typography variant="body2" color="text.secondary">Active Tasks</Typography>
                <Typography variant="h3" fontWeight="bold" color="success.main">34</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 3, borderTop: '4px solid', borderColor: 'warning.main' }}>
                <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
                <Typography variant="h3" fontWeight="bold" color="warning.main">92%</Typography>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Main Grid */}
          <DeviceGrid />
        </Container>
      </Box>
    </Box>
  );
}

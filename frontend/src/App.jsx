import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline, Container } from '@mui/material';
import theme from './theme/theme';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DeviceGrid from './components/DeviceGrid';
import CampaignsPage from './pages/CampaignsPage';

const DRAWER_WIDTH = 240;

function Layout({ children }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: 10,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
    </Box>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, active: 0 });
  return (
    <>
      {/* 상단 통계 카드 */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Devices', value: stats.total, color: 'primary.main' },
          { label: 'Online',        value: stats.active, color: 'success.main' },
          { label: 'Offline',       value: stats.total - stats.active, color: 'error.main' },
        ].map(({ label, value, color }) => (
          <Box
            key={label}
            sx={{
              flex: '1 1 160px',
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderTop: '4px solid',
              borderTopColor: color,
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ color: 'text.secondary', fontSize: '0.8rem', mb: 0.5 }}>{label}</Box>
            <Box sx={{ fontSize: '2.2rem', fontWeight: 800, color }}>{value}</Box>
          </Box>
        ))}
      </Box>
      <DeviceGrid onStatsChange={setStats} />
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

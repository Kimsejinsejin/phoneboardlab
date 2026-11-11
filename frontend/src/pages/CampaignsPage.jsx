import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Button, Grid, Chip,
  ToggleButtonGroup, ToggleButton, CircularProgress,
  Alert, Fab, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import CampaignCard from '../components/CampaignCard';
import CampaignCreateModal from '../components/CampaignCreateModal';

const STATUS_FILTERS = [
  { value: 'all',       label: '전체' },
  { value: 'scheduled', label: '예약중' },
  { value: 'running',   label: '실행중' },
  { value: 'completed', label: '완료' },
  { value: 'failed',    label: '실패' },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      if (data.campaigns) setCampaigns(data.campaigns);
    } catch (e) {
      setError('캠페인 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 10000);
    return () => clearInterval(interval);
  }, [fetchCampaigns]);

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const filtered = statusFilter === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === statusFilter);

  // 상태별 카운트
  const counts = {
    all: campaigns.length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    running:   campaigns.filter(c => c.status === 'running').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    failed:    campaigns.filter(c => c.status === 'failed').length,
  };

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} mb={0.5}>
            📋 Campaigns
          </Typography>
          <Typography variant="body2" color="text.secondary">
            SNS 자동 게시 캠페인을 관리합니다
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="새로고침">
            <Button
              variant="outlined"
              onClick={fetchCampaigns}
              sx={{ minWidth: 44, px: 1.5, borderRadius: 2 }}
            >
              <RefreshIcon />
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setModalOpen(true)}
            sx={{
              background: 'linear-gradient(45deg, #1a73e8 30%, #aa3bff 90%)',
              boxShadow: '0 4px 12px rgba(26,115,232,0.35)',
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            새 캠페인
          </Button>
        </Box>
      </Box>

      {/* 통계 요약 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: '전체', value: counts.all, color: '#1a73e8' },
          { label: '실행 중', value: counts.running, color: '#f59e0b' },
          { label: '완료', value: counts.completed, color: '#10b981' },
          { label: '실패', value: counts.failed, color: '#ef4444' },
        ].map(({ label, value, color }) => (
          <Grid item xs={6} sm={3} key={label}>
            <Box sx={{
              p: 2, borderRadius: 3,
              border: '1px solid', borderColor: 'divider',
              background: 'rgba(255,255,255,0.02)',
              borderTop: `3px solid ${color}`,
            }}>
              <Typography variant="h4" fontWeight={800} sx={{ color }}>
                {value}
              </Typography>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* 필터 탭 */}
      <ToggleButtonGroup
        value={statusFilter}
        exclusive
        onChange={(_, v) => v && setStatusFilter(v)}
        size="small"
        sx={{ mb: 3, flexWrap: 'wrap', gap: 0.5 }}
      >
        {STATUS_FILTERS.map(({ value, label }) => (
          <ToggleButton
            key={value}
            value={value}
            sx={{
              borderRadius: '20px !important',
              px: 2,
              border: '1px solid rgba(255,255,255,0.12) !important',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              },
            }}
          >
            {label}
            {counts[value] > 0 && (
              <Chip
                label={counts[value]}
                size="small"
                sx={{ ml: 0.8, height: 18, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.15)', color: 'inherit' }}
              />
            )}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* 에러 */}
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {/* 로딩 */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center', py: 12,
            border: '2px dashed', borderColor: 'divider',
            borderRadius: 4,
          }}
        >
          <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>📭</Typography>
          <Typography variant="h6" color="text.secondary" mb={1}>
            {statusFilter === 'all' ? '등록된 캠페인이 없습니다' : `${STATUS_FILTERS.find(f=>f.value===statusFilter)?.label} 캠페인이 없습니다`}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setModalOpen(true)}
            sx={{ mt: 2, background: 'linear-gradient(45deg, #1a73e8, #aa3bff)' }}
          >
            첫 캠페인 만들기
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtered.map(campaign => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={campaign.id}>
              <CampaignCard campaign={campaign} onDelete={handleDelete} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* 캠페인 생성 모달 */}
      <CampaignCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setModalOpen(false);
          fetchCampaigns();
        }}
      />
    </Box>
  );
}

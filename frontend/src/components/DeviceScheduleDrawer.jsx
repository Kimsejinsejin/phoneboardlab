import React, { useState, useEffect, useCallback } from 'react';
import {
  Drawer, Box, Typography, IconButton, Chip, Divider,
  CircularProgress, Tooltip, Avatar, List, ListItem,
  LinearProgress, Badge
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PendingIcon from '@mui/icons-material/Pending';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RefreshIcon from '@mui/icons-material/Refresh';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');

// ─── 플랫폼 색상 맵 ────────────────────────────────────────────
const PLATFORM_META = {
  youtube:   { label: 'YouTube Shorts', color: '#FF0000', bg: 'rgba(255,0,0,0.12)' },
  instagram: { label: 'Instagram',      color: '#E1306C', bg: 'rgba(225,48,108,0.12)' },
  threads:   { label: 'Threads',        color: '#fff',    bg: 'rgba(255,255,255,0.08)' },
  tiktok:    { label: 'TikTok',         color: '#69C9D0', bg: 'rgba(105,201,208,0.12)' },
  facebook:  { label: 'Facebook',       color: '#1877F2', bg: 'rgba(24,119,242,0.12)' },
  twitter_x: { label: 'X (Twitter)',    color: '#fff',    bg: 'rgba(255,255,255,0.08)' },
  linkedin:  { label: 'LinkedIn',       color: '#0A66C2', bg: 'rgba(10,102,194,0.12)' },
};

// ─── 상태 뱃지 ────────────────────────────────────────────────
function StatusBadge({ status, deviceResult }) {
  const cfg = {
    pending:   { icon: <PendingIcon sx={{ fontSize: 14 }} />,     color: '#aaa',     label: '대기 중' },
    running:   { icon: <PlayArrowIcon sx={{ fontSize: 14 }} />,   color: '#1976d2',  label: '실행 중' },
    completed: { icon: <CheckCircleIcon sx={{ fontSize: 14 }} />, color: '#4caf50',  label: '완료' },
    failed:    { icon: <ErrorIcon sx={{ fontSize: 14 }} />,       color: '#f44336',  label: '실패' },
  };
  // 기기별 결과가 있으면 그걸 우선
  let s = status;
  if (deviceResult) s = deviceResult.ok ? 'completed' : 'failed';
  const { icon, color, label } = cfg[s] || cfg.pending;
  return (
    <Chip
      icon={icon}
      label={label}
      size="small"
      sx={{
        height: 22, fontSize: '0.68rem', fontWeight: 700,
        color, borderColor: color, border: '1px solid',
        bgcolor: `${color}18`,
        '& .MuiChip-icon': { color },
      }}
    />
  );
}

// ─── 캠페인 타임라인 아이템 ────────────────────────────────────
function CampaignItem({ campaign, isLast }) {
  const p = PLATFORM_META[campaign.platform] || { label: campaign.platform, color: '#888', bg: 'rgba(128,128,128,0.1)' };
  const isScheduled = !!campaign.scheduled_at;
  const time = isScheduled ? dayjs(campaign.scheduled_at) : dayjs(campaign.created_at);
  const isPast = time.isBefore(dayjs());
  const isRunning = campaign.status === 'running';

  return (
    <Box sx={{ display: 'flex', gap: 1.5, position: 'relative' }}>
      {/* 타임라인 선 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 32 }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: '50%',
          bgcolor: p.bg, border: `2px solid ${p.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, zIndex: 1,
        }}>
          <AccessTimeIcon sx={{ fontSize: 16, color: p.color }} />
        </Box>
        {!isLast && (
          <Box sx={{ width: 2, flex: 1, bgcolor: 'rgba(255,255,255,0.08)', my: 0.5, minHeight: 20 }} />
        )}
      </Box>

      {/* 카드 */}
      <Box sx={{
        flex: 1, mb: isLast ? 0 : 2,
        bgcolor: 'rgba(255,255,255,0.04)',
        border: '1px solid',
        borderColor: isRunning ? p.color : 'rgba(255,255,255,0.08)',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: isRunning ? `0 0 12px ${p.color}33` : 'none',
        transition: 'all 0.3s',
      }}>
        {isRunning && <LinearProgress sx={{ height: 2 }} />}
        <Box sx={{ p: 1.5 }}>
          {/* 헤더 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.8 }}>
            <Chip
              label={p.label}
              size="small"
              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700,
                bgcolor: p.bg, color: p.color, border: `1px solid ${p.color}44` }}
            />
            <StatusBadge status={campaign.status} deviceResult={campaign.device_result} />
          </Box>

          {/* 제목 */}
          <Typography variant="body2" fontWeight={700} sx={{ color: '#fff', mb: 0.3 }} noWrap>
            {campaign.title || '(제목 없음)'}
          </Typography>
          {campaign.caption && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }} noWrap>
              {campaign.caption}
            </Typography>
          )}

          {/* 시간 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <AccessTimeIcon sx={{ fontSize: 12, color: isPast ? 'rgba(255,255,255,0.35)' : '#64b5f6' }} />
            <Typography variant="caption" sx={{ color: isPast ? 'rgba(255,255,255,0.35)' : '#64b5f6', fontWeight: 600 }}>
              {isScheduled ? time.format('MM/DD HH:mm') : '즉시 실행'}
              {' '}
              <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>
                ({time.fromNow()})
              </span>
            </Typography>
          </Box>

          {/* 실패 로그 */}
          {campaign.device_result?.log && campaign.status === 'failed' && (
            <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(244,67,54,0.08)', borderRadius: 1, border: '1px solid rgba(244,67,54,0.2)' }}>
              <Typography variant="caption" sx={{ color: '#ef9a9a', fontFamily: 'monospace', fontSize: '0.62rem' }}>
                {campaign.device_result.log.slice(-2).join('\n')}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────
export default function DeviceScheduleDrawer({ open, device, onClose }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    if (!device?.serial) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/devices/${device.serial}/campaigns`);
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (e) {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [device?.serial]);

  useEffect(() => {
    if (open) fetchCampaigns();
  }, [open, fetchCampaigns]);

  // 상태별 분류
  const pending   = campaigns.filter(c => c.status === 'pending');
  const running   = campaigns.filter(c => c.status === 'running');
  const completed = campaigns.filter(c => c.status === 'completed');
  const failed    = campaigns.filter(c => c.status === 'failed');

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 380,
          background: 'linear-gradient(160deg, #0f0f1a 0%, #111827 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
        }
      }}
    >
      {/* 헤더 */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(26,115,232,0.15)', border: '1.5px solid #1a73e8', width: 40, height: 40 }}>
              <SmartphoneIcon sx={{ color: '#1a73e8', fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#fff', lineHeight: 1.2 }}>
                {device?.nickname || device?.serial || '기기'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>
                {device?.serial}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="새로고침">
              <IconButton onClick={fetchCampaigns} size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* 통계 뱃지 */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {[
            { label: '전체', count: campaigns.length, color: '#888' },
            { label: '대기', count: pending.length,   color: '#aaa' },
            { label: '실행중', count: running.length,  color: '#1976d2' },
            { label: '완료', count: completed.length,  color: '#4caf50' },
            { label: '실패', count: failed.length,     color: '#f44336' },
          ].map(({ label, count, color }) => (
            <Chip
              key={label}
              label={`${label} ${count}`}
              size="small"
              sx={{
                height: 22, fontSize: '0.68rem', fontWeight: 700,
                color, bgcolor: `${color}18`, border: `1px solid ${color}44`,
              }}
            />
          ))}
        </Box>
      </Box>

      {/* 본문 */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : campaigns.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CalendarMonthIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.15)', mb: 2 }} />
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
              등록된 캠페인이 없습니다
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.25)', mt: 0.5 }}>
              새 캠페인을 만들고 이 기기를 선택해보세요
            </Typography>
          </Box>
        ) : (
          <>
            {/* 실행 중 */}
            {running.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" fontWeight={700}
                  sx={{ color: '#1976d2', textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1.5 }}>
                  🔵 실행 중
                </Typography>
                {running.map((c, i) => (
                  <CampaignItem key={c.id} campaign={c} isLast={i === running.length - 1} />
                ))}
              </Box>
            )}

            {/* 예정 */}
            {pending.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" fontWeight={700}
                  sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1.5 }}>
                  ⏳ 예정
                </Typography>
                {pending.map((c, i) => (
                  <CampaignItem key={c.id} campaign={c} isLast={i === pending.length - 1} />
                ))}
              </Box>
            )}

            {/* 완료 */}
            {completed.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" fontWeight={700}
                  sx={{ color: '#4caf50', textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1.5 }}>
                  ✅ 완료
                </Typography>
                {completed.map((c, i) => (
                  <CampaignItem key={c.id} campaign={c} isLast={i === completed.length - 1} />
                ))}
              </Box>
            )}

            {/* 실패 */}
            {failed.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" fontWeight={700}
                  sx={{ color: '#f44336', textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1.5 }}>
                  ❌ 실패
                </Typography>
                {failed.map((c, i) => (
                  <CampaignItem key={c.id} campaign={c} isLast={i === failed.length - 1} />
                ))}
              </Box>
            )}
          </>
        )}
      </Box>
    </Drawer>
  );
}

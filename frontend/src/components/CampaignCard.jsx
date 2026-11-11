import React from 'react';
import {
  Card, CardContent, Box, Typography, Chip, Avatar, LinearProgress,
  IconButton, Tooltip
} from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');

const PLATFORM_META = {
  youtube:   { label: 'YouTube Shorts', color: '#FF0000', bg: 'rgba(255,0,0,0.1)',    Icon: YouTubeIcon },
  instagram: { label: 'Instagram',       color: '#E1306C', bg: 'rgba(225,48,108,0.1)', Icon: InstagramIcon },
  threads:   { label: 'Threads',         color: '#ffffff', bg: 'rgba(255,255,255,0.1)',Icon: null },
  tiktok:    { label: 'TikTok',          color: '#69C9D0', bg: 'rgba(105,201,208,0.1)',Icon: null },
};

const STATUS_META = {
  scheduled: { label: '예약중',  color: 'info',    Icon: HourglassEmptyIcon },
  running:   { label: '실행중',  color: 'warning', Icon: PlayCircleIcon },
  completed: { label: '완료',    color: 'success', Icon: CheckCircleIcon },
  failed:    { label: '실패',    color: 'error',   Icon: ErrorIcon },
};

function ThreadsLogo({ size = 20, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 192 192" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M141.537 88.988c-1.178-.572-2.376-1.115-3.593-1.625-2.107-19.485-13.931-30.672-31.573-30.786-10.673-.07-19.82 4.307-25.383 12.044l12.13 8.337c3.916-5.603 10.034-6.8 13.304-6.8.055 0 .11 0 .163.002 5.136.079 9.012 1.534 11.52 4.32 1.82 2.04 3.038 4.87 3.635 8.433a61.91 61.91 0 0 0-9.184-.355c-17.976.736-29.543 10.027-28.77 22.703.395 6.445 3.725 12.001 9.37 15.64 4.806 3.09 10.996 4.597 17.44 4.264 8.491-.444 15.156-3.81 19.812-10.004 3.634-4.848 5.917-11.12 6.857-18.9 4.107 2.48 7.146 5.74 8.774 9.684 2.746 6.623 2.907 17.517-3.97 24.394-5.94 5.94-14.685 8.507-27.12 8.597-13.638-.098-23.955-4.486-30.656-13.045-6.295-8.038-9.546-19.668-9.658-34.57.112-14.903 3.363-26.532 9.658-34.57C84.995 61.486 95.312 57.098 108.95 57c13.647.098 24.181 4.511 31.285 13.109 3.572 4.34 6.25 9.74 8.02 16.052l14.213-3.846c-2.19-8.156-5.793-15.218-10.788-21.08C142.716 49.933 127.54 43.01 108.99 42.9h-.08c-18.51.11-33.49 7.06-44.518 20.65-9.935 12.37-15.085 29.786-15.229 51.795.144 22.01 5.294 39.426 15.229 51.795 11.028 13.59 26.008 20.54 44.519 20.65h.08c15.763-.094 26.892-4.27 35.837-13.415 11.57-11.773 11.22-26.67 7.444-35.795-2.741-6.61-7.93-11.965-15.735-15.592Z"/>
    </svg>
  );
}

function TikTokLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#69C9D0" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.53V6.78a4.85 4.85 0 0 1-1.01-.09Z"/>
    </svg>
  );
}

export default function CampaignCard({ campaign, onDelete }) {
  const platform = PLATFORM_META[campaign.platform] || PLATFORM_META.youtube;
  const statusMeta = STATUS_META[campaign.status] || STATUS_META.scheduled;
  const { Icon: PlatformIcon } = platform;
  const { Icon: StatusIcon } = statusMeta;

  const scheduledTime = dayjs(campaign.scheduled_at);
  const isUpcoming = scheduledTime.isAfter(dayjs());

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${platform.bg}`,
          borderColor: platform.color + '44',
        },
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* 플랫폼 색상 상단 바 */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        borderRadius: '12px 12px 0 0',
        background: `linear-gradient(90deg, ${platform.color} 0%, ${platform.color}88 100%)`,
      }} />

      <CardContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          {/* 플랫폼 + 제목 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: platform.bg, width: 40, height: 40 }}>
              {PlatformIcon ? (
                <PlatformIcon sx={{ color: platform.color, fontSize: 22 }} />
              ) : campaign.platform === 'threads' ? (
                <ThreadsLogo size={20} color={platform.color} />
              ) : (
                <TikTokLogo size={20} />
              )}
            </Avatar>
            <Box>
              <Typography variant="caption" sx={{ color: platform.color, fontWeight: 600, fontSize: '0.7rem' }}>
                {platform.label}
              </Typography>
              <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ maxWidth: 180 }}>
                {campaign.title || '제목 없음'}
              </Typography>
            </Box>
          </Box>

          {/* 상태 칩 + 삭제 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              icon={<StatusIcon sx={{ fontSize: '14px !important' }} />}
              label={statusMeta.label}
              size="small"
              color={statusMeta.color}
              sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
            />
            {onDelete && (
              <Tooltip title="삭제">
                <IconButton size="small" onClick={() => onDelete(campaign.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* 캡션 미리보기 */}
        {campaign.caption && (
          <Typography variant="body2" color="text.secondary" sx={{
            mb: 2, fontSize: '0.8rem', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {campaign.caption}
          </Typography>
        )}

        {/* 메타 정보 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <SmartphoneIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption">{campaign.device_count ?? campaign.serials?.length ?? 0}대</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <AccessTimeIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption">
              {isUpcoming ? scheduledTime.fromNow() : scheduledTime.format('MM/DD HH:mm')}
            </Typography>
          </Box>
        </Box>

        {/* 실행 중일 때 진행바 */}
        {campaign.status === 'running' && (
          <LinearProgress
            sx={{
              mt: 1.5, height: 4, borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.08)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                background: `linear-gradient(90deg, ${platform.color} 0%, ${platform.color}88 100%)`,
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

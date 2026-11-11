import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, LinearProgress, IconButton, Checkbox, Tooltip } from '@mui/material';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function DeviceCard({ device, onClick, selected, onSelect, onSchedule }) {
  const [frame, setFrame] = useState(null);

  useEffect(() => {
    if (device.status !== 'active') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/stream/${device.id}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'frame' && data.data) {
          setFrame(`data:image/jpeg;base64,${data.data}`);
        }
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    return () => { ws.close(); };
  }, [device.id, device.status]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':  return 'success';
      case 'idle':    return 'warning';
      case 'offline': return 'error';
      default:        return 'default';
    }
  };

  const handleCardClick = (e) => {
    // 체크박스/버튼 영역 클릭은 원격 제어 모달 열지 않음
    if (e.target.closest('[data-checkbox]')) return;
    if (e.target.closest('[data-schedule]')) return;
    onClick(device);
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onSelect(device.id);
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: '1.5px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        boxShadow: selected ? '0 0 0 2px rgba(26,115,232,0.3)' : 'none',
        '&:hover .overlay': { opacity: 1 },
        '&:hover': { transform: 'translateY(-2px)', boxShadow: selected ? '0 4px 16px rgba(26,115,232,0.4)' : '0 4px 12px rgba(0,0,0,0.3)' },
      }}
    >
      {/* 체크박스 (우상단) */}
      <Box
        data-checkbox="true"
        onClick={handleCheckboxClick}
        sx={{
          position: 'absolute', top: 6, left: 6, zIndex: 3,
          bgcolor: 'rgba(0,0,0,0.5)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 30, height: 30,
          transition: 'opacity 0.2s',
          opacity: selected ? 1 : 0,
          '.MuiCard-root:hover &': { opacity: 1 },
        }}
      >
        <Checkbox
          checked={!!selected}
          size="small"
          sx={{
            p: 0,
            color: 'rgba(255,255,255,0.7)',
            '&.Mui-checked': { color: 'primary.main' },
          }}
        />
      </Box>

      {/* 상단 우측 버튼 그룹 */}
      <Box sx={{ position: 'absolute', top: 6, right: 6, zIndex: 3, display: 'flex', gap: 0.5 }}>
        {/* 스케줄 버튼 */}
        <Tooltip title="캠페인 스케줄 보기">
          <IconButton
            data-schedule="true"
            size="small"
            onClick={(e) => { e.stopPropagation(); onSchedule?.(device); }}
            sx={{
              color: 'white', bgcolor: 'rgba(0,0,0,0.4)',
              '&:hover': { bgcolor: 'rgba(100,181,246,0.7)' },
              width: 28, height: 28,
            }}
          >
            <CalendarMonthIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        {/* 원격 제어 버튼 */}
        <Tooltip title="원격 제어">
          <IconButton
            size="small"
            sx={{
              color: 'white', bgcolor: 'rgba(0,0,0,0.4)',
              '&:hover': { bgcolor: 'rgba(26,115,232,0.7)' },
              width: 28, height: 28,
            }}
          >
            <OpenInFullIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Screen Mirroring */}
      <Box sx={{ width: '100%', height: 160, bgcolor: '#000', position: 'relative' }}>
        {frame ? (
          <img src={frame} alt="Device Screen" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" color="text.secondary">Waiting for screen data...</Typography>
          </Box>
        )}
        <Box
          className="overlay"
          sx={{
            position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.2s', zIndex: 1
          }}
        >
          <Typography variant="button" sx={{ color: 'white', fontWeight: 'bold' }}>Remote Control</Typography>
        </Box>
        {/* 선택 시 오버레이 */}
        {selected && (
          <Box sx={{
            position: 'absolute', inset: 0, zIndex: 2,
            border: '3px solid',
            borderColor: 'primary.main',
            borderRadius: 0,
            pointerEvents: 'none',
          }} />
        )}
      </Box>

      <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{
            p: 1, borderRadius: 2,
            bgcolor: device.status === 'active' ? 'primary.light' : 'background.default',
            color: device.status === 'active' ? 'primary.main' : 'text.secondary',
            mr: 1.5
          }}>
            <SmartphoneIcon />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="600" lineHeight={1.2}>
              {device.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {device.id}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Chip
            label={device.status.toUpperCase()}
            size="small"
            color={getStatusColor(device.status)}
            sx={{ fontWeight: 600, fontSize: '0.7rem', height: 20 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <BatteryChargingFullIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" fontWeight="500">{device.battery}%</Typography>
          </Box>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Current Task</Typography>
            <Typography variant="caption" fontWeight="500">{device.progress}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={device.progress}
            sx={{
              height: 6, borderRadius: 3, bgcolor: 'background.default',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                backgroundImage: device.status === 'active'
                  ? 'linear-gradient(90deg, #1a73e8 0%, #aa3bff 100%)'
                  : 'none',
                bgcolor: device.status !== 'active' ? 'text.secondary' : 'transparent'
              }
            }}
          />
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.primary', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {device.currentTask || 'No active task'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

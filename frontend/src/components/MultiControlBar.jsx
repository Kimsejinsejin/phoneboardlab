import React, { useState } from 'react';
import {
  Box, Paper, Typography, IconButton, Tooltip, TextField,
  Button, Chip, Divider, Slide
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppsIcon from '@mui/icons-material/Apps';
import LockIcon from '@mui/icons-material/Lock';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DeselectIcon from '@mui/icons-material/Deselect';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

export default function MultiControlBar({ selectedIds, allDevices, onSelectAll, onDeselectAll, onClear }) {
  const [textInput, setTextInput] = useState('');
  const [sending, setSending] = useState(false);

  const sendBulkCommand = async (action, extra = {}) => {
    setSending(true);
    try {
      await Promise.all(
        selectedIds.map(serial =>
          fetch('/api/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serial, action, ...extra }),
          })
        )
      );
    } catch (e) {
      console.error('Bulk command error', e);
    } finally {
      setSending(false);
    }
  };

  const sendBulkText = async () => {
    if (!textInput.trim()) return;
    await sendBulkCommand('TEXT', { text: textInput });
    setTextInput('');
  };

  const controlButtons = [
    { title: '홈', icon: <HomeIcon />, cmd: 'input keyevent 3' },
    { title: '뒤로', icon: <ArrowBackIcon />, cmd: 'input keyevent 4' },
    { title: '최근 앱', icon: <AppsIcon />, cmd: 'input keyevent 187' },
    { title: '화면 잠금', icon: <LockIcon />, cmd: 'input keyevent 26' },
  ];

  return (
    <Slide direction="up" in={selectedIds.length > 0} mountOnEnter unmountOnExit>
      <Paper
        elevation={12}
        sx={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1300,
          borderRadius: 4,
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid rgba(26,115,232,0.4)',
          boxShadow: '0 8px 32px rgba(26,115,232,0.3)',
          minWidth: 680,
          flexWrap: 'wrap',
        }}
      >
        {/* 선택 기기 수 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`${selectedIds.length}대 선택`}
            size="small"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          />
        </Box>

        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

        {/* ADB 빠른 명령 */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {controlButtons.map(({ title, icon, cmd }) => (
            <Tooltip key={title} title={title}>
              <IconButton
                size="small"
                disabled={sending}
                onClick={() => sendBulkCommand('ADB_SHELL', { cmd })}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  '&:hover': { bgcolor: 'rgba(26,115,232,0.3)', borderColor: 'primary.main' },
                  transition: 'all 0.2s',
                }}
              >
                {icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>

        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

        {/* 텍스트 일괄 입력 */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <KeyboardIcon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }} />
          <TextField
            size="small"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendBulkText()}
            placeholder="일괄 텍스트 입력..."
            disabled={sending}
            InputProps={{
              sx: {
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.06)',
                borderRadius: 2,
                fontSize: '0.85rem',
              }
            }}
            sx={{
              width: 180,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(26,115,232,0.6)' },
            }}
          />
          <Tooltip title="일괄 전송">
            <IconButton
              size="small"
              onClick={sendBulkText}
              disabled={!textInput.trim() || sending}
              sx={{
                bgcolor: '#1a73e8',
                color: 'white',
                '&:hover': { bgcolor: '#1557b0' },
                '&:disabled': { opacity: 0.4 },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

        {/* 전체 선택/해제 */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="전체 선택">
            <IconButton
              size="small"
              onClick={onSelectAll}
              sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}
            >
              <SelectAllIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="선택 해제">
            <IconButton
              size="small"
              onClick={onDeselectAll}
              sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}
            >
              <DeselectIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="닫기">
            <IconButton
              size="small"
              onClick={onClear}
              sx={{ color: 'rgba(255,100,100,0.7)', '&:hover': { color: '#ff6b6b' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    </Slide>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stepper, Step, StepLabel,
  Box, Typography, Button, IconButton,
  Grid, Card, CardActionArea, TextField,
  Chip, Avatar, CircularProgress, Alert,
  FormControlLabel, Radio, RadioGroup,
  Checkbox, InputAdornment, Tooltip
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CloseIcon from '@mui/icons-material/Close';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import TagIcon from '@mui/icons-material/Tag';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

const STEPS = ['플랫폼 선택', '기기 선택', '콘텐츠', '예약 시간', '확인 및 등록'];

const PLATFORMS = [
  { id: 'youtube',   label: 'YouTube Shorts', color: '#FF0000', bg: 'rgba(255,0,0,0.08)',    Icon: YouTubeIcon,   desc: '동영상 업로드' },
  { id: 'instagram', label: 'Instagram',       color: '#E1306C', bg: 'rgba(225,48,108,0.08)', Icon: InstagramIcon, desc: '사진/영상 게시' },
  { id: 'threads',   label: 'Threads',         color: '#fff',    bg: 'rgba(255,255,255,0.06)',Icon: null,          desc: '텍스트/미디어 게시', logoType: 'threads' },
  { id: 'tiktok',    label: 'TikTok',          color: '#69C9D0', bg: 'rgba(105,201,208,0.08)',Icon: null,          desc: '동영상 업로드', logoType: 'tiktok' },
  { id: 'facebook',  label: 'Facebook',        color: '#1877F2', bg: 'rgba(24,119,242,0.08)', Icon: null,          desc: '게시물/릴스', logoType: 'facebook' },
  { id: 'twitter_x', label: 'X (Twitter)',     color: '#ffffff', bg: 'rgba(255,255,255,0.06)',Icon: null,          desc: '트윗 게시', logoType: 'x' },
  { id: 'linkedin',  label: 'LinkedIn',        color: '#0A66C2', bg: 'rgba(10,102,194,0.08)', Icon: null,          desc: '비즈니스 게시물', logoType: 'linkedin' },
];

function ThreadsLogo({ size = 28, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 192 192" fill={color}>
      <path d="M141.537 88.988c-1.178-.572-2.376-1.115-3.593-1.625-2.107-19.485-13.931-30.672-31.573-30.786-10.673-.07-19.82 4.307-25.383 12.044l12.13 8.337c3.916-5.603 10.034-6.8 13.304-6.8.055 0 .11 0 .163.002 5.136.079 9.012 1.534 11.52 4.32 1.82 2.04 3.038 4.87 3.635 8.433a61.91 61.91 0 0 0-9.184-.355c-17.976.736-29.543 10.027-28.77 22.703.395 6.445 3.725 12.001 9.37 15.64 4.806 3.09 10.996 4.597 17.44 4.264 8.491-.444 15.156-3.81 19.812-10.004 3.634-4.848 5.917-11.12 6.857-18.9 4.107 2.48 7.146 5.74 8.774 9.684 2.746 6.623 2.907 17.517-3.97 24.394-5.94 5.94-14.685 8.507-27.12 8.597-13.638-.098-23.955-4.486-30.656-13.045-6.295-8.038-9.546-19.668-9.658-34.57.112-14.903 3.363-26.532 9.658-34.57C84.995 61.486 95.312 57.098 108.95 57c13.647.098 24.181 4.511 31.285 13.109 3.572 4.34 6.25 9.74 8.02 16.052l14.213-3.846c-2.19-8.156-5.793-15.218-10.788-21.08C142.716 49.933 127.54 43.01 108.99 42.9h-.08c-18.51.11-33.49 7.06-44.518 20.65-9.935 12.37-15.085 29.786-15.229 51.795.144 22.01 5.294 39.426 15.229 51.795 11.028 13.59 26.008 20.54 44.519 20.65h.08c15.763-.094 26.892-4.27 35.837-13.415 11.57-11.773 11.22-26.67 7.444-35.795-2.741-6.61-7.93-11.965-15.735-15.592Z"/>
    </svg>
  );
}

function TikTokLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#69C9D0">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.53V6.78a4.85 4.85 0 0 1-1.01-.09Z"/>
    </svg>
  );
}

function FacebookLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.49 0-1.956.93-1.956 1.883v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z"/>
    </svg>
  );
}

function XLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117Z"/>
    </svg>
  );
}

function LinkedInLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function PlatformLogo({ platform, size = 34 }) {
  if (platform.Icon) return <platform.Icon sx={{ color: platform.color, fontSize: size }} />;
  switch (platform.logoType) {
    case 'threads':  return <ThreadsLogo size={size} color={platform.color} />;
    case 'tiktok':   return <TikTokLogo size={size} />;
    case 'facebook': return <FacebookLogo size={size} />;
    case 'x':        return <XLogo size={size} />;
    case 'linkedin': return <LinkedInLogo size={size} />;
    default:         return null;
  }
}

// ── Step 0: 플랫폼 선택 ──────────────────────────────────────
function StepPlatform({ value, onChange }) {
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} mb={1} sx={{ color: '#fff' }}>어떤 플랫폼에 게시할까요?</Typography>
      <Typography variant="body1" mb={3} sx={{ color: 'rgba(255,255,255,0.75)' }}>게시할 SNS 플랫폼을 선택하세요.</Typography>
      <Grid container spacing={2}>
        {PLATFORMS.map((p) => (
          <Grid item xs={6} sm={4} key={p.id}>
            <Card
              onClick={() => onChange(p.id)}
              sx={{
                border: '2px solid',
                borderColor: value === p.id ? p.color : 'rgba(255,255,255,0.12)',
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: value === p.id ? p.bg : 'rgba(255,255,255,0.04)',
                boxShadow: value === p.id ? `0 0 24px ${p.color}44` : 'none',
                '&:hover': { borderColor: p.color, background: p.bg },
              }}
            >
              <CardActionArea sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: p.bg, width: 52, height: 52 }}>
                  <PlatformLogo platform={p} size={30} />
                </Avatar>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: value === p.id ? p.color : '#fff' }}>
                    {p.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{p.desc}</Typography>
                </Box>
                {value === p.id && <CheckCircleIcon sx={{ color: p.color, fontSize: 18 }} />}
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// ── Step 1: 기기 선택 ────────────────────────────────────────
function StepDevices({ selected, onChange }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/devices')
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') setDevices(data.devices);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = devices.filter(d =>
    (d.nickname || d.serial).toLowerCase().includes(search.toLowerCase()) ||
    d.serial.toLowerCase().includes(search.toLowerCase())
  );

  const toggleDevice = (serial) => {
    onChange(prev =>
      prev.includes(serial) ? prev.filter(s => s !== serial) : [...prev, serial]
    );
  };

  const toggleAll = () => {
    if (selected.length === filtered.length) onChange([]);
    else onChange(filtered.map(d => d.serial));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" fontWeight={800} sx={{ color: '#fff' }}>기기를 선택하세요</Typography>
        <Chip
          label={`${selected.length}대 선택`}
          size="small"
          color={selected.length > 0 ? 'primary' : 'default'}
          sx={{ fontWeight: 700 }}
        />
      </Box>
      <TextField
        fullWidth size="small" placeholder="기기 검색..." value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        sx={{ mb: 1.5 }}
      />
      <Button size="small" onClick={toggleAll} sx={{ mb: 1.5 }}>
        {selected.length === filtered.length ? '전체 해제' : '전체 선택'}
      </Button>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <Box sx={{ maxHeight: 280, overflowY: 'auto', pr: 0.5 }}>
          <Grid container spacing={1}>
            {filtered.map(d => {
              const isSelected = selected.includes(d.serial);
              const isActive = d.state === 'device';
              return (
                <Grid item xs={6} key={d.serial}>
                  <Card
                    onClick={() => toggleDevice(d.serial)}
                    sx={{
                      border: '1.5px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      cursor: 'pointer',
                      bgcolor: isSelected ? 'rgba(26,115,232,0.08)' : 'transparent',
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: 'primary.light' },
                      opacity: isActive ? 1 : 0.5,
                    }}
                  >
                    <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Checkbox checked={isSelected} size="small" sx={{ p: 0 }} />
                      <SmartphoneIcon sx={{ fontSize: 16, color: isActive ? 'success.main' : 'text.disabled' }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700} noWrap sx={{ color: '#fff' }}>
                          {d.nickname || 'Phone'}
                        </Typography>
                        <Typography variant="caption" display="block" noWrap sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          {d.serial}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
            {filtered.length === 0 && (
              <Grid item xs={12}>
                <Typography textAlign="center" py={3} variant="body1" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  연결된 기기가 없습니다.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
    </Box>
  );
}

// ── Step 2: 콘텐츠 입력 ─────────────────────────────────────
function StepContent({ platform, form, setForm }) {
  const p = PLATFORMS.find(p => p.id === platform) || PLATFORMS[0];
  const needsMedia = platform !== 'threads';

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setForm(f => ({ ...f, media: file, mediaName: file.name }));
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} mb={1} sx={{ color: '#fff' }}>콘텐츠를 입력하세요</Typography>
      <Typography variant="body1" mb={3} sx={{ color: 'rgba(255,255,255,0.75)' }}>
        <span style={{ color: p.color, fontWeight: 700 }}>{p.label}</span>에 게시할 내용을 작성해주세요.
      </Typography>

      <TextField
        fullWidth label="제목" value={form.title}
        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        sx={{ mb: 2,
          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
          '& .MuiInputBase-input': { color: '#fff' },
          '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.4)' },
        }} size="small"
        inputProps={{ maxLength: 100 }}
        helperText={`${form.title.length}/100`}
      />

      <TextField
        fullWidth multiline rows={3} label="캡션 / 설명"
        value={form.caption}
        onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
        sx={{ mb: 2,
          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
          '& .MuiInputBase-input': { color: '#fff' },
        }} size="small"
      />

      <TextField
        fullWidth label="해시태그" value={form.hashtags}
        onChange={e => setForm(f => ({ ...f, hashtags: e.target.value }))}
        placeholder="#여행 #일상 #브이로그"
        sx={{ mb: 2,
          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
          '& .MuiInputBase-input': { color: '#fff' },
          '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.4)' },
          '& input::placeholder': { color: 'rgba(255,255,255,0.3)' },
        }} size="small"
        InputProps={{
          startAdornment: <InputAdornment position="start"><TagIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.5)' }} /></InputAdornment>
        }}
        helperText="스페이스로 구분"
      />

      {needsMedia && (
        <Box
          sx={{
            border: '2px dashed',
            borderColor: form.media ? p.color : 'rgba(255,255,255,0.2)',
            borderRadius: 3,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            bgcolor: form.media ? p.bg : 'rgba(255,255,255,0.03)',
            '&:hover': { borderColor: p.color, bgcolor: 'rgba(255,255,255,0.06)' },
          }}
          onClick={() => document.getElementById('media-upload').click()}
        >
          <input id="media-upload" type="file" hidden accept="video/*,image/*" onChange={handleFileChange} />
          <CloudUploadIcon sx={{ fontSize: 44, color: form.media ? p.color : 'rgba(255,255,255,0.4)', mb: 1 }} />
          <Typography variant="body1" fontWeight={600} sx={{ color: '#fff' }}>
            {form.media ? form.mediaName : '미디어 파일 업로드'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
            {form.media ? '클릭하여 변경' : 'MP4, MOV, JPG, PNG 지원'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ── Step 3: 예약 시간 ───────────────────────────────────────
function StepSchedule({ scheduleType, setScheduleType, scheduledAt, setScheduledAt }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <Box>
        <Typography variant="h5" fontWeight={800} mb={1} sx={{ color: '#fff' }}>실행 시간을 설정하세요</Typography>
        <Typography variant="body1" mb={3} sx={{ color: 'rgba(255,255,255,0.75)' }}>즉시 실행하거나 특정 시간에 예약할 수 있습니다.</Typography>

        <RadioGroup value={scheduleType} onChange={e => setScheduleType(e.target.value)}>
          <Card
            onClick={() => setScheduleType('now')}
            sx={{
              mb: 2, p: 2, border: '2px solid', borderRadius: 3, cursor: 'pointer',
              borderColor: scheduleType === 'now' ? 'primary.main' : 'rgba(255,255,255,0.12)',
              bgcolor: scheduleType === 'now' ? 'rgba(26,115,232,0.1)' : 'rgba(255,255,255,0.03)',
              transition: 'all 0.2s',
            }}
          >
            <FormControlLabel
              value="now"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>즉시 실행</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>지금 바로 자동화를 시작합니다.</Typography>
                </Box>
              }
              sx={{ m: 0, width: '100%' }}
            />
          </Card>

          <Card
            onClick={() => setScheduleType('scheduled')}
            sx={{
              p: 2, border: '2px solid', borderRadius: 3, cursor: 'pointer',
              borderColor: scheduleType === 'scheduled' ? 'primary.main' : 'rgba(255,255,255,0.12)',
              bgcolor: scheduleType === 'scheduled' ? 'rgba(26,115,232,0.1)' : 'rgba(255,255,255,0.03)',
              transition: 'all 0.2s',
            }}
          >
            <FormControlLabel
              value="scheduled"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>예약 실행</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>특정 날짜와 시간에 자동 실행됩니다.</Typography>
                </Box>
              }
              sx={{ m: 0, width: '100%', mb: scheduleType === 'scheduled' ? 2 : 0 }}
            />

            {scheduleType === 'scheduled' && (
              <Box sx={{ mt: 2, ml: 4 }}>
                <DateTimePicker
                  label="예약 시간"
                  value={scheduledAt}
                  onChange={setScheduledAt}
                  minDateTime={dayjs().add(1, 'minute')}
                  slotProps={{
                    textField: {
                      fullWidth: true, size: 'small',
                      sx: {
                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                        '& .MuiInputBase-input': { color: '#fff' },
                        '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' },
                      }
                    }
                  }}
                />
              </Box>
            )}
          </Card>
        </RadioGroup>
      </Box>
    </LocalizationProvider>
  );
}

// ── Step 4: 확인 ───────────────────────────────────────────
function StepReview({ platform, selectedDevices, form, scheduleType, scheduledAt }) {
  const p = PLATFORMS.find(p => p.id === platform) || PLATFORMS[0];
  const rows = [
    { label: '플랫폼', value: p.label },
    { label: '선택 기기', value: `${selectedDevices.length}대` },
    { label: '제목', value: form.title || '(없음)' },
    { label: '캡션', value: form.caption ? form.caption.slice(0, 50) + (form.caption.length > 50 ? '...' : '') : '(없음)' },
    { label: '해시태그', value: form.hashtags || '(없음)' },
    { label: '미디어', value: form.mediaName || '(없음)' },
    { label: '실행 시간', value: scheduleType === 'now' ? '즉시 실행' : scheduledAt?.format('YYYY-MM-DD HH:mm') || '미설정' },
  ];
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} mb={1} sx={{ color: '#fff' }}>등록 전 확인해주세요</Typography>
      <Typography variant="body1" mb={3} sx={{ color: 'rgba(255,255,255,0.75)' }}>아래 내용으로 캠페인을 등록합니다.</Typography>

      <Box sx={{ border: '1px solid', borderColor: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden' }}>
        {rows.map(({ label, value }, i) => (
          <Box
            key={label}
            sx={{
              display: 'flex', alignItems: 'flex-start', px: 2.5, py: 1.8,
              bgcolor: i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
              borderBottom: i < rows.length - 1 ? '1px solid' : 'none',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <Typography variant="body2" sx={{ minWidth: 90, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{label}</Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-all', color: '#fff', fontWeight: 500 }}>{value}</Typography>
          </Box>
        ))}
      </Box>

      <Alert severity="info" sx={{ mt: 2, borderRadius: 2, '& .MuiAlert-message': { color: 'rgba(255,255,255,0.9)' } }}>
        캠페인이 등록되면 예약 시간에 선택한 기기에서 자동으로 실행됩니다.
      </Alert>
    </Box>
  );
}

// ── 메인 모달 ──────────────────────────────────────────────
export default function CampaignCreateModal({ open, onClose, onCreated }) {
  const [activeStep, setActiveStep] = useState(0);
  const [platform, setPlatform] = useState('');
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [form, setForm] = useState({ title: '', caption: '', hashtags: '', media: null, mediaName: '' });
  const [scheduleType, setScheduleType] = useState('now');
  const [scheduledAt, setScheduledAt] = useState(dayjs().add(1, 'hour'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = () => {
    setActiveStep(0);
    setPlatform('');
    setSelectedDevices([]);
    setForm({ title: '', caption: '', hashtags: '', media: null, mediaName: '' });
    setScheduleType('now');
    setScheduledAt(dayjs().add(1, 'hour'));
    setError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const canNext = () => {
    if (activeStep === 0) return !!platform;
    if (activeStep === 1) return selectedDevices.length > 0;
    if (activeStep === 2) return !!form.title;
    if (activeStep === 3) return scheduleType === 'now' || !!scheduledAt;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        platform,
        serials: selectedDevices,
        title: form.title,
        caption: form.caption,
        hashtags: form.hashtags,
        scheduled_at: scheduleType === 'now'
          ? new Date().toISOString()
          : scheduledAt.toISOString(),
      };

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('서버 오류');

      if (form.media) {
        const campaignData = await res.json();
        const fd = new FormData();
        fd.append('file', form.media);
        await fetch(`/api/campaigns/${campaignData.id}/media`, {
          method: 'POST',
          body: fd,
        });
      }

      onCreated?.();
      handleClose();
    } catch (e) {
      setError(e.message || '캠페인 등록 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(160deg, #0f0f1a 0%, #111827 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#fff',
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#fff' }}>새 캠페인 만들기</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.3 }}>SNS 자동 게시 캠페인을 등록합니다</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.5)' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Stepper */}
      <Box sx={{ px: 3, pt: 1 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel
                StepIconProps={{
                  sx: {
                    '&.Mui-active': { color: 'primary.main' },
                    '&.Mui-completed': { color: 'success.main' },
                  }
                }}
              >
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', fontWeight: 500 }}>{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {activeStep === 0 && <StepPlatform value={platform} onChange={setPlatform} />}
        {activeStep === 1 && <StepDevices selected={selectedDevices} onChange={setSelectedDevices} />}
        {activeStep === 2 && <StepContent platform={platform} form={form} setForm={setForm} />}
        {activeStep === 3 && (
          <StepSchedule
            scheduleType={scheduleType} setScheduleType={setScheduleType}
            scheduledAt={scheduledAt} setScheduledAt={setScheduledAt}
          />
        )}
        {activeStep === 4 && (
          <StepReview
            platform={platform} selectedDevices={selectedDevices}
            form={form} scheduleType={scheduleType} scheduledAt={scheduledAt}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={() => setActiveStep(s => s - 1)}
          disabled={activeStep === 0}
          sx={{ color: 'text.secondary' }}
        >
          이전
        </Button>
        <Box sx={{ flex: 1 }} />
        {activeStep < STEPS.length - 1 ? (
          <Button
            variant="contained"
            disabled={!canNext()}
            onClick={() => setActiveStep(s => s + 1)}
            sx={{
              background: 'linear-gradient(45deg, #1a73e8 30%, #aa3bff 90%)',
              boxShadow: '0 4px 12px rgba(26,115,232,0.4)',
              px: 3,
            }}
          >
            다음
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={loading}
            onClick={handleSubmit}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
            sx={{
              background: 'linear-gradient(45deg, #1a73e8 30%, #aa3bff 90%)',
              boxShadow: '0 4px 12px rgba(26,115,232,0.4)',
              px: 3,
            }}
          >
            {loading ? '등록 중...' : '캠페인 등록'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

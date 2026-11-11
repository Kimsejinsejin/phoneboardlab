import React, { useMemo, useState } from 'react';
import { Grid, Box, Typography, TextField, InputAdornment, Button, Menu, MenuItem,
         Dialog, DialogTitle, DialogContent, IconButton, Chip, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppsIcon from '@mui/icons-material/Apps';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import DeviceCard from './DeviceCard';
import MultiControlBar from './MultiControlBar';
import DeviceScheduleDrawer from './DeviceScheduleDrawer';

export default function DeviceGrid({ onStatsChange }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [streamFrame, setStreamFrame] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);   // 다중 선택
  const [scheduleDevice, setScheduleDevice] = useState(null); // 스케줄 Drawer

  React.useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch('/api/devices');
        const data = await response.json();
        if (data.status === 'success') {
          const mapped = data.devices.map(d => ({
            id: d.serial,
            name: d.nickname || `Phone Node\n${d.serial}`,
            status: d.state === 'device' ? 'active' : 'offline',
            moclou_status: d.status,
            model: d.model || '',
            battery: 100,
            progress: 0,
            currentTask: 'Ready',
          }));
          setDevices(mapped);
          if (onStatsChange) {
            onStatsChange({
              total: mapped.length,
              active: mapped.filter(d => d.status === 'active').length,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch devices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket 스트리밍 (원격 제어 모달)
  React.useEffect(() => {
    if (!selectedDevice) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/stream/${selectedDevice.id}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'frame' && payload.data) {
          setStreamFrame(`data:image/jpeg;base64,${payload.data}`);
        }
      } catch (e) {
        console.error("WS error", e);
      }
    };

    return () => {
      ws.close();
      setStreamFrame(null);
    };
  }, [selectedDevice]);

  // Moclou API 명령 전송
  const sendCommand = async (action, extra = {}) => {
    if (!selectedDevice) return;
    try {
      await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serial: selectedDevice.id, action, ...extra }),
      });
    } catch (e) {
      console.error('Command error', e);
    }
  };

  const sendText = async () => {
    if (!textInput.trim()) return;
    await sendCommand('TEXT', { text: textInput });
    setTextInput('');
  };

  const handleFilterClick = (event) => setFilterAnchorEl(event.currentTarget);
  const handleFilterClose = (status) => {
    if (status) setStatusFilter(status);
    setFilterAnchorEl(null);
  };

  // 다중 선택 토글
  const handleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const filteredDevices = useMemo(() => {
    return devices.filter(dev => {
      const matchesSearch = dev.name.toLowerCase().includes(search.toLowerCase()) ||
                            dev.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || dev.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [devices, search, statusFilter]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" color="text.primary">
            Device Fleet ({filteredDevices.length})
          </Typography>
          {loading && (
            <Chip label="연결 중..." size="small" color="warning" />
          )}
          {selectedIds.length > 0 && (
            <Chip
              label={`${selectedIds.length}대 선택됨`}
              size="small"
              color="primary"
              onDelete={() => setSelectedIds([])}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="기기 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: { borderRadius: 8, bgcolor: 'background.paper' }
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleFilterClick}
            sx={{ bgcolor: 'background.paper' }}
          >
            {statusFilter === 'all' ? 'Filter' : statusFilter.toUpperCase()}
          </Button>
          <Menu anchorEl={filterAnchorEl} open={Boolean(filterAnchorEl)} onClose={() => handleFilterClose(null)}>
            <MenuItem onClick={() => handleFilterClose('all')}>전체</MenuItem>
            <MenuItem onClick={() => handleFilterClose('active')}>온라인</MenuItem>
            <MenuItem onClick={() => handleFilterClose('offline')}>오프라인</MenuItem>
          </Menu>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {filteredDevices.map(device => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={device.id}>
            <DeviceCard
              device={device}
              onClick={(d) => setSelectedDevice(d)}
              selected={selectedIds.includes(device.id)}
              onSelect={handleSelect}
              onSchedule={(d) => setScheduleDevice(d)}
            />
          </Grid>
        ))}
        {!loading && filteredDevices.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="text.secondary">연결된 기기가 없습니다.</Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Remote Control Modal */}
      <Dialog
        open={Boolean(selectedDevice)}
        onClose={() => setSelectedDevice(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: '#0d0d0d', color: '#fff' } }}
      >
        {selectedDevice && (
          <>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" component="span" sx={{ mr: 1 }}>
                  {selectedDevice.name.split('\n')[0]}
                </Typography>
                <Chip
                  label={selectedDevice.moclou_status}
                  size="small"
                  color={selectedDevice.status === 'active' ? 'success' : 'error'}
                  sx={{ fontSize: '0.65rem' }}
                />
              </Box>
              <IconButton onClick={() => setSelectedDevice(null)} sx={{ color: 'rgba(255,255,255,0.6)' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
              {/* 화면 미러링 */}
              <Box sx={{ bgcolor: '#111', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {streamFrame ? (
                  <img src={streamFrame} alt="Live Stream" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.3)', mb: 1 }}>화면 로딩 중...</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)' }}>
                      USB 연결 기기만 미러링 가능
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* 컨트롤 버튼 */}
              <Box sx={{ p: 2, bgcolor: '#1a1a1a', display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Tooltip title="홈">
                  <IconButton onClick={() => sendCommand('ADB_SHELL', { cmd: 'input keyevent 3' })}
                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                    <HomeIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="뒤로">
                  <IconButton onClick={() => sendCommand('ADB_SHELL', { cmd: 'input keyevent 4' })}
                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="최근 앱">
                  <IconButton onClick={() => sendCommand('ADB_SHELL', { cmd: 'input keyevent 187' })}
                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                    <AppsIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* 텍스트 입력 */}
              <Box sx={{ p: 2, bgcolor: '#111', display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="텍스트 입력 (한글 가능)..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendText()}
                  InputProps={{ sx: { color: 'white', bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2 } }}
                  sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                />
                <Tooltip title="전송 (Enter)">
                  <IconButton onClick={sendText}
                    sx={{ bgcolor: '#1a73e8', color: 'white', '&:hover': { bgcolor: '#1557b0' } }}>
                    <KeyboardIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* 다중 기기 제어 바 */}
      <MultiControlBar
        selectedIds={selectedIds}
        allDevices={devices}
        onSelectAll={() => setSelectedIds(filteredDevices.map(d => d.id))}
        onDeselectAll={() => setSelectedIds([])}
        onClear={() => setSelectedIds([])}
      />

      {/* 기기별 스케줄 Drawer */}
      <DeviceScheduleDrawer
        open={Boolean(scheduleDevice)}
        device={scheduleDevice}
        onClose={() => setScheduleDevice(null)}
      />
    </Box>
  );
}

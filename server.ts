import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import { spawn } from 'child_process';
import { TikTokLiveConnection, WebcastEvent, ControlEvent } from 'tiktok-live-connector';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { getLotoChant } from './src/services/loto/lotoVerses';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// TikTok LIVE Integration State
interface TikTokStats {
  isConnected: boolean;
  isConnecting: boolean;
  username: string;
  roomId: string;
  viewerCount: number;
  totalLikes: number;
  error?: string;
}

let activeTikTokConn: InstanceType<typeof TikTokLiveConnection> | null = null;
let sseClients: express.Response[] = [];
let liveStats: TikTokStats = {
  isConnected: false,
  isConnecting: false,
  username: '',
  roomId: '',
  viewerCount: 0,
  totalLikes: 0,
  error: '',
};

// Discover local network IPv4 address for multi-device companion connections
function getLocalIp(): string {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const iface of nets[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// Lô Tô Shared Multi-Device State
interface ServerLotoCell {
  val: number | null;
  isMarked: boolean;
}

interface ServerLotoTicket {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  grid: ServerLotoCell[][];
  markedCount: number;
  waitingNumbers: number[];
  hasWon: boolean;
  winningRow?: number;
  createdAt: number;
}

interface ServerLotoState {
  roundId: number;
  calledNumbers: number[];
  currentNumber: number | null;
  currentChant: string;
  isSpinning: boolean;
  lastWinner: any | null;
}

const serverLotoState: ServerLotoState = {
  roundId: 1,
  calledNumbers: [],
  currentNumber: null,
  currentChant: 'Đêm hội Lô Tô đang mở màn, xin chúc cả nhà may mắn!',
  isSpinning: false,
  lastWinner: null,
};

const serverLotoTickets: Map<string, ServerLotoTicket> = new Map();

function generateVietnameseLotoCard(): number[][] {
  const grid: (number | null)[][] = [
    new Array(9).fill(null),
    new Array(9).fill(null),
    new Array(9).fill(null),
  ];

  const getColPool = (c: number) => {
    const min = c === 0 ? 1 : c * 10;
    const max = c === 8 ? 90 : c * 10 + 9;
    const pool: number[] = [];
    for (let i = min; i <= max; i++) pool.push(i);
    return pool;
  };

  const colPools: number[][] = [];
  for (let c = 0; c < 9; c++) {
    colPools.push(getColPool(c).sort(() => Math.random() - 0.5));
  }

  for (let r = 0; r < 3; r++) {
    const cols = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5).slice(0, 5).sort((a, b) => a - b);
    for (const c of cols) {
      const num = colPools[c].pop() ?? (c * 10 + Math.floor(Math.random() * 9) + (c === 0 ? 1 : 0));
      grid[r][c] = num;
    }
  }

  for (let c = 0; c < 9; c++) {
    const numsInCol: number[] = [];
    for (let r = 0; r < 3; r++) {
      if (grid[r][c] !== null) numsInCol.push(grid[r][c]!);
    }
    numsInCol.sort((a, b) => a - b);
    let idx = 0;
    for (let r = 0; r < 3; r++) {
      if (grid[r][c] !== null) {
        grid[r][c] = numsInCol[idx++];
      }
    }
  }

  return grid as number[][];
}

function recalcTicketStatus(ticket: ServerLotoTicket, calledNumbers: number[]) {
  let totalMarked = 0;
  const waiting: number[] = [];
  let hasWon = false;
  let winningRow: number | undefined;

  for (let r = 0; r < 3; r++) {
    let rowMarked = 0;
    let missingNumber: number | null = null;
    for (let c = 0; c < 9; c++) {
      const cell = ticket.grid[r][c];
      if (cell.val !== null) {
        if (calledNumbers.includes(cell.val) || cell.isMarked) {
          cell.isMarked = true;
          rowMarked++;
          totalMarked++;
        } else {
          cell.isMarked = false;
          missingNumber = cell.val;
        }
      }
    }
    if (rowMarked === 5) {
      hasWon = true;
      winningRow = r;
    } else if (rowMarked === 4 && missingNumber !== null) {
      waiting.push(missingNumber);
    }
  }

  ticket.markedCount = totalMarked;
  ticket.waitingNumbers = waiting;
  ticket.hasWon = hasWon;
  ticket.winningRow = winningRow;
}

function broadcastSSE(eventType: string, data: unknown) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      // client disconnected
    }
  });
}

// TikTok Live SSE Stream
app.get('/api/tiktok/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send current status right away
  res.write(`event: status\ndata: ${JSON.stringify(liveStats)}\n\n`);
  if (lastRateControl) res.write(`event: control\ndata: ${JSON.stringify(lastRateControl)}\n\n`);

  if (lastNameControl) res.write(`event: control\ndata: ${JSON.stringify(lastNameControl)}\n\n`);
  sseClients.push(res);

  // Keep-alive heartbeat every 20s
  const heartbeat = setInterval(() => {
    try {
      res.write(': keep-alive\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients = sseClients.filter((c) => c !== res);
  });
});

// TikTok Live Current Status
app.get('/api/tiktok/status', (_req, res) => {
  return res.json({ success: true, data: liveStats });
});

// Network & Multi-Device Companion Info
app.get('/api/network-info', (_req, res) => {
  const localIp = getLocalIp();
  return res.json({
    localIp,
    port: PORT,
    ticketUrl: `http://${localIp}:${PORT}/ve`,
    localTicketUrl: `http://localhost:${PORT}/ve`,
  });
});

// Lô Tô Shared State API
app.get('/api/loto/state', (_req, res) => {
  return res.json({
    success: true,
    data: {
      roundId: serverLotoState.roundId,
      calledNumbers: serverLotoState.calledNumbers,
      currentNumber: serverLotoState.currentNumber,
      currentChant: serverLotoState.currentChant,
      isSpinning: serverLotoState.isSpinning,
      lastWinner: serverLotoState.lastWinner,
      activeTicketCount: serverLotoTickets.size,
    },
  });
});

// Get or Issue a unique ticket for a specific viewer / mobile device
app.get('/api/loto/ticket', (req, res) => {
  const username = ((req.query.user as string) || '').trim();
  if (!username) {
    return res.status(400).json({ success: false, error: 'Thiếu tên người dùng (user parameter)' });
  }

  const key = username.toLowerCase();
  let ticket = serverLotoTickets.get(key);
  if (!ticket) {
    const rawGrid = generateVietnameseLotoCard();
    const grid: ServerLotoCell[][] = rawGrid.map((row) =>
      row.map((val) => ({
        val,
        isMarked: val !== null && serverLotoState.calledNumbers.includes(val),
      }))
    );

    ticket = {
      id: `ticket_${serverLotoState.roundId}_${key}`,
      username,
      displayName: (req.query.name as string) || username,
      avatarUrl: (req.query.avatar as string) || '',
      grid,
      markedCount: 0,
      waitingNumbers: [],
      hasWon: false,
      createdAt: Date.now(),
    };
    recalcTicketStatus(ticket, serverLotoState.calledNumbers);
    serverLotoTickets.set(key, ticket);
    broadcastSSE('loto_new_player', { username: ticket.username, displayName: ticket.displayName });
  } else {
    recalcTicketStatus(ticket, serverLotoState.calledNumbers);
  }

  return res.json({
    success: true,
    ticket,
    lotoState: {
      roundId: serverLotoState.roundId,
      calledNumbers: serverLotoState.calledNumbers,
      currentNumber: serverLotoState.currentNumber,
      currentChant: serverLotoState.currentChant,
      isSpinning: serverLotoState.isSpinning,
      lastWinner: serverLotoState.lastWinner,
    },
  });
});

// Streamer synchronizes game state to server & broadcasts to all mobile companions
app.post('/api/loto/sync', (req, res) => {
  const { roundId, calledNumbers, currentNumber, currentChant, isSpinning, lastWinner } = req.body;
  if (typeof roundId === 'number') {
    if (roundId !== serverLotoState.roundId) {
      // New round started: clear old tickets or re-roll
      serverLotoTickets.clear();
    }
    serverLotoState.roundId = roundId;
  }
  if (Array.isArray(calledNumbers)) serverLotoState.calledNumbers = calledNumbers;
  if (currentNumber !== undefined) serverLotoState.currentNumber = currentNumber;
  if (typeof currentChant === 'string') serverLotoState.currentChant = currentChant;
  if (typeof isSpinning === 'boolean') serverLotoState.isSpinning = isSpinning;
  if (lastWinner !== undefined) serverLotoState.lastWinner = lastWinner;

  // Recalculate all issued tickets
  serverLotoTickets.forEach((t) => recalcTicketStatus(t, serverLotoState.calledNumbers));

  broadcastSSE('loto_update', {
    roundId: serverLotoState.roundId,
    calledNumbers: serverLotoState.calledNumbers,
    currentNumber: serverLotoState.currentNumber,
    currentChant: serverLotoState.currentChant,
    isSpinning: serverLotoState.isSpinning,
    lastWinner: serverLotoState.lastWinner,
    activeTicketCount: serverLotoTickets.size,
  });

  return res.json({ success: true });
});

// Viewer taps "HÔ KINH" on their mobile device
app.post('/api/loto/claim-win', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ success: false, error: 'Thiếu username' });
  }

  const key = String(username).toLowerCase();
  const ticket = serverLotoTickets.get(key);
  if (!ticket) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy vé của người chơi này' });
  }

  recalcTicketStatus(ticket, serverLotoState.calledNumbers);
  if (!ticket.hasWon || ticket.winningRow === undefined) {
    return res.status(400).json({ success: false, error: 'Chưa đủ 5 số trên cùng một hàng để Kinh!' });
  }

  const winningRowNumbers: number[] = [];
  ticket.grid[ticket.winningRow].forEach((c) => {
    if (c.val !== null) winningRowNumbers.push(c.val);
  });

  const winner = {
    username: ticket.username,
    displayName: ticket.displayName,
    avatarUrl: ticket.avatarUrl,
    winningNumber: serverLotoState.currentNumber || winningRowNumbers[0] || 0,
    winningRowNumbers,
    wonAt: Date.now(),
    roundId: serverLotoState.roundId,
  };

  serverLotoState.lastWinner = winner;
  broadcastSSE('loto_win', winner);
  return res.json({ success: true, winner });
});

// ========================================================
// LÔ TÔ HIGH-FIDELITY MUSIC & CALL AUDIO ENGINE
// ========================================================
const FFMPEG_BIN = fs.existsSync('/opt/homebrew/bin/ffmpeg') ? '/opt/homebrew/bin/ffmpeg' : 'ffmpeg';
const lotoCallCache = new Map<string, Buffer>();

function mixWithLotoBeat(ttsBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve) => {
    const beatPath = path.join(__dirname, 'public', 'assets', 'audio', 'loto_beat.mp3');
    if (!fs.existsSync(beatPath)) {
      return resolve(ttsBuffer);
    }

    const ffmpeg = spawn(FFMPEG_BIN, [
      '-i', 'pipe:0',
      '-stream_loop', '-1',
      '-i', beatPath,
      '-filter_complex', '[0:a]aecho=0.8:0.7:160:0.35,volume=1.2[v];[1:a]volume=0.42[b];[v][b]amix=inputs=2:duration=first:dropout_transition=2[out]',
      '-map', '[out]',
      '-f', 'mp3',
      '-b:a', '192k',
      'pipe:1',
    ]);

    const chunks: Buffer[] = [];
    ffmpeg.stdout.on('data', (c) => chunks.push(c));
    ffmpeg.stderr.on('data', () => {});

    ffmpeg.on('close', (code) => {
      if (code === 0 && chunks.length > 0) {
        resolve(Buffer.concat(chunks));
      } else {
        resolve(ttsBuffer);
      }
    });

    ffmpeg.on('error', () => {
      resolve(ttsBuffer);
    });

    ffmpeg.stdin.write(ttsBuffer);
    ffmpeg.stdin.end();
  });
}

// List available pre-recorded real song MP3s in /assets/loto/songs/
app.get('/api/loto/songs', (_req, res) => {
  const songsDir = path.join(__dirname, 'public', 'assets', 'loto', 'songs');
  if (!fs.existsSync(songsDir)) {
    return res.json({ songs: [] });
  }
  const files = fs.readdirSync(songsDir);
  const songs: number[] = [];
  for (const f of files) {
    const m = f.match(/^(\d+)\.mp3$/i);
    if (m) {
      songs.push(parseInt(m[1], 10));
    }
  }
  songs.sort((a, b) => a - b);
  return res.json({ songs });
});

// Master Lô Tô Audio Call Route:
// 1. If /assets/loto/songs/{num}.mp3 exists, stream the authentic singing MP3!
// 2. Otherwise synthesize chant via Edge TTS + organ beat + stage echo!
app.get('/api/loto/call-audio', async (req, res) => {
  try {
    const num = parseInt(req.query.num as string, 10);
    if (isNaN(num) || num < 1 || num > 90) {
      return res.status(400).send('Invalid number (1-90)');
    }

    const voice = (req.query.voice as string) || 'vi-VN-NamMinhNeural';
    const beat = req.query.beat !== '0';

    // 1. Check if a real recorded song exists for this number
    const customSongPath = path.join(__dirname, 'public', 'assets', 'loto', 'songs', `${num}.mp3`);
    if (fs.existsSync(customSongPath)) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Loto-Audio-Type', 'real-song');
      return res.sendFile(customSongPath);
    }

    // 2. Check in-memory synthesized cache
    const cacheKey = `${num}|${voice}|${beat ? '1' : '0'}`;
    const cached = lotoCallCache.get(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Loto-Audio-Type', 'synthesized-beat');
      return res.send(cached);
    }

    // 3. Generate chant text & Edge TTS
    const { spokenText } = getLotoChant(num);
    let ttsBuffer: Buffer;
    try {
      ttsBuffer = await edgeTts(spokenText, 1.05, voice);
    } catch {
      ttsBuffer = await googleTts(spokenText);
    }

    // 4. Mix with organ beat if enabled
    let finalAudio = ttsBuffer;
    if (beat) {
      try {
        finalAudio = await mixWithLotoBeat(ttsBuffer);
      } catch (mixErr) {
        console.warn('mixWithLotoBeat failed, fallback to raw tts:', mixErr);
      }
    }

    lotoCallCache.set(cacheKey, finalAudio);
    if (lotoCallCache.size > 100) {
      lotoCallCache.delete(lotoCallCache.keys().next().value!);
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Loto-Audio-Type', 'synthesized-beat');
    return res.send(finalAudio);
  } catch (err) {
    console.error('Call-audio error:', err);
    return res.status(500).json({ error: 'Failed to generate call audio' });
  }
});

// Upload a real singing MP3 file for a number (from streamer panel)
app.post('/api/loto/upload-song', express.raw({ type: 'audio/mpeg', limit: '15mb' }), (req, res) => {
  try {
    const num = parseInt(req.query.num as string, 10);
    if (isNaN(num) || num < 1 || num > 90) {
      return res.status(400).json({ success: false, error: 'Số không hợp lệ (1-90)' });
    }
    const songsDir = path.join(__dirname, 'public', 'assets', 'loto', 'songs');
    if (!fs.existsSync(songsDir)) {
      fs.mkdirSync(songsDir, { recursive: true });
    }
    const filePath = path.join(songsDir, `${num}.mp3`);
    fs.writeFileSync(filePath, req.body as Buffer);
    // Invalidate synthesized cache for this number
    for (const k of Array.from(lotoCallCache.keys())) {
      if (k.startsWith(`${num}|`)) lotoCallCache.delete(k);
    }
    return res.json({ success: true, message: `Đã lưu bài hát cho số ${num}` });
  } catch (err) {
    console.error('Upload song error:', err);
    return res.status(500).json({ success: false, error: 'Lỗi lưu bài hát' });
  }
});

// Connect to TikTok Live room by username
app.post('/api/tiktok/connect', async (req, res) => {
  const { username } = req.body;
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ success: false, error: 'Thiếu tên tài khoản TikTok (username)' });
  }

  const cleanUser = username.replace(/^@/, '').trim();
  if (!cleanUser) {
    return res.status(400).json({ success: false, error: 'Tên tài khoản không hợp lệ' });
  }

  try {
    // If already connected to another room, disconnect first
    if (activeTikTokConn) {
      try {
        activeTikTokConn.disconnect();
      } catch {
        // ignore
      }
      activeTikTokConn = null;
    }

    liveStats = {
      isConnected: false,
      isConnecting: true,
      username: cleanUser,
      roomId: '',
      viewerCount: 0,
      totalLikes: 0,
      error: '',
    };
    broadcastSSE('status', liveStats);

    const conn = new TikTokLiveConnection(cleanUser, {
      processInitialData: true,
      // The gift-list fetch behind this option needs a paid Euler Stream plan; gift events already carry name and diamonds
      enableExtendedGiftInfo: false,
    });

    conn.on(ControlEvent.CONNECTED, (state: { roomId?: string }) => {
      console.log(`[TikTok LIVE] Connected to @${cleanUser}, room ID: ${state?.roomId}`);
      liveStats = {
        isConnected: true,
        isConnecting: false,
        username: cleanUser,
        roomId: state?.roomId || '',
        viewerCount: liveStats.viewerCount,
        totalLikes: liveStats.totalLikes,
        error: '',
      };
      broadcastSSE('status', liveStats);
      broadcastSSE('connected', { username: cleanUser, roomId: state?.roomId });
    });

    conn.on(ControlEvent.DISCONNECTED, () => {
      console.log(`[TikTok LIVE] Disconnected from @${cleanUser}`);
      liveStats.isConnected = false;
      liveStats.isConnecting = false;
      broadcastSSE('status', liveStats);
      broadcastSSE('disconnected', { username: cleanUser });
    });

    conn.on(WebcastEvent.STREAM_END, () => {
      console.log(`[TikTok LIVE] Stream ended for @${cleanUser}`);
      liveStats.isConnected = false;
      liveStats.isConnecting = false;
      liveStats.error = 'Phiên Live trên TikTok đã kết thúc';
      broadcastSSE('status', liveStats);
      broadcastSSE('streamEnd', { username: cleanUser });
    });

    conn.on(WebcastEvent.CHAT, (data: any) => {
      const chatEvent = {
        username: data?.user?.displayId || data?.user?.uniqueId || data?.uniqueId || 'devotee',
        nickname: data?.user?.nickname || data?.nickname || data?.uniqueId || 'Phật tử',
        // tiktok-live-proto v3 puts the text in `content` (v1 used `comment`)
        comment: data?.content || data?.comment || '',
        avatar: data?.user?.avatarThumb?.urlList?.[0] || "",
        timestamp: Date.now(),
      };
      broadcastSSE('chat', chatEvent);
    });

    // TikTok resends streak gifts with a cumulative repeatCount; only forward the new units
    const streakCounts = new Map<string, number>();

    conn.on(WebcastEvent.GIFT, (data: any) => {
      const username = data?.user?.displayId || data?.user?.uniqueId || data?.uniqueId || 'devotee';
      const giftId = data?.giftId || 0;
      const streakKey = `${username}_${giftId}`;
      const total = data?.repeatCount || 1;
      const delta = total - (streakCounts.get(streakKey) || 0);
      const isStreakable = (data?.gift?.type ?? data?.giftDetails?.giftType ?? data?.giftType) === 1;
      if (isStreakable && !data?.repeatEnd) streakCounts.set(streakKey, total);
      else streakCounts.delete(streakKey);
      if (delta <= 0) return;

      const giftEvent = {
        username,
        nickname: data?.user?.nickname || data?.nickname || data?.uniqueId || 'Thí chủ',
        giftName: data?.gift?.name || data?.giftDetails?.giftName || data?.giftName || 'Hoa Sen',
        giftId,
        diamondCount: data?.gift?.diamondCount || data?.diamondCount || data?.giftDetails?.diamondCount || 1,
        repeatCount: delta,
        repeatEnd: data?.repeatEnd ?? 1,
        avatar: data?.user?.avatarThumb?.urlList?.[0] || "",
        timestamp: Date.now(),
      };
      broadcastSSE('gift', giftEvent);
    });

    conn.on(WebcastEvent.MEMBER, (data: any) => {
      const memberEvent = {
        username: data?.user?.displayId || data?.user?.uniqueId || data?.uniqueId || 'devotee',
        nickname: data?.user?.nickname || data?.nickname || data?.uniqueId || 'Phật tử',
        avatar: data?.user?.avatarThumb?.urlList?.[0] || "",
        timestamp: Date.now(),
      };
      broadcastSSE('member', memberEvent);
    });

    conn.on(WebcastEvent.FOLLOW, (data: any) => {
      broadcastSSE('follow', {
        username: data?.user?.displayId || data?.user?.uniqueId || data?.uniqueId || 'devotee',
        nickname: data?.user?.nickname || data?.nickname || data?.uniqueId || 'Phật tử',
        timestamp: Date.now(),
      });
    });

    conn.on(WebcastEvent.ROOM_USER, (data: any) => {
      if (typeof data?.viewerCount === 'number') {
        liveStats.viewerCount = data.viewerCount;
        broadcastSSE('roomUser', { viewerCount: data.viewerCount });
      }
    });

    conn.on(WebcastEvent.LIKE, (data: any) => {
      if (typeof data?.totalLikeCount === 'number') {
        liveStats.totalLikes = data.totalLikeCount;
      }
      broadcastSSE('like', {
        username: data?.user?.displayId || data?.user?.uniqueId || data?.uniqueId || '',
        likeCount: data?.likeCount || 1,
        totalLikes: liveStats.totalLikes,
      });
    });

    conn.on(ControlEvent.ERROR, (err: unknown) => {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[TikTok LIVE] Error for @${cleanUser}:`, errMsg);
      liveStats.error = errMsg;
      broadcastSSE('status', liveStats);
    });

    activeTikTokConn = conn;

    // Connect to room (note: user might not be live right now)
    conn
      .connect()
      .then((state: { roomId?: string }) => {
        return res.json({
          success: true,
          message: `Đang kết nối phòng live @${cleanUser}`,
          roomId: state.roomId,
        });
      })
      .catch((err: unknown) => {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(`[TikTok LIVE] Connect error for @${cleanUser}:`, errMsg);
        liveStats.isConnecting = false;
        liveStats.isConnected = false;
        liveStats.error = errMsg;
        broadcastSSE('status', liveStats);
        return res.status(400).json({
          success: false,
          error: `Không thể kết nối với @${cleanUser}: ${errMsg}. Hãy đảm bảo tài khoản đang bấm Phát trực tiếp (LIVE) trên TikTok!`,
        });
      });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    liveStats.isConnecting = false;
    liveStats.isConnected = false;
    liveStats.error = errMsg;
    broadcastSSE('status', liveStats);
    return res.status(500).json({ success: false, error: errMsg });
  }
});

// Streamer commands from the dashboard, relayed to the live stage page(s) that make the sound
const CONTROL_ACTIONS = ['speak', 'shareReminder', 'bell', 'setRate', 'setName', 'loto_spin', 'loto_reset', 'loto_auto_spin', 'loto_interval', 'setTheme'];

// The channel name (title + what the voice says) survives restarts in settings.json next to this file
const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');
let lastNameControl: { action: string; text: string } | null = null;
try {
  const saved = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
  if (typeof saved.channelName === 'string' && saved.channelName.trim()) lastNameControl = { action: 'setName', text: saved.channelName.trim() };
} catch {
  // no settings yet: the app's default name is used
}
// Last voice speed from the dashboard, replayed to stage pages that (re)load later
let lastRateControl: { action: string; text: string } | null = null;
app.post('/api/control', (req, res) => {
  const { action, text } = req.body || {};
  if (!CONTROL_ACTIONS.includes(action)) {
    return res.status(400).json({ success: false, error: 'Lệnh không hợp lệ' });
  }
  if (action === 'speak' && (typeof text !== 'string' || !text.trim())) {
    return res.status(400).json({ success: false, error: 'Chưa nhập nội dung cần đọc' });
  }
  const payload = { action, text: typeof text === 'string' ? text.trim().slice(0, 1000) : undefined };
  if (action === 'setRate' && payload.text) lastRateControl = { action, text: payload.text };
  if (action === 'setName') {
    // Plain name only: no control characters, at most 40 characters
    const name = (payload.text || '').replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, 40);
    if (!name) return res.status(400).json({ success: false, error: 'Chưa nhập tên kênh' });
    payload.text = name;
    lastNameControl = { action, text: name };
    try {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ channelName: name }, null, 2));
    } catch (err) {
      console.error('Could not save settings.json:', err);
    }
  }
  broadcastSSE('control', payload);
  return res.json({ success: true, stages: sseClients.length });
});

// Disconnect route
app.post('/api/tiktok/disconnect', (_req, res) => {
  try {
    if (activeTikTokConn) {
      activeTikTokConn.disconnect();
      activeTikTokConn = null;
    }
    liveStats = {
      isConnected: false,
      isConnecting: false,
      username: '',
      roomId: '',
      viewerCount: 0,
      totalLikes: 0,
      error: '',
    };
    broadcastSSE('status', liveStats);
    return res.json({ success: true, message: 'Đã ngắt kết nối TikTok LIVE' });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: errMsg });
  }
});


// Split at sentence/comma/space boundaries into pieces of at most `max` chars
function splitTtsText(text: string, max = 190): string[] {
  const chunks: string[] = [];
  let rest = text.trim();
  while (rest.length > max) {
    const window = rest.slice(0, max + 1);
    let cut = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '), window.lastIndexOf('? '));
    if (cut < max / 2) cut = Math.max(window.lastIndexOf(', '), window.lastIndexOf('; '));
    if (cut < max / 2) cut = window.lastIndexOf(' ');
    if (cut <= 0) cut = max - 1;
    chunks.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

// Natural Vietnamese neural voice; rate 1 = normal speed.
const DEFAULT_TTS_VOICE = 'vi-VN-NamMinhNeural'; // male voice
const TTS_PITCH = '-2%';
// The text goes inside SSML, so names with & < > must be escaped
const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function edgeTts(text: string, rate: number, voice: string = DEFAULT_TTS_VOICE): Promise<Buffer> {
  const tts = new MsEdgeTTS();
  try {
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(escapeXml(text), { rate: `${Math.round((rate - 1) * 100)}%`, pitch: TTS_PITCH });
    const chunks: Buffer[] = [];
    const read = (async () => {
      for await (const c of audioStream) chunks.push(c as Buffer);
    })();
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Edge TTS timeout')), 20000));
    await Promise.race([read, timeout]);
    if (chunks.length === 0) throw new Error('Edge TTS returned no audio');
    return Buffer.concat(chunks);
  } finally {
    tts.close();
  }
}

// Fallback: Google Translate TTS caps each request near 200 chars, so fetch in chunks and join the MP3s
async function googleTts(text: string): Promise<Buffer> {
  const parts: Buffer[] = [];
  for (const chunk of splitTtsText(text)) {
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(chunk)}`;
    const response = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
    });
    if (!response.ok) throw new Error(`TTS upstream error: ${response.status}`);
    parts.push(Buffer.from(await response.arrayBuffer()));
  }
  return Buffer.concat(parts);
}

// Repeated lines (share reminders, lecture paragraphs) are served from memory
const ttsCache = new Map<string, Buffer>();

app.get('/api/tts', async (req, res) => {
  try {
    const text = ((req.query.text as string) || '').trim().slice(0, 1500);
    if (!text) {
      return res.status(400).send('Missing text parameter');
    }
    const rate = Math.min(1.5, Math.max(0.5, Number(req.query.rate) || 1));
    const voice = (req.query.voice as string) || DEFAULT_TTS_VOICE;
    const cacheKey = `${voice}|${rate}|${text}`;
    let audio = ttsCache.get(cacheKey);
    if (!audio) {
      try {
        audio = await edgeTts(text, rate, voice);
      } catch (err) {
        console.warn('Edge TTS failed, falling back to Google:', err instanceof Error ? err.message : err);
        audio = await googleTts(text);
      }
      ttsCache.set(cacheKey, audio);
      if (ttsCache.size > 200) ttsCache.delete(ttsCache.keys().next().value!);
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(audio);
  } catch (err) {
    console.error('TTS error:', err);
    return res.status(500).json({ error: 'TTS failed' });
  }
});

// API Route: AI Real-Time Prayer & Trend Analysis

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      // LIVE_MODE=1 (BAT-LIVE.bat): no hot reload, so editing code or a dropped dev socket never reloads the
      // stage page mid-live. Refresh the Link source by hand to pick up changes.
      server: { middlewareMode: true, hmr: process.env.LIVE_MODE === '1' ? false : undefined },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const HOST = process.env.HOST || '0.0.0.0';
  app.listen(PORT, HOST, () => {
    const localIp = getLocalIp();
    console.log(`Chùa Online LIVE server running on http://localhost:${PORT}`);
    console.log(`📱 Link vé cho khán giả trên điện thoại: http://${localIp}:${PORT}/ve`);
  });
}

startServer();

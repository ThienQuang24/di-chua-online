import { useState, useEffect, useRef } from 'react';
import { HeaderNav, AppTheme } from './components/HeaderNav';
import { MobileLotoTicketView } from './components/loto/MobileLotoTicketView';
import { ActiveStageView, ActiveStreamerPanel } from './components/AppStageViewport';
import { lotoEngine } from './services/loto/lotoEngine';
import { nhauEngine } from './services/nhau/nhauEngine';
import {
  StreamConfig, Devotee, GiftEvent, LeaderboardEntry, CommentEvent, TikTokLiveStatus, OfferRequest,
} from './types/temple';
import { soundEngine } from './services/soundEngine';
import { maskBanned } from './services/bannedWords';
import { pickSeat } from './services/seating';
import { LIKES_PER_RAIN } from './services/likeRain';
import { apiClient } from './services/apiClient';
import {
  createInitialStreamConfig, applyThemeToStreamConfig, makeDevotee, getStarterDevoteesForTheme,
} from './composables/useStreamCommentHelper';
import { useStreamActions } from './composables/useStreamActions';
import { useTikTokSse } from './composables/useTikTokSse';

const SHARE_REMINDER_MS = 5 * 60 * 1000, IDLE_BLESSING_MS = 90 * 1000, WELCOME_CHECK_MS = 6 * 1000;
const MAX_WAITING_JOINERS = 30, SEAT_AFTER_JOIN_MS = 10 * 1000, SPOTLIGHT_COINS = 1, RAIN_MS = 60 * 1000;
const pageParams = new URLSearchParams(window.location.search);
const IS_STAGE_PAGE = pageParams.get('view') === 'stage' || pageParams.get('obs') === 'true';
const IS_TICKET_PAGE = typeof window !== 'undefined' && (window.location.pathname.startsWith('/ve') || window.location.pathname.startsWith('/ticket') || pageParams.get('view') === 'ticket' || pageParams.get('view') === 've');

function MainApp() {
  const [config, setConfig] = useState<StreamConfig>(() => createInitialStreamConfig(IS_STAGE_PAGE));
  const [isStandaloneObs, setIsStandaloneObs] = useState(false);
  const [stageZoom, setStageZoom] = useState(1);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>((pageParams.get('theme') as AppTheme) || 'loto');

  useEffect(() => { setConfig((prev) => applyThemeToStreamConfig(currentTheme, prev)); }, [currentTheme]);

  useEffect(() => {
    if (!isStandaloneObs) return;
    const fit = () => setStageZoom(Math.min(window.innerWidth / 430, window.innerHeight / ((430 * 16) / 9)));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [isStandaloneObs]);

  const [tikTokStatus, setTikTokStatus] = useState<TikTokLiveStatus>({
    isConnected: false, isConnecting: false, username: '', roomId: '', viewerCount: 0, totalLikes: 0, error: '',
  });
  const [devotees, setDevotees] = useState<Devotee[]>([]);
  const [leaderboardDonors, setLeaderboardDonors] = useState<LeaderboardEntry[]>([]);
  const addMerit = (username: string, points: number, avatarUrl = '', diamonds = 0) =>
    setLeaderboardDonors((prev) => {
      const key = username.toLowerCase();
      const found = prev.find((d) => d.username.toLowerCase() === key);
      const next = found
        ? prev.map((d) => (d === found ? { ...d, score: (d.score ?? 0) + points, diamonds: d.diamonds + diamonds, avatarUrl: avatarUrl || d.avatarUrl } : d))
        : [...prev, { username, displayName: maskBanned(username), diamonds, score: points, rank: prev.length + 1, avatarUrl }];
      return next.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    });

  const [likeProgress, setLikeProgress] = useState(0);
  const [rainUntil, setRainUntil] = useState(0);
  const likesRef = useRef(0);
  const addLikes = (count: number) => {
    const total = likesRef.current + count;
    const rains = Math.floor(total / LIKES_PER_RAIN);
    likesRef.current = total % LIKES_PER_RAIN;
    setLikeProgress(likesRef.current);
    if (rains > 0) setRainUntil((until) => Math.max(until, Date.now()) + rains * RAIN_MS);
  };
  const [, setComments] = useState<CommentEvent[]>([]);
  const [currentGift, setCurrentGift] = useState<GiftEvent | null>(null);
  const [offerers, setOfferers] = useState<GiftEvent[]>([]);
  const [offerRequests, setOfferRequests] = useState<OfferRequest[]>([]);
  const [spotlightRequests, setSpotlightRequests] = useState<OfferRequest[]>([]);
  const giftCoinsRef = useRef(new Map<string, { coins: number; since: number; done: boolean }>());
  const pendingThanksRef = useRef(new Map<string, { username: string; giftName: string; diamonds: number }>());

  const readPendingThanks = (username: string) => {
    const key = username.toLowerCase();
    const t = pendingThanksRef.current.get(key);
    if (!t) return;
    pendingThanksRef.current.delete(key);
    soundEngine.readGiftAcknowledgment(t.username, t.giftName, t.diamonds);
  };

  const requestSpotlightIfBig = (username: string, coins: number, avatarUrl = '') => {
    const key = username.toLowerCase();
    const now = Date.now();
    const prev = giftCoinsRef.current.get(key);
    const entry = prev && now - prev.since < 15000 ? prev : { coins: 0, since: now, done: false };
    entry.coins += coins;
    giftCoinsRef.current.set(key, entry);
    if (entry.done || entry.coins < SPOTLIGHT_COINS) return;
    entry.done = true;
    setSpotlightRequests((p) => [...p, { id: `spot-${now}-${username}`, username, displayName: maskBanned(username), avatarUrl }].slice(-10));
    soundEngine.playTempleBell(0.9);
  };

  const requestOffer = (username: string, avatarUrl = '') =>
    setOfferRequests((prev) => [...prev, { id: `offer-${Date.now()}-${username}`, username, displayName: maskBanned(username), avatarUrl }].slice(-20));

  const [auraIntensity, setAuraIntensity] = useState<number>(0.1);
  const [isGiftActive, setIsGiftActive] = useState<boolean>(false);
  const giftTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recentInteractorsRef = useRef<Map<string, number>>(new Map());
  const noteInteractor = (name: string) => {
    const m = recentInteractorsRef.current;
    m.delete(name);
    m.set(name, Date.now());
    if (m.size > 50) m.delete(m.keys().next().value!);
  };

  const addOrUpdateDevotee = (username: string, update: (d?: Devotee) => Partial<Devotee>, allowNew = true) =>
    setDevotees((prev) => {
      const key = username.toLowerCase();
      const found = prev.find((d) => d.username.toLowerCase() === key);
      if (found) return prev.map((d) => (d === found ? { ...d, ...update(d), lastActive: Date.now() } : d));
      if (!allowNew) return prev;
      const { seat, evict } = pickSeat(prev);
      return [...prev.filter((d) => d !== evict), makeDevotee(username, seat, update())];
    });

  useEffect(() => {
    if (typeof window !== 'undefined' && IS_STAGE_PAGE) {
      setIsStandaloneObs(true);
      setConfig((prev) => ({ ...prev, viewMode: 'stage_only' }));
    }
  }, []);

  useEffect(() => {
    if (devotees.length === 0) {
      const starters = getStarterDevoteesForTheme(currentTheme);
      if (starters.length > 0) setDevotees(starters);
    }
  }, [currentTheme]);

  useEffect(() => {
    if (config.bgmEnabled) soundEngine.startBuddhistMusic(config.buddhistMusicTrack, config.bgmVolume);
    else soundEngine.stopBuddhistMusic();
  }, [config.bgmEnabled, config.buddhistMusicTrack, config.bgmVolume]);

  useEffect(() => { soundEngine.setSpeechRate(config.ttsSpeed); }, [config.ttsSpeed]);

  useEffect(() => {
    if (auraIntensity > 0.1) {
      const interval = setInterval(() => setAuraIntensity((prev) => Math.max(0.1, prev - 0.05)), 200);
      return () => clearInterval(interval);
    }
  }, [auraIntensity]);

  const handleFollow = (username: string) => { if (config.autoTts) soundEngine.readFollowThanks(username); };
  const remindShare = () => {
    const since = Date.now() - SHARE_REMINDER_MS;
    const names = [...recentInteractorsRef.current].filter(([, t]) => t > since).map(([name]) => name).reverse().slice(0, 3);
    soundEngine.readShareReminder(names);
  };

  useEffect(() => {
    if (!config.autoTts) return;
    const interval = setInterval(() => remindShare(), SHARE_REMINDER_MS);
    const idle = setInterval(() => { if (soundEngine.quietForMs() > IDLE_BLESSING_MS) soundEngine.readIdleBlessing(); }, 15000);
    return () => { clearInterval(interval); clearInterval(idle); };
  }, [config.autoTts]);

  const newJoinersRef = useRef<string[]>([]);
  const greetedRef = useRef<Set<string>>(new Set());
  const handleJoin = (name: string, avatarUrl = '') => {
    if (currentTheme === 'loto') lotoEngine.issueTicket(name, name, avatarUrl);
    else if (currentTheme === 'nhau') nhauEngine.addGuest(name, name, avatarUrl);
    setTimeout(() => addOrUpdateDevotee(name, (d) => ({ avatarUrl: avatarUrl || d?.avatarUrl })), SEAT_AFTER_JOIN_MS);
    if (greetedRef.current.has(name) || newJoinersRef.current.includes(name)) return;
    newJoinersRef.current = [...newJoinersRef.current, name].slice(-MAX_WAITING_JOINERS);
  };

  useEffect(() => {
    if (!config.autoTts) return;
    const interval = setInterval(() => {
      if (!newJoinersRef.current.length || soundEngine.isDharmaLecturePlaying() || soundEngine.queuedSpeech() >= 2) return;
      const names = newJoinersRef.current.splice(0, 6);
      names.forEach((n) => greetedRef.current.add(n));
      for (let i = 0; i < names.length; i += 3) soundEngine.readWelcomeJoiners(names.slice(i, i + 3));
    }, WELCOME_CHECK_MS);
    return () => clearInterval(interval);
  }, [config.autoTts]);

  const handleRingBell = () => { soundEngine.playTempleBell(0.9); setAuraIntensity(0.7); };
  const handlePlayGong = () => { soundEngine.playMuoGong(0.85); };
  const handleToggleBgm = () => { setConfig((prev) => ({ ...prev, bgmEnabled: !prev.bgmEnabled })); };
  const handleResetCrowd = () => { setDevotees([]); setLeaderboardDonors([]); };

  const { handleTriggerGift, handleAddComment, handleControl } = useStreamActions({
    currentTheme, config, currentGift, isStandaloneObs, giftTimeoutRef, pendingThanksRef,
    noteInteractor, requestOffer, requestSpotlightIfBig, readPendingThanks, addMerit,
    addOrUpdateDevotee, remindShare, handleRingBell, setCurrentGift, setOfferers,
    setIsGiftActive, setAuraIntensity, setDevotees, setComments, setConfig, setCurrentTheme,
  });

  const { handleConnectTikTok, handleDisconnectTikTok } = useTikTokSse({
    handleTriggerGift, handleAddComment, handleFollow, handleControl, handleJoin, addLikes, addOrUpdateDevotee, setDevotees, setTikTokStatus,
  });

  const stageProps = {
    currentTheme, config, devotees, currentGift, likeProgress, rainUntil, offerers, offerRequests, spotlightRequests,
    leaderboardDonors, auraIntensity, isGiftActive, onToggleBgm: handleToggleBgm, onRingBell: handleRingBell,
    onPlayGong: handlePlayGong, onSpotlightStart: readPendingThanks,
  };
  const panelProps = {
    currentTheme, config, tikTokStatus,
    onAddDevoteeWithAvatar: (name: string, avatar?: string) => addOrUpdateDevotee(name, (d) => ({ avatarUrl: avatar || d?.avatarUrl }), true),
    onTriggerLotoGift: (u: string, g: string, c = 1) => handleTriggerGift('dang_hoa_sen', g, 'Ủng hộ gánh Lô Tô', u, 1, c, ''),
    onResetCrowd: handleResetCrowd, onConnectTikTok: handleConnectTikTok, onDisconnectTikTok: handleDisconnectTikTok,
    onSimulateChat: (name: string, text: string, avatar?: string) => handleAddComment(name, text, avatar || ''),
    onSaveChannelName: (name: string) => apiClient.sendControl('setName', name),
    onUpdateConfig: (updates: Partial<StreamConfig>) => setConfig((prev) => ({ ...prev, ...updates })),
  };

  if (isStandaloneObs) {
    return (
      <div className="w-screen h-screen bg-[#070302] flex items-center justify-center p-0 m-0 overflow-hidden">
        <div className="w-[430px] flex flex-col justify-center" style={{ zoom: stageZoom }}><ActiveStageView {...stageProps} /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070302] text-stone-100 flex flex-col font-sans">
      <HeaderNav viewMode={config.viewMode} onChangeViewMode={(mode) => setConfig((prev) => ({ ...prev, viewMode: mode }))} currentTheme={currentTheme} onChangeTheme={(theme) => { setCurrentTheme(theme); apiClient.sendControl('setTheme', theme); }} />
      <main className="flex-1 p-2 md:p-6 max-w-7xl mx-auto w-full flex flex-col">
        {config.viewMode === 'dual' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
            <div className="lg:col-span-5 flex justify-center"><div className="w-full max-w-[430px]"><ActiveStageView {...stageProps} /></div></div>
            <div className="lg:col-span-7 flex flex-col gap-4"><ActiveStreamerPanel {...panelProps} deckHeightClass="h-[680px]" /></div>
          </div>
        ) : config.viewMode === 'stage_only' ? (
          <div className="flex-1 flex items-center justify-center py-2"><div className="w-full max-w-[430px]"><ActiveStageView {...stageProps} /></div></div>
        ) : (
          <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col gap-4"><ActiveStreamerPanel {...panelProps} deckHeightClass="h-[750px]" /></div>
        )}
      </main>
    </div>
  );
}

export default function App() { return IS_TICKET_PAGE ? <MobileLotoTicketView /> : <MainApp />; }

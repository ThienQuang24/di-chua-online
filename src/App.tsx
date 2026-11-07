import { useState, useEffect, useRef, useCallback } from 'react';
import { HeaderNav, AppTheme } from './components/HeaderNav';
import { ChanhDienStage } from './components/ChanhDienStage';
import { StreamerDeck } from './components/StreamerDeck';
import { LotoStage } from './components/loto/LotoStage';
import { LotoStreamerPanel } from './components/loto/LotoStreamerPanel';
import { MobileLotoTicketView } from './components/loto/MobileLotoTicketView';
import { lotoEngine } from './services/loto/lotoEngine';
import { NhauStage } from './components/nhau/NhauStage';
import { NhauStreamerPanel } from './components/nhau/NhauStreamerPanel';
import { nhauEngine } from './services/nhau/nhauEngine';
import {
  StreamConfig,
  Devotee,
  GiftEvent,
  LeaderboardEntry,
  CommentEvent,
  GiftCategory,
  TikTokLiveStatus,
  OfferRequest,
} from './types/temple';
import { soundEngine, formatUsernameForTts } from './services/soundEngine';
import { maskBanned } from './services/bannedWords';
import { detectWish, blessingFor, shouldAnswer } from './services/wishResponder';
import { pickSeat } from './services/seating';
import { LIKES_PER_RAIN } from './services/likeRain';

const SHARE_REMINDER_MS = 5 * 60 * 1000;
const IDLE_BLESSING_MS = 90 * 1000; // voice quiet this long -> blessing + share ask
const WELCOME_CHECK_MS = 6 * 1000;
const MAX_WAITING_JOINERS = 30;
const SEAT_AFTER_JOIN_MS = 10 * 1000;
const DEFAULT_CHANNEL_NAME = 'Tâm Tịnh Tâm An'; // until the owner saves their own in the dashboard
const SPOTLIGHT_COINS = 1; // any gift for now (small channel); raise when gifts get frequent
const POINTS_PER_COIN = 10; // merit board: a 1-coin rose = 10 comments

const RAIN_MS = 60 * 1000;
// Only the live stage page (Link source in LIVE Studio) makes sound by default; the dashboard stays silent so audio never doubles
const pageParams = new URLSearchParams(window.location.search);
const IS_STAGE_PAGE = pageParams.get('view') === 'stage' || pageParams.get('obs') === 'true';
const IS_TICKET_PAGE =
  typeof window !== 'undefined' &&
  (window.location.pathname.startsWith('/ve') ||
    window.location.pathname.startsWith('/ticket') ||
    pageParams.get('view') === 'ticket' ||
    pageParams.get('view') === 've');

const ROBE_COLORS = [
  '#38bdf8',
  '#10b981',
  '#a855f7',
  '#3b82f6',
  '#f43f5e',
  '#d97706',
  '#06b6d4',
  '#ec4899',
  '#6366f1',
  '#e2e8f0',
];


function MainApp() {
  const [config, setConfig] = useState<StreamConfig>({
    channelName: DEFAULT_CHANNEL_NAME,
    liveTitle: 'TÂM TỊNH TÂM AN',
    subTitle: 'Gõ "adidaphat" để vào lễ Phật',
    isConnected: true,
    autoTts: IS_STAGE_PAGE,
    voiceGender: 'female',
    ttsSpeed: 0.85,
    ttsPitch: 1.08,
    bellSoundEnabled: true,
    gongSoundEnabled: true,
    chantAmbientEnabled: false,
    bgmEnabled: IS_STAGE_PAGE,
    bgmVolume: 0.18,
    buddhistMusicTrack: 'chill',
    isDharmaLectureActive: false,
    displayRatio: '9:16',
    viewMode: 'dual',
  });

  // Standalone OBS mode check (?view=stage or ?obs=true)
  const [isStandaloneObs, setIsStandaloneObs] = useState(false);
  const [stageZoom, setStageZoom] = useState(1);

  // Active theme: 'loto' (Gánh hát Lô Tô) | 'chua' (Đi Chùa Online) | 'nhau' (Quán Nhậu 123 Dô)
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(
    (pageParams.get('theme') as AppTheme) || 'loto'
  );

  useEffect(() => {
    if (currentTheme === 'loto') {
      soundEngine.setVoice('vi-VN-HoaiMyNeural');
      setConfig((prev) => ({
        ...prev,
        channelName: prev.channelName === DEFAULT_CHANNEL_NAME || prev.channelName === 'QUÁN NHẬU 1 2 3 DÔ!' ? 'GÁNH HÁT LÔ TÔ HỘI CHỢ' : prev.channelName,
        liveTitle: 'GÁNH HÁT LÔ TÔ HỘI CHỢ',
        subTitle: 'Gõ "ve" để nhận vé may mắn và cùng KINH nào!',
      }));
    } else if (currentTheme === 'nhau') {
      soundEngine.setVoice('vi-VN-NamMinhNeural');
      setConfig((prev) => ({
        ...prev,
        channelName: prev.channelName === DEFAULT_CHANNEL_NAME || prev.channelName === 'GÁNH HÁT LÔ TÔ HỘI CHỢ' ? 'QUÁN NHẬU 1 2 3 DÔ!' : prev.channelName,
        liveTitle: 'QUÁN NHẬU BÌNH DÂN 1 2 3 DÔ!',
        subTitle: 'Gõ "dzo" để cụng ly cả quán nha!',
      }));
    } else {
      soundEngine.setVoice('vi-VN-NamMinhNeural');
      setConfig((prev) => ({
        ...prev,
        channelName: prev.channelName === 'GÁNH HÁT LÔ TÔ HỘI CHỢ' || prev.channelName === 'QUÁN NHẬU 1 2 3 DÔ!' ? DEFAULT_CHANNEL_NAME : prev.channelName,
        liveTitle: 'TÂM TỊNH TÂM AN',
        subTitle: 'Gõ "adidaphat" để vào lễ Phật',
      }));
    }
  }, [currentTheme]);
  useEffect(() => {
    if (!isStandaloneObs) return;
    const fit = () => setStageZoom(Math.min(window.innerWidth / 430, window.innerHeight / ((430 * 16) / 9)));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [isStandaloneObs]);

  // TikTok LIVE Connection State
  const [tikTokStatus, setTikTokStatus] = useState<TikTokLiveStatus>({
    isConnected: false,
    isConnecting: false,
    username: '',
    roomId: '',
    viewerCount: 0,
    totalLikes: 0,
    error: '',
  });

  // Empty initial state: floor and leaderboards are clean until people join/donate
  const [devotees, setDevotees] = useState<Devotee[]>([]);
  const [leaderboardDonors, setLeaderboardDonors] = useState<LeaderboardEntry[]>([]);
  // Merit board: 1 point per comment, POINTS_PER_COIN per gift coin; ordered by points (score)
  const addMerit = (username: string, points: number, avatarUrl = '', diamonds = 0) =>
    setLeaderboardDonors((prev) => {
      const key = username.toLowerCase();
      const found = prev.find((d) => d.username.toLowerCase() === key);
      const next = found
        ? prev.map((d) =>
            d === found
              ? { ...d, score: (d.score ?? 0) + points, diamonds: d.diamonds + diamonds, avatarUrl: avatarUrl || d.avatarUrl }
              : d
          )
        : [...prev, { username, displayName: maskBanned(username), diamonds, score: points, rank: prev.length + 1, avatarUrl }];
      return next.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    });

  // Likes fill a bar under the chant: every LIKES_PER_RAIN likes rain flowers for a minute
  const [likeProgress, setLikeProgress] = useState(0);
  const [rainUntil, setRainUntil] = useState(0);
  const likesRef = useRef(0);
  const lastTotalLikesRef = useRef<number | null>(null);
  const addLikes = (count: number) => {
    const total = likesRef.current + count;
    const rains = Math.floor(total / LIKES_PER_RAIN);
    likesRef.current = total % LIKES_PER_RAIN;
    setLikeProgress(likesRef.current);
    // More likes during a rain make it last longer
    if (rains > 0) setRainUntil((until) => Math.max(until, Date.now()) + rains * RAIN_MS);
  };
  const [comments, setComments] = useState<CommentEvent[]>([]);

  const [currentGift, setCurrentGift] = useState<GiftEvent | null>(null);
  const [offerers, setOfferers] = useState<GiftEvent[]>([]);
  // Everyone who should go up and offer incense (a gift or an "adidaphat" comment), newest last
  const [offerRequests, setOfferRequests] = useState<OfferRequest[]>([]);
  // A gift of SPOTLIGHT_COINS+ coins in one go (combos added up within 15 s) gets the close-up camera
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
    setSpotlightRequests((p) =>
      [...p, { id: `spot-${now}-${username}`, username, displayName: maskBanned(username), avatarUrl }].slice(-10)
    );
    soundEngine.playTempleBell(0.9);
  };
  const requestOffer = (username: string, avatarUrl = '') =>
    setOfferRequests((prev) =>
      [...prev, { id: `offer-${Date.now()}-${username}`, username, displayName: maskBanned(username), avatarUrl }].slice(-20)
    );
  const [auraIntensity, setAuraIntensity] = useState<number>(0.1);
  const [isGiftActive, setIsGiftActive] = useState<boolean>(false);
  const giftTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // Who commented or gave a gift recently, for the named share reminder (latest last)
  const recentInteractorsRef = useRef<Map<string, number>>(new Map());
  const noteInteractor = (name: string) => {
    const m = recentInteractorsRef.current;
    m.delete(name);
    m.set(name, Date.now());
    if (m.size > 50) m.delete(m.keys().next().value!);
  };

  // Newcomers take a free seat (or the longest-idle person's seat when full) and keep it; DevoteeCrowd walks them in
  const makeDevotee = (username: string, seat: number, extra: Partial<Devotee> = {}): Devotee => {
    const now = Date.now();
    return {
      id: `dev-${now}-${seat}`,
      username,
      displayName: maskBanned(username),
      joinedAt: now,
      lastActive: now,
      robeColor: ROBE_COLORS[seat % ROBE_COLORS.length],
      bowOffset: Math.random() * 0.9,
      seat,
      ...extra,
    };
  };
  // allowNew = false only updates people already in the hall
  const addOrUpdateDevotee = (username: string, update: (d?: Devotee) => Partial<Devotee>, allowNew = true) =>
    setDevotees((prev) => {
      const key = username.toLowerCase();
      const found = prev.find((d) => d.username.toLowerCase() === key);
      if (found) return prev.map((d) => (d === found ? { ...d, ...update(d), lastActive: Date.now() } : d));
      if (!allowNew) return prev;
      const { seat, evict } = pickSeat(prev);
      return [...prev.filter((d) => d !== evict), makeDevotee(username, seat, update())];
    });

  // Check URL params on mount for OBS Stage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'stage' || params.get('obs') === 'true') {
        setIsStandaloneObs(true);
        setConfig((prev) => ({ ...prev, viewMode: 'stage_only' }));
      }
    }
  }, []);

  // Starter patrons/players for Quán Nhậu & Lô Tô so the stream looks vibrant immediately
  useEffect(() => {
    if (devotees.length === 0) {
      if (currentTheme === 'nhau') {
        setDevotees([
          makeDevotee('Anh_Ba_SaiGon', 0, { displayName: 'Anh Ba' }),
          makeDevotee('Tuan_Ken_Beer', 1, { displayName: 'Tuấn Ken' }),
          makeDevotee('Hung_Bia_Hoi', 4, { displayName: 'Hùng Râu' }),
          makeDevotee('Mai_Phuong', 5, { displayName: 'Mai Phương' }),
        ]);
      } else if (currentTheme === 'loto') {
        setDevotees([
          makeDevotee('Huong_Giang', 0, { displayName: 'Hương Giang' }),
          makeDevotee('Minh_Tuan', 1, { displayName: 'Minh Tuấn' }),
          makeDevotee('Bao_Ngoc', 2, { displayName: 'Bảo Ngọc' }),
          makeDevotee('Hoang_Nam', 3, { displayName: 'Hoàng Nam' }),
        ]);
        lotoEngine.issueTicket('Huong_Giang', 'Hương Giang', '', undefined, true);
        lotoEngine.issueTicket('Minh_Tuan', 'Minh Tuấn', '', undefined, true);
        lotoEngine.issueTicket('Bao_Ngoc', 'Bảo Ngọc', '', undefined, true);
        lotoEngine.issueTicket('Hoang_Nam', 'Hoàng Nam', '', undefined, true);
      }
    }
  }, [currentTheme]);


  // Real Buddhist music background lifecycle
  useEffect(() => {
    if (config.bgmEnabled) {
      soundEngine.startBuddhistMusic(config.buddhistMusicTrack, config.bgmVolume);
    } else {
      soundEngine.stopBuddhistMusic();
    }
  }, [config.bgmEnabled, config.buddhistMusicTrack, config.bgmVolume]);


  useEffect(() => {
    soundEngine.setSpeechRate(config.ttsSpeed);
  }, [config.ttsSpeed]);

  // Smooth decay of aura
  useEffect(() => {
    if (auraIntensity > 0.1) {
      const interval = setInterval(() => {
        setAuraIntensity((prev) => Math.max(0.1, prev - 0.05));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [auraIntensity]);

  // Trigger Gift Event: "dù x1 hay x5 chỉ đọc 1 lần thôi"
  const handleTriggerGift = useCallback(
    (
      giftType: GiftCategory,
      giftName: string,
      prayerMeaning: string,
      username: string,
      countIncrement = 1,
      diamondsPerUnit = 1,
      avatarUrl = ''
    ) => {
      const cleanUser = username.trim() || 'Bạn';
      const now = Date.now();
      noteInteractor(cleanUser);

      let nextCombo = countIncrement;
      if (
        currentGift &&
        currentGift.username.toLowerCase() === cleanUser.toLowerCase() &&
        currentGift.giftType === giftType &&
        now - currentGift.timestamp < 4500
      ) {
        nextCombo = currentGift.comboCount + countIncrement;
      }

      const totalDiamonds = countIncrement * diamondsPerUnit;

      const newGift: GiftEvent = {
        id: `gift-${now}`,
        username: cleanUser,
        displayName: maskBanned(cleanUser),
        giftType,
        giftName,
        prayerMeaning,
        comboCount: nextCombo,
        diamonds: totalDiamonds,
        timestamp: now,
        avatarUrl,
      };

      setCurrentGift(newGift);
      // Newest giver kneels at the main mat (chủ lễ), the previous four move to the small mats
      requestOffer(cleanUser, avatarUrl);
      requestSpotlightIfBig(cleanUser, totalDiamonds, avatarUrl);
      setOfferers((prev) =>
        [newGift, ...prev.filter((o) => o.username.toLowerCase() !== cleanUser.toLowerCase())].slice(0, 5)
      );
      setIsGiftActive(true);
      setAuraIntensity(1);

      if (giftTimeoutRef.current) clearTimeout(giftTimeoutRef.current);
      giftTimeoutRef.current = setTimeout(() => {
        setIsGiftActive(false);
        setCurrentGift(null);
      }, 4000);

      // TOP THÀNH TÂM: every coin of a gift is worth 10 points
      addMerit(cleanUser, totalDiamonds * POINTS_PER_COIN, avatarUrl, totalDiamonds);

      if (currentTheme === 'nhau') {
        nhauEngine.addDonation(cleanUser, cleanUser, avatarUrl, giftName, totalDiamonds);
        const lowerGift = giftName.toLowerCase();
        if (lowerGift.includes('bánh') || lowerGift.includes('cake') || lowerGift.includes('nến') || lowerGift.includes('vương miện') || lowerGift.includes('crown')) {
          nhauEngine.triggerBirthday(cleanUser, `Đã tặng ${giftName} tổ chức sinh nhật linh đình!`, avatarUrl);
        }
      }

      if (currentTheme === 'loto') {
        // Feature 3: Upgrade donor to VIP Golden Ticket & Cage Sponsor ("Xin Vía Lồng Cầu")
        lotoEngine.upgradeToVip(cleanUser, cleanUser, avatarUrl, giftName, totalDiamonds);
        // Announce with AI voice to thank and hype the live room
        soundEngine.speak(
          `Cảm ơn đại gia ${formatUsernameForTts(cleanUser)} đã gửi tặng ${giftName}! Gánh hát đã nâng cấp Vé Vàng V.I.P và cho bạn xin vía lồng cầu ngay lập tức!`
        );
        // Spotlight the gifter's ticket on stage so everyone sees their new VIP ticket!
        lotoEngine.setSpotlightTicket(cleanUser);
      }

      // Update Devotee Crowd (in Lô Tô and Quán Nhậu, gift donors enter immediately as VIP)
      addOrUpdateDevotee(
        cleanUser,
        (d) => ({
          isVip: true,
          totalDiamonds: (d?.totalDiamonds || 0) + totalDiamonds,
          activeComment:
            currentTheme === 'nhau'
              ? `🍻 ${maskBanned(cleanUser)} bao ${giftName}`
              : currentTheme === 'loto'
              ? `🎫 ${maskBanned(cleanUser)} ủng hộ ${giftName}`
              : `${prayerMeaning} · ${maskBanned(cleanUser)} dâng ${giftName}`,
          commentTimestamp: now,
          avatarUrl: avatarUrl || d?.avatarUrl,
        }),
        currentTheme !== 'chua'
      );

      setTimeout(() => {
        setDevotees((prev) =>
          prev.map((d) =>
            d.username.toLowerCase() === cleanUser.toLowerCase() && d.commentTimestamp === now
              ? { ...d, activeComment: undefined }
              : d
          )
        );
      }, 4500);

      // Lotus chime sound effect
      soundEngine.playLotusBloom(0.7);
      if (nextCombo % 4 === 0 || giftType === 'dang_hoa_sen') {
        soundEngine.playTempleBell(0.85);
      }

      // Every gift is thanked by name (soundEngine dedupes combos and skips small gifts when busy)
      // The name and blessing are read when the close-up starts (onSpotlightStart); if it never starts
      // (no 3D, or it waits too long in line) they are read anyway after 20 s
      if (config.autoTts && !pendingThanksRef.current.has(cleanUser.toLowerCase())) {
        const key = cleanUser.toLowerCase();
        pendingThanksRef.current.set(key, { username: cleanUser, giftName, diamonds: totalDiamonds });
        setTimeout(() => readPendingThanks(cleanUser), 20000);
      }
    },
    [currentGift, config.autoTts]
  );

  const handleTriggerLotoGift = (username: string, giftName: string, count = 1) => {
    handleTriggerGift('dang_hoa_sen', giftName, 'Ủng hộ gánh Lô Tô', username, 1, count, '');
  };

  // Add Comment & Handle "adidaphat" Entry
  const handleAddComment = (username: string, commentText: string, avatarUrl = '') => {
    const cleanUser = username.trim() || 'Phật tử';
    noteInteractor(cleanUser);
    const now = Date.now();
    // Accepts "adidaphat", "A Di Đà Phật", "adi da phat 🙏", "Nam mô a di đà phật"...
    const isAdidaphat = commentText
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[đĐ]/g, 'd')
      .toLowerCase()
      .replace(/[^a-z]/g, '')
      .includes('adidaphat');

    const newComment: CommentEvent = {
      id: `c-${now}`,
      username: cleanUser,
      displayName: maskBanned(cleanUser),
      comment: maskBanned(commentText),
      timestamp: now,
    };

    setComments((prev) => [...prev.slice(-30), newComment]);
    addMerit(cleanUser, 1, avatarUrl); // one comment = one point

    let isLayVe = false;
    let isKinhClaim = false;
    if (currentTheme === 'loto') {
      const lower = commentText.toLowerCase().trim();
      isLayVe =
        lower.includes('layve') ||
        lower.includes('lay ve') ||
        lower.includes('lấy vé') ||
        lower.includes('xin ve') ||
        lower.includes('xin vé') ||
        lower.includes('cho ve') ||
        lower.includes('cho vé') ||
        lower === 've' ||
        lower === 'vé' ||
        lower.includes('cap ve') ||
        lower.includes('cấp vé') ||
        lower.includes('dò vé') ||
        lower.includes('do ve');

      isKinhClaim =
        lower === 'kinh' ||
        lower.includes('kinh roi') ||
        lower.includes('kinh rồi') ||
        lower.includes('trung roi') ||
        lower.includes('trúng rồi') ||
        lower === 'bingo' ||
        lower.includes('kinh loto') ||
        lower.includes('em kinh') ||
        lower.includes('tui kinh');

      const isPredictChan =
        lower === 'c' ||
        lower === 'chan' ||
        lower === 'chẵn' ||
        lower === 'so chan' ||
        lower === 'số chẵn';

      const isPredictLe =
        lower === 'l' ||
        lower === 'le' ||
        lower === 'lẻ' ||
        lower === 'so le' ||
        lower === 'số lẻ';

      if (isKinhClaim) {
        const res = lotoEngine.claimKinh(cleanUser, cleanUser, avatarUrl);
        if (!res.won && res.fakeEvent) {
          soundEngine.playMuoGong(1.0);
          if (config.autoTts) {
            soundEngine.speak(
              `Ối giời ơi bà con ơi! Báo động Kinh giả! Bạn ${formatUsernameForTts(cleanUser)} mới trúng có ${res.fakeEvent.maxRowMatched} con một hàng mà dám hô Kinh! Phạt ${res.fakeEvent.penaltyText}`
            );
          }
        }
      } else if (isPredictChan) {
        lotoEngine.submitPrediction(cleanUser, cleanUser, 'chan');
      } else if (isPredictLe) {
        lotoEngine.submitPrediction(cleanUser, cleanUser, 'le');
      } else if (isLayVe) {
        lotoEngine.issueTicket(cleanUser, cleanUser, avatarUrl);
        soundEngine.playLotusBloom(0.6);
        if (config.autoTts) {
          soundEngine.speak(`Đã cấp vé may mắn cho bạn ${formatUsernameForTts(cleanUser)}!`);
        }
      }
    } else if (currentTheme === 'nhau') {
      const lower = commentText.toLowerCase();
      if (lower.includes('dzo') || lower.includes('zo') || lower.includes('123') || lower.includes('uong') || lower.includes('cheers') || lower.includes('can ly')) {
        nhauEngine.triggerCheer();
      } else if (lower.includes('cmsn') || lower.includes('sinh nhat') || lower.includes('sinh nhật') || lower.includes('happy birthday') || lower.includes('snvv')) {
        let targetName = cleanUser;
        const match = commentText.match(/(?:cmsn|sinh nhật|sinh nhat|chúc mừng sinh nhật|snvv)\s+([A-Za-z0-9_À-ỹ\s]+)/i);
        if (match && match[1]?.trim()) {
          targetName = match[1].trim();
        }
        nhauEngine.triggerBirthday(targetName, commentText, avatarUrl);
      } else {
        nhauEngine.addConfession(cleanUser, commentText);
      }
    }

    const hasExistingTicket = currentTheme === 'loto' && lotoEngine.getTicketForUser(cleanUser) !== undefined;
    const allowNewDevotee =
      currentTheme === 'chua'
        ? isAdidaphat
        : currentTheme === 'loto'
        ? isLayVe || isKinhClaim || hasExistingTicket
        : true;

    addOrUpdateDevotee(
      cleanUser,
      (d) => ({
        activeComment: isLayVe
          ? `🎫 Nhận vé (${maskBanned(commentText)})`
          : isKinhClaim
          ? `🚨 HÔ KINH! (${maskBanned(commentText)})`
          : maskBanned(commentText),
        commentTimestamp: now,
        avatarUrl: avatarUrl || d?.avatarUrl,
      }),
      allowNewDevotee
    );

    // Answer a prayer in the comment with a blessing for that topic (never during a lecture, rate-limited)
    const wish = detectWish(commentText);
    if (wish && config.autoTts && !soundEngine.isDharmaLecturePlaying() && shouldAnswer(cleanUser)) {
      soundEngine.speakPreferredBuddhistVoice(blessingFor(wish, formatUsernameForTts(cleanUser), config.channelName));
    }

    setTimeout(() => {
      setDevotees((prev) =>
        prev.map((d) =>
          d.username.toLowerCase() === cleanUser.toLowerCase() && d.commentTimestamp === now
            ? { ...d, activeComment: undefined }
            : d
        )
      );
    }, 4500);

    if (isAdidaphat) {
      requestOffer(cleanUser, avatarUrl);
      soundEngine.playMuoGong(1.2); // no voice for adidaphat offerers: only gift givers are announced
    }
  };

  const handleAddDevotee = (username: string) => addOrUpdateDevotee(username, () => ({}));

  const handleFollow = (username: string) => {
    if (config.autoTts) soundEngine.readFollowThanks(username);
  };

  // Share reminder thanking up to 3 people who commented or gave gifts in the last 5 minutes, newest first
  const remindShare = () => {
    const since = Date.now() - SHARE_REMINDER_MS;
    const names = [...recentInteractorsRef.current]
      .filter(([, t]) => t > since)
      .map(([name]) => name)
      .reverse()
      .slice(0, 3);
    soundEngine.readShareReminder(names);
  };

  useEffect(() => {
    if (!config.autoTts) return;
    const interval = setInterval(() => remindShare(), SHARE_REMINDER_MS);
    // Quiet live (no one joining, nothing to answer): bless the viewers and ask them to share
    const idle = setInterval(() => {
      if (soundEngine.quietForMs() > IDLE_BLESSING_MS) soundEngine.readIdleBlessing();
    }, 15000);
    return () => {
      clearInterval(interval);
      clearInterval(idle);
    };
  }, [config.autoTts]);

  // Every newcomer is greeted, once per session: names wait in a list and every few seconds up to 6 are
  // greeted (3 names per sentence), oldest first, whenever the voice isn't backed up. During a lecture they wait.
  const newJoinersRef = useRef<string[]>([]);
  const greetedRef = useRef<Set<string>>(new Set());
  const handleJoin = (name: string, avatarUrl = '') => {
    if (currentTheme === 'loto') {
      lotoEngine.issueTicket(name, name, avatarUrl);
    } else if (currentTheme === 'nhau') {
      nhauEngine.addGuest(name, name, avatarUrl);
    }
    // Anyone still around 10s after joining kneels in the hall (commenting adidaphat seats them sooner)
    setTimeout(() => addOrUpdateDevotee(name, (d) => ({ avatarUrl: avatarUrl || d?.avatarUrl })), SEAT_AFTER_JOIN_MS);
    if (greetedRef.current.has(name) || newJoinersRef.current.includes(name)) return;
    // shortcut: in a flood only the newest MAX_WAITING_JOINERS wait; raise it if big rooms still miss people
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

  // Dashboard buttons drive the live stage page, which is the one that makes sound
  const sendControl = (action: string, text?: string) => {
    fetch('/api/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, text }),
    }).catch(() => {});
  };

  // Commands sent from the dashboard; only the live stage page (?view=stage) acts, so sound never doubles
  const handleControl = (action: string, text?: string, extra?: any) => {
    // The channel name applies on every page (dashboard field and the live stage's title and voice)
    if (action === 'setName' && text) {
      setConfig((prev) => ({ ...prev, channelName: text }));
      soundEngine.setChannelName(text);
    }
    if (action === 'setTheme' && text) {
      setCurrentTheme(text as AppTheme);
    }
    if (action === 'loto_spin') lotoEngine.spinNext();
    if (action === 'loto_reset') lotoEngine.resetRound();
    if (action === 'loto_auto_spin') lotoEngine.setAutoSpin(text === '1' || text === 'true');
    if (action === 'loto_interval' && Number(text) > 0) lotoEngine.setSpinInterval(Number(text));
    if (action === 'loto_dance') {
      const isStop = text === 'stop' || extra?.danceStyle === 'stop';
      if (!isStop) {
        const style = (extra?.danceStyle || text || 'fan') as any;
        const dur = extra?.danceDuration || 15000;
        lotoEngine.triggerDance(
          style,
          dur,
          extra?.danceDonorName,
          extra?.danceGiftName,
          extra?.customVideoUrl,
          extra?.isGreenScreen
        );
      } else {
        lotoEngine.stopDance();
      }
    }

    if (!isStandaloneObs) return;
    if (action === 'speak' && text) soundEngine.speakNow(text);
    if (action === 'shareReminder') remindShare();
    if (action === 'bell') handleRingBell();
    if (action === 'setRate' && Number(text) > 0) {
      setConfig((prev) => ({ ...prev, ttsSpeed: Math.min(1.15, Math.max(0.6, Number(text))) }));
    }
  };

  const handleResetCrowd = () => {
    setDevotees([]);
    setLeaderboardDonors([]);
  };

  const handleRingBell = () => {
    soundEngine.playTempleBell(0.9);
    setAuraIntensity(0.7);
  };

  const handlePlayGong = () => {
    soundEngine.playMuoGong(0.85);
  };


  // Latest handlers via ref so the SSE connection opens once instead of on every render
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('demo') !== '1') return;
    (window as unknown as { __dco: unknown }).__dco = {
      gift: (name: string, coins: number, avatar = '') =>
        handlersRef.current.handleTriggerGift('dang_hoa_sen', 'Hoa Hồng', 'Cầu bình an', name, 1, coins, avatar),
      comment: (name: string, text: string) => handlersRef.current.handleAddComment(name, text),
    };
  }, []);

  const handlersRef = useRef({ handleTriggerGift, handleAddComment, handleFollow, handleControl, handleJoin, addLikes });
  handlersRef.current = { handleTriggerGift, handleAddComment, handleFollow, handleControl, handleJoin, addLikes };

  // Real-time TikTok LIVE SSE Event Listener
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/tiktok/events');

      eventSource.addEventListener('status', (e) => {
        try {
          const data = JSON.parse(e.data);
          setTikTokStatus(data);
        } catch (err) {
          console.error('SSE status parse error', err);
        }
      });

      eventSource.addEventListener('chat', (e) => {
        try {
          const data = JSON.parse(e.data);
          const name = data.nickname || data.username || 'Phật tử';
          handlersRef.current.handleAddComment(name, data.comment || '', data.avatar || '');
        } catch (err) {
          console.error('SSE chat parse error', err);
        }
      });

      eventSource.addEventListener('gift', (e) => {
        try {
          const data = JSON.parse(e.data);
          const name = data.nickname || data.username || 'Bạn';
          const rawGiftName = data.giftName || 'Hoa Sen';
          const diamondCount = data.diamondCount || 1;
          const repeatCount = data.repeatCount || 1;

          // Intelligently map TikTok gift name to Buddhist Temple aesthetic
          let giftType: GiftCategory = 'dang_hoa_sen';
          let displayGiftName = rawGiftName;
          let prayerMeaning = 'Cầu Gia Đạo Bình An Cát Tường';

          const lowerName = rawGiftName.toLowerCase();
          if (lowerName.includes('rose') || lowerName.includes('hồng')) {
            giftType = 'dang_hoa_sen';
            displayGiftName = 'Hoa Hồng Cầu An';
            prayerMeaning = 'Cầu Bình An & Cát Tường';
          } else if (lowerName.includes('lotus') || lowerName.includes('sen')) {
            giftType = 'dang_hoa_sen';
            displayGiftName = 'Hoa Sen Bách Gia';
            prayerMeaning = 'Cầu Phúc Đức Vô Lượng';
          } else if (lowerName.includes('candle') || lowerName.includes('nến') || lowerName.includes('hương')) {
            giftType = 'dang_huong';
            displayGiftName = 'Nén Hương & Đèn Dầu';
            prayerMeaning = 'Cầu Trí Tuệ Sáng Suốt';
          } else if (lowerName.includes('heart') || lowerName.includes('tim') || lowerName.includes('love')) {
            giftType = 'ban_tim';
            displayGiftName = 'Trái Tim Bồ Đề';
            prayerMeaning = 'Phóng Sanh Cát Tường';
          } else if (lowerName.includes('peach') || lowerName.includes('đào')) {
            giftType = 'qua_dao';
            displayGiftName = 'Quả Đào Trường Thọ';
            prayerMeaning = 'Cầu Sức Khỏe Cho Cha Mẹ';
          } else if (diamondCount >= 100) {
            giftType = 'le_phat';
            displayGiftName = rawGiftName;
            prayerMeaning = 'Đại Công Đức Thập Phương';
          } else {
            giftType = 'dang_hoa_sen';
            displayGiftName = rawGiftName;
            prayerMeaning = 'Cầu Vạn Sự Như Ý';
          }

          handlersRef.current.handleTriggerGift(
            giftType,
            displayGiftName,
            prayerMeaning,
            name,
            repeatCount,
            diamondCount,
            data.avatar || ''
          );
        } catch (err) {
          console.error('SSE gift parse error', err);
        }
      });

      eventSource.addEventListener('member', (e) => {
        try {
          const data = JSON.parse(e.data);
          const name = data.nickname || data.username;
          if (name) handlersRef.current.handleJoin(name, data.avatar || '');
        } catch (err) {
          console.error('SSE member parse error', err);
        }
      });

      eventSource.addEventListener('control', (e) => {
        try {
          const data = JSON.parse(e.data);
          handlersRef.current.handleControl(data.action, data.text, data);
        } catch (err) {
          console.error('SSE control parse error', err);
        }
      });

      eventSource.addEventListener('loto_update', (e) => {
        try {
          const data = JSON.parse(e.data);
          lotoEngine.applyRemoteState(data);
        } catch (err) {
          console.error('SSE loto_update parse error', err);
        }
      });

      eventSource.addEventListener('follow', (e) => {
        try {
          const data = JSON.parse(e.data);
          const name = data.nickname || data.username;
          if (name) handlersRef.current.handleFollow(name);
        } catch (err) {
          console.error('SSE follow parse error', err);
        }
      });

      eventSource.addEventListener('roomUser', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (typeof data.viewerCount === 'number') {
            setTikTokStatus((prev) => ({ ...prev, viewerCount: data.viewerCount }));
          }
        } catch (err) {
          console.error('SSE roomUser parse error', err);
        }
      });

      eventSource.addEventListener('like', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (typeof data.totalLikes === 'number') {
            setTikTokStatus((prev) => ({ ...prev, totalLikes: data.totalLikes }));
          }
          // Count by the room's running total when TikTok sends it: busy rooms drop some per-user like
          // events, but every event carries the total, so nothing is missed. Otherwise use this event's count.
          const count = Number(data.likeCount) || 1;
          const total = Number(data.totalLikes) || 0;
          if (total > 0) {
            if (lastTotalLikesRef.current === null) lastTotalLikesRef.current = total - count;
            const delta = total - lastTotalLikesRef.current;
            if (delta > 0) {
              lastTotalLikesRef.current = total;
              handlersRef.current.addLikes(delta);
            }
          } else {
            handlersRef.current.addLikes(count);
          }
        } catch (err) {
          console.error('SSE like parse error', err);
        }
      });

      eventSource.addEventListener('loto_win', (e) => {
        try {
          const winner = JSON.parse(e.data);
          lotoEngine.setExternalWinner(winner);
          addOrUpdateDevotee(
            winner.username,
            () => ({ displayName: winner.displayName, avatarUrl: winner.avatarUrl }),
            true
          );
        } catch (err) {
          console.error('SSE loto_win error', err);
        }
      });

      eventSource.addEventListener('loto_new_player', (e) => {
        try {
          const player = JSON.parse(e.data);
          lotoEngine.issueTicket(
            player.username,
            player.displayName,
            player.avatarUrl || '',
            player.grid,
            true,
            player.isVip,
            player.vipGiftName,
            player.vipCoins
          );
          addOrUpdateDevotee(
            player.username,
            () => ({
              displayName: player.displayName,
              avatarUrl: player.avatarUrl,
              isVip: !!player.isVip,
            }),
            true
          );
        } catch (err) {
          console.error('SSE loto_new_player error', err);
        }
      });

      eventSource.addEventListener('loto_initial_players', (e) => {
        try {
          const list = JSON.parse(e.data);
          if (Array.isArray(list)) {
            list.forEach((p: any) => {
              lotoEngine.issueTicket(
                p.username,
                p.displayName,
                p.avatarUrl || '',
                p.grid,
                true,
                p.isVip,
                p.vipGiftName,
                p.vipCoins
              );
              addOrUpdateDevotee(
                p.username,
                () => ({
                  displayName: p.displayName,
                  avatarUrl: p.avatarUrl,
                  isVip: !!p.isVip,
                }),
                true
              );
            });
          }
        } catch (err) {
          console.error('SSE loto_initial_players error', err);
        }
      });

      eventSource.addEventListener('loto_fake_kinh', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.username) {
            lotoEngine.claimKinh(data.username, data.displayName, data.avatarUrl);
          }
        } catch (err) {
          console.error('SSE loto_fake_kinh error', err);
        }
      });

      eventSource.addEventListener('loto_predict', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.username && (data.choice === 'chan' || data.choice === 'le')) {
            lotoEngine.submitPrediction(data.username, data.displayName || data.username, data.choice, true);
          }
        } catch (err) {
          console.error('SSE loto_predict error', err);
        }
      });

      eventSource.addEventListener('loto_clear_players', () => {
        lotoEngine.clearAllTickets(true);
        setDevotees([]);
      });
    } catch (err) {
      console.error('SSE connection error:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Connect to real TikTok LIVE room
  const handleConnectTikTok = async (username: string) => {
    setTikTokStatus((prev) => ({ ...prev, isConnecting: true, error: '' }));
    try {
      const res = await fetch('/api/tiktok/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const result = await res.json();
      if (!result.success) {
        setTikTokStatus((prev) => ({
          ...prev,
          isConnecting: false,
          error: result.error || 'Không thể kết nối phòng Live TikTok',
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTikTokStatus((prev) => ({ ...prev, isConnecting: false, error: msg }));
    }
  };

  // Disconnect from TikTok LIVE
  const handleDisconnectTikTok = async () => {
    try {
      await fetch('/api/tiktok/disconnect', { method: 'POST' });
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  const handleToggleBgm = () => {
    setConfig((prev) => ({ ...prev, bgmEnabled: !prev.bgmEnabled }));
  };

  // Standalone OBS mode: renders 100% clean full-screen stage for OBS browser source
  if (isStandaloneObs) {
    return (
      <div className="w-screen h-screen bg-[#070302] flex items-center justify-center p-0 m-0 overflow-hidden">
        {/* Stage is laid out at 430px wide; zoom it to fill the 1080x1920 capture */}
        <div className="w-[430px] flex flex-col justify-center" style={{ zoom: stageZoom }}>
          {currentTheme === 'loto' ? (
            <LotoStage
              config={config}
              devotees={devotees}
              currentGift={currentGift}
              likeProgress={likeProgress}
              rainUntil={rainUntil}
              isBgmPlaying={config.bgmEnabled}
              onToggleBgm={handleToggleBgm}
            />
          ) : currentTheme === 'nhau' ? (
            <NhauStage
              config={config}
              devotees={devotees}
              currentGift={currentGift}
              likeProgress={likeProgress}
              rainUntil={rainUntil}
              isBgmPlaying={config.bgmEnabled}
              onToggleBgm={handleToggleBgm}
            />
          ) : (
            <ChanhDienStage
              onSpotlightStart={readPendingThanks}
              spotlightRequests={spotlightRequests}
              likeProgress={likeProgress}
              rainUntil={rainUntil}
              config={config}
              devotees={devotees}
              offerers={offerers}
              offerRequests={offerRequests}
              currentGift={currentGift}
              leaderboardDonors={leaderboardDonors}
              auraIntensity={auraIntensity}
              isGiftActive={isGiftActive}
              onRingBell={handleRingBell}
              onPlayGong={handlePlayGong}
              onToggleBgm={handleToggleBgm}
              isBgmPlaying={config.bgmEnabled}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070302] text-stone-100 flex flex-col font-sans">
      <HeaderNav
        viewMode={config.viewMode}
        onChangeViewMode={(mode) => setConfig((prev) => ({ ...prev, viewMode: mode }))}
        currentTheme={currentTheme}
        onChangeTheme={(theme) => {
          setCurrentTheme(theme);
          sendControl('setTheme', theme);
        }}
      />

      <main className="flex-1 p-2 md:p-6 max-w-7xl mx-auto w-full flex flex-col">
        {config.viewMode === 'dual' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
            {/* Left: 9:16 Vertical TikTok Live Stage */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[430px]">
                {currentTheme === 'loto' ? (
                  <LotoStage
                    config={config}
                    devotees={devotees}
                    currentGift={currentGift}
                    likeProgress={likeProgress}
                    rainUntil={rainUntil}
                    isBgmPlaying={config.bgmEnabled}
                    onToggleBgm={handleToggleBgm}
                  />
                ) : currentTheme === 'nhau' ? (
                  <NhauStage
                    config={config}
                    devotees={devotees}
                    currentGift={currentGift}
                    likeProgress={likeProgress}
                    rainUntil={rainUntil}
                    isBgmPlaying={config.bgmEnabled}
                    onToggleBgm={handleToggleBgm}
                  />
                ) : (
                  <ChanhDienStage
                    onSpotlightStart={readPendingThanks}
                    spotlightRequests={spotlightRequests}
                    likeProgress={likeProgress}
                    rainUntil={rainUntil}
                    config={config}
                    devotees={devotees}
                    offerers={offerers}
                    offerRequests={offerRequests}
                    currentGift={currentGift}
                    leaderboardDonors={leaderboardDonors}
                    auraIntensity={auraIntensity}
                    isGiftActive={isGiftActive}
                    onRingBell={handleRingBell}
                    onPlayGong={handlePlayGong}
                    onToggleBgm={handleToggleBgm}
                    isBgmPlaying={config.bgmEnabled}
                  />
                )}
              </div>
            </div>

            {/* Right: Streamer Deck + Theme Specific Panel */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {currentTheme === 'loto' && (
                <LotoStreamerPanel
                  onAddDevotee={(name, avatar) =>
                    addOrUpdateDevotee(name, (d) => ({ avatarUrl: avatar || d?.avatarUrl }), true)
                  }
                  onTriggerGift={handleTriggerLotoGift}
                  onResetCrowd={handleResetCrowd}
                />
              )}
              {currentTheme === 'nhau' && (
                <NhauStreamerPanel
                  onAddDevotee={(name, avatar) =>
                    addOrUpdateDevotee(name, (d) => ({ avatarUrl: avatar || d?.avatarUrl }), true)
                  }
                />
              )}
              <div className="h-[680px]">
                <StreamerDeck
                  config={config}
                  onSaveChannelName={(name) => sendControl('setName', name)}
                  onUpdateConfig={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
                  tikTokStatus={tikTokStatus}
                  onConnectTikTok={handleConnectTikTok}
                  onDisconnectTikTok={handleDisconnectTikTok}
                />
              </div>
            </div>
          </div>
        ) : config.viewMode === 'stage_only' ? (
          <div className="flex-1 flex items-center justify-center py-2">
            <div className="w-full max-w-[430px]">
              {currentTheme === 'loto' ? (
                <LotoStage
                  config={config}
                  devotees={devotees}
                  currentGift={currentGift}
                  likeProgress={likeProgress}
                  rainUntil={rainUntil}
                  isBgmPlaying={config.bgmEnabled}
                  onToggleBgm={handleToggleBgm}
                />
              ) : currentTheme === 'nhau' ? (
                <NhauStage
                  config={config}
                  devotees={devotees}
                  currentGift={currentGift}
                  likeProgress={likeProgress}
                  rainUntil={rainUntil}
                  isBgmPlaying={config.bgmEnabled}
                  onToggleBgm={handleToggleBgm}
                />
              ) : (
                <ChanhDienStage
                  onSpotlightStart={readPendingThanks}
                  spotlightRequests={spotlightRequests}
                  likeProgress={likeProgress}
                  rainUntil={rainUntil}
                  config={config}
                  devotees={devotees}
                  offerers={offerers}
                  offerRequests={offerRequests}
                  currentGift={currentGift}
                  leaderboardDonors={leaderboardDonors}
                  auraIntensity={auraIntensity}
                  isGiftActive={isGiftActive}
                  onRingBell={handleRingBell}
                  onPlayGong={handlePlayGong}
                  onToggleBgm={handleToggleBgm}
                  isBgmPlaying={config.bgmEnabled}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col gap-4">
            {currentTheme === 'loto' && (
              <LotoStreamerPanel
                onAddDevotee={(name, avatar) =>
                  addOrUpdateDevotee(name, (d) => ({ avatarUrl: avatar || d?.avatarUrl }), true)
                }
                onTriggerGift={handleTriggerLotoGift}
                onResetCrowd={handleResetCrowd}
              />
            )}
            {currentTheme === 'nhau' && (
              <NhauStreamerPanel
                onAddDevotee={(name, avatar) =>
                  addOrUpdateDevotee(name, (d) => ({ avatarUrl: avatar || d?.avatarUrl }), true)
                }
              />
            )}
            <div className="h-[750px]">
              <StreamerDeck
                config={config}
                onSaveChannelName={(name) => sendControl('setName', name)}
                onUpdateConfig={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
                tikTokStatus={tikTokStatus}
                onConnectTikTok={handleConnectTikTok}
                onDisconnectTikTok={handleDisconnectTikTok}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  if (IS_TICKET_PAGE) {
    return <MobileLotoTicketView />;
  }
  return <MainApp />;
}

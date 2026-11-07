import { useCallback } from 'react';
import { AppTheme } from '../components/HeaderNav';
import { lotoEngine } from '../services/loto/lotoEngine';
import { nhauEngine } from '../services/nhau/nhauEngine';
import { soundEngine, formatUsernameForTts } from '../services/soundEngine';
import { maskBanned } from '../services/bannedWords';
import { detectWish, blessingFor, shouldAnswer } from '../services/wishResponder';
import { processThemeSpecificComment } from './useStreamCommentHelper';
import {
  StreamConfig,
  Devotee,
  GiftEvent,
  CommentEvent,
  GiftCategory,
} from '../types/temple';

const POINTS_PER_COIN = 10;

interface StreamActionsDeps {
  currentTheme: AppTheme;
  config: StreamConfig;
  currentGift: GiftEvent | null;
  isStandaloneObs: boolean;
  giftTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  pendingThanksRef: React.MutableRefObject<Map<string, { username: string; giftName: string; diamonds: number }>>;
  noteInteractor: (name: string) => void;
  requestOffer: (username: string, avatarUrl?: string) => void;
  requestSpotlightIfBig: (username: string, coins: number, avatarUrl?: string) => void;
  readPendingThanks: (username: string) => void;
  addMerit: (username: string, points: number, avatarUrl?: string, diamonds?: number) => void;
  addOrUpdateDevotee: (username: string, update: (d?: Devotee) => Partial<Devotee>, allowNew?: boolean) => void;
  remindShare: () => void;
  handleRingBell: () => void;
  setCurrentGift: React.Dispatch<React.SetStateAction<GiftEvent | null>>;
  setOfferers: React.Dispatch<React.SetStateAction<GiftEvent[]>>;
  setIsGiftActive: React.Dispatch<React.SetStateAction<boolean>>;
  setAuraIntensity: React.Dispatch<React.SetStateAction<number>>;
  setDevotees: React.Dispatch<React.SetStateAction<Devotee[]>>;
  setComments: React.Dispatch<React.SetStateAction<CommentEvent[]>>;
  setConfig: React.Dispatch<React.SetStateAction<StreamConfig>>;
  setCurrentTheme: React.Dispatch<React.SetStateAction<AppTheme>>;
}

export function useStreamActions(deps: StreamActionsDeps) {
  const {
    currentTheme, config, currentGift, isStandaloneObs, giftTimeoutRef, pendingThanksRef,
    noteInteractor, requestOffer, requestSpotlightIfBig, readPendingThanks, addMerit,
    addOrUpdateDevotee, remindShare, handleRingBell, setCurrentGift, setOfferers,
    setIsGiftActive, setAuraIntensity, setDevotees, setComments, setConfig, setCurrentTheme,
  } = deps;

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
      const nextCombo =
        currentGift &&
        currentGift.username.toLowerCase() === cleanUser.toLowerCase() &&
        currentGift.giftType === giftType &&
        now - currentGift.timestamp < 4500
          ? currentGift.comboCount + countIncrement
          : countIncrement;
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
      addMerit(cleanUser, totalDiamonds * POINTS_PER_COIN, avatarUrl, totalDiamonds);

      if (currentTheme === 'nhau') {
        nhauEngine.addDonation(cleanUser, cleanUser, avatarUrl, giftName, totalDiamonds);
        const lowerGift = giftName.toLowerCase();
        if (
          lowerGift.includes('bánh') || lowerGift.includes('cake') ||
          lowerGift.includes('nến') || lowerGift.includes('vương miện') || lowerGift.includes('crown')
        ) {
          nhauEngine.triggerBirthday(cleanUser, `Đã tặng ${giftName} tổ chức sinh nhật linh đình!`, avatarUrl);
        }
      }
      if (currentTheme === 'loto') {
        lotoEngine.upgradeToVip(cleanUser, cleanUser, avatarUrl, giftName, totalDiamonds);
        soundEngine.speak(
          `Cảm ơn đại gia ${formatUsernameForTts(cleanUser)} đã gửi tặng ${giftName}! Gánh hát đã nâng cấp Vé Vàng V.I.P và cho bạn xin vía lồng cầu ngay lập tức!`
        );
        lotoEngine.setSpotlightTicket(cleanUser);
      }
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
      soundEngine.playLotusBloom(0.7);
      if (nextCombo % 4 === 0 || giftType === 'dang_hoa_sen') soundEngine.playTempleBell(0.85);
      if (config.autoTts && !pendingThanksRef.current.has(cleanUser.toLowerCase())) {
        pendingThanksRef.current.set(cleanUser.toLowerCase(), {
          username: cleanUser,
          giftName,
          diamonds: totalDiamonds,
        });
        setTimeout(() => readPendingThanks(cleanUser), 20000);
      }
    },
    [currentGift, config.autoTts, currentTheme]
  );

  const handleAddComment = (username: string, commentText: string, avatarUrl = '') => {
    const cleanUser = username.trim() || 'Phật tử';
    noteInteractor(cleanUser);
    const now = Date.now();
    const isAdidaphat = commentText
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[đĐ]/g, 'd')
      .toLowerCase()
      .replace(/[^a-z]/g, '')
      .includes('adidaphat');
    setComments((prev) => [
      ...prev.slice(-30),
      { id: `c-${now}`, username: cleanUser, displayName: maskBanned(cleanUser), comment: maskBanned(commentText), timestamp: now },
    ]);
    addMerit(cleanUser, 1, avatarUrl);
    const { isLayVe, isKinhClaim } = processThemeSpecificComment(
      currentTheme,
      cleanUser,
      commentText,
      avatarUrl,
      config.autoTts
    );
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
      currentTheme === 'chua' ? isAdidaphat : true
    );
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
    }, 8000);
    if (isAdidaphat) {
      requestOffer(cleanUser, avatarUrl);
      soundEngine.playMuoGong(1.2);
    }
  };

  const handleControl = (action: string, text?: string, extra?: any) => {
    if (action === 'setName' && text) {
      setConfig((prev) => ({ ...prev, channelName: text }));
      soundEngine.setChannelName(text);
    }
    if (action === 'setTheme' && text) setCurrentTheme(text as AppTheme);
    if (action === 'loto_spin') lotoEngine.spinNext();
    if (action === 'loto_reset') lotoEngine.resetRound();
    if (action === 'loto_auto_spin') lotoEngine.setAutoSpin(text === '1' || text === 'true');
    if (action === 'loto_interval' && Number(text) > 0) lotoEngine.setSpinInterval(Number(text));
    if (action === 'simulate_chat' && text) {
      handleAddComment(extra?.displayName || extra?.username || 'Khán giả', text, extra?.avatarUrl || '');
    }
    if (action === 'loto_dance') {
      if (text === 'stop' || extra?.danceStyle === 'stop') lotoEngine.stopDance();
      else {
        lotoEngine.triggerDance(
          (extra?.danceStyle || text || 'fan') as any,
          extra?.danceDuration || 15000,
          extra?.danceDonorName,
          extra?.danceGiftName,
          extra?.customVideoUrl,
          extra?.isGreenScreen
        );
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

  return { handleTriggerGift, handleAddComment, handleControl };
}

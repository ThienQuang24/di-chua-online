import { Devotee, GiftCategory, StreamConfig } from '../types/temple';
import { AppTheme } from '../components/HeaderNav';
import { lotoEngine } from '../services/loto/lotoEngine';
import { nhauEngine } from '../services/nhau/nhauEngine';
import { soundEngine, formatUsernameForTts } from '../services/soundEngine';
import { maskBanned } from '../services/bannedWords';

const ROBE_COLORS = [
  '#38bdf8', '#10b981', '#a855f7', '#3b82f6', '#f43f5e',
  '#d97706', '#06b6d4', '#ec4899', '#6366f1', '#e2e8f0',
];

export const DEFAULT_CHANNEL_NAME = 'Tâm Tịnh Tâm An';

export function createInitialStreamConfig(isStagePage: boolean): StreamConfig {
  return {
    channelName: DEFAULT_CHANNEL_NAME,
    liveTitle: 'TÂM TỊNH TÂM AN',
    subTitle: 'Gõ "adidaphat" để vào lễ Phật',
    isConnected: true,
    autoTts: isStagePage,
    voiceGender: 'female',
    ttsSpeed: 0.85,
    ttsPitch: 1.08,
    bellSoundEnabled: true,
    gongSoundEnabled: true,
    chantAmbientEnabled: false,
    bgmEnabled: isStagePage,
    bgmVolume: 0.18,
    buddhistMusicTrack: 'chill',
    isDharmaLectureActive: false,
    displayRatio: '9:16',
    viewMode: 'dual',
  };
}

export function applyThemeToStreamConfig(currentTheme: AppTheme, prev: StreamConfig): StreamConfig {
  if (currentTheme === 'loto') {
    soundEngine.setVoice('vi-VN-HoaiMyNeural');
    return {
      ...prev,
      channelName: prev.channelName === DEFAULT_CHANNEL_NAME || prev.channelName === 'QUÁN NHẬU 1 2 3 DÔ!' ? 'GÁNH HÁT LÔ TÔ HỘI CHỢ' : prev.channelName,
      liveTitle: 'GÁNH HÁT LÔ TÔ HỘI CHỢ',
      subTitle: 'Gõ "ve" để nhận vé may mắn và cùng KINH nào!',
    };
  }
  if (currentTheme === 'nhau') {
    soundEngine.setVoice('vi-VN-NamMinhNeural');
    return {
      ...prev,
      channelName: prev.channelName === DEFAULT_CHANNEL_NAME || prev.channelName === 'GÁNH HÁT LÔ TÔ HỘI CHỢ' ? 'QUÁN NHẬU 1 2 3 DÔ!' : prev.channelName,
      liveTitle: 'QUÁN NHẬU BÌNH DÂN 1 2 3 DÔ!',
      subTitle: 'Gõ "dzo" để cụng ly cả quán nha!',
    };
  }
  soundEngine.setVoice('vi-VN-NamMinhNeural');
  return {
    ...prev,
    channelName: prev.channelName === 'GÁNH HÁT LÔ TÔ HỘI CHỢ' || prev.channelName === 'QUÁN NHẬU 1 2 3 DÔ!' ? DEFAULT_CHANNEL_NAME : prev.channelName,
    liveTitle: 'TÂM TỊNH TÂM AN',
    subTitle: 'Gõ "adidaphat" để vào lễ Phật',
  };
}

export function makeDevotee(username: string, seat: number, extra: Partial<Devotee> = {}): Devotee {
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
}

export function getStarterDevoteesForTheme(theme: AppTheme): Devotee[] {
  if (theme === 'nhau') {
    return [
      makeDevotee('Anh_Ba_SaiGon', 0, { displayName: 'Anh Ba' }),
      makeDevotee('Tuan_Ken_Beer', 1, { displayName: 'Tuấn Ken' }),
      makeDevotee('Hung_Bia_Hoi', 4, { displayName: 'Hùng Râu' }),
      makeDevotee('Mai_Phuong', 5, { displayName: 'Mai Phương' }),
    ];
  }
  if (theme === 'loto') {
    lotoEngine.issueTicket('Huong_Giang', 'Hương Giang', '', undefined, true);
    lotoEngine.issueTicket('Minh_Tuan', 'Minh Tuấn', '', undefined, true);
    lotoEngine.issueTicket('Bao_Ngoc', 'Bảo Ngọc', '', undefined, true);
    lotoEngine.issueTicket('Hoang_Nam', 'Hoàng Nam', '', undefined, true);
    return [
      makeDevotee('Huong_Giang', 0, { displayName: 'Hương Giang' }),
      makeDevotee('Minh_Tuan', 1, { displayName: 'Minh Tuấn' }),
      makeDevotee('Bao_Ngoc', 2, { displayName: 'Bảo Ngọc' }),
      makeDevotee('Hoang_Nam', 3, { displayName: 'Hoàng Nam' }),
    ];
  }
  return [];
}

export function mapTikTokGiftToTemple(rawGiftName: string, diamondCount: number): {
  giftType: GiftCategory;
  displayGiftName: string;
  prayerMeaning: string;
} {
  const lowerName = rawGiftName.toLowerCase();
  if (lowerName.includes('rose') || lowerName.includes('hồng')) {
    return { giftType: 'dang_hoa_sen', displayGiftName: 'Hoa Hồng Cầu An', prayerMeaning: 'Cầu Bình An & Cát Tường' };
  }
  if (lowerName.includes('lotus') || lowerName.includes('sen')) {
    return { giftType: 'dang_hoa_sen', displayGiftName: 'Hoa Sen Bách Gia', prayerMeaning: 'Cầu Phúc Đức Vô Lượng' };
  }
  if (lowerName.includes('candle') || lowerName.includes('nến') || lowerName.includes('hương')) {
    return { giftType: 'dang_huong', displayGiftName: 'Nén Hương & Đèn Dầu', prayerMeaning: 'Cầu Trí Tuệ Sáng Suốt' };
  }
  if (lowerName.includes('heart') || lowerName.includes('tim') || lowerName.includes('love')) {
    return { giftType: 'ban_tim', displayGiftName: 'Trái Tim Bồ Đề', prayerMeaning: 'Phóng Sanh Cát Tường' };
  }
  if (lowerName.includes('peach') || lowerName.includes('đào')) {
    return { giftType: 'qua_dao', displayGiftName: 'Quả Đào Trường Thọ', prayerMeaning: 'Cầu Sức Khỏe Cho Cha Mẹ' };
  }
  if (diamondCount >= 100) {
    return { giftType: 'le_phat', displayGiftName: rawGiftName, prayerMeaning: 'Đại Công Đức Thập Phương' };
  }
  return { giftType: 'dang_hoa_sen', displayGiftName: rawGiftName, prayerMeaning: 'Cầu Vạn Sự Như Ý' };
}

export function processThemeSpecificComment(
  currentTheme: AppTheme,
  cleanUser: string,
  commentText: string,
  avatarUrl: string,
  autoTts: boolean
): { isLayVe: boolean; isKinhClaim: boolean } {
  let isLayVe = false;
  let isKinhClaim = false;

  if (currentTheme === 'loto') {
    const lower = commentText.toLowerCase().trim();
    isLayVe =
      lower.includes('layve') || lower.includes('lay ve') || lower.includes('lấy vé') ||
      lower.includes('xin ve') || lower.includes('xin vé') || lower.includes('cho ve') ||
      lower.includes('cho vé') || lower === 've' || lower === 'vé' ||
      lower.includes('cap ve') || lower.includes('cấp vé') || lower.includes('dò vé') || lower.includes('do ve');

    isKinhClaim =
      lower === 'kinh' || lower.includes('kinh roi') || lower.includes('kinh rồi') ||
      lower.includes('trung roi') || lower.includes('trúng rồi') || lower === 'bingo' ||
      lower.includes('kinh loto') || lower.includes('em kinh') || lower.includes('tui kinh');

    const isPredictChan = lower === 'c' || lower === 'chan' || lower === 'chẵn' || lower === 'so chan' || lower === 'số chẵn';
    const isPredictLe = lower === 'l' || lower === 'le' || lower === 'lẻ' || lower === 'so le' || lower === 'số lẻ';

    if (isKinhClaim) {
      const res = lotoEngine.claimKinh(cleanUser, cleanUser, avatarUrl);
      if (!res.won && res.fakeEvent) {
        soundEngine.playMuoGong(1.0);
        if (autoTts) {
          soundEngine.speak(
            `Ối giời ơi bà con ơi! Báo động Kinh giả! Bạn ${formatUsernameForTts(cleanUser)} mới trúng có ${res.fakeEvent.maxRowMatched} con một hàng mà dám hô Kinh! Phạt ${res.fakeEvent.penaltyText}`
          );
        }
      }
    } else if (isPredictChan) {
      if (!lotoEngine.getTicketForUser(cleanUser)) lotoEngine.issueTicket(cleanUser, cleanUser, avatarUrl);
      lotoEngine.submitPrediction(cleanUser, cleanUser, 'chan');
    } else if (isPredictLe) {
      if (!lotoEngine.getTicketForUser(cleanUser)) lotoEngine.issueTicket(cleanUser, cleanUser, avatarUrl);
      lotoEngine.submitPrediction(cleanUser, cleanUser, 'le');
    } else if (isLayVe) {
      lotoEngine.issueTicket(cleanUser, cleanUser, avatarUrl);
      soundEngine.playLotusBloom(0.6);
      if (autoTts) soundEngine.speak(`Đã cấp vé may mắn cho bạn ${formatUsernameForTts(cleanUser)}!`);
    } else {
      if (!lotoEngine.getTicketForUser(cleanUser)) lotoEngine.issueTicket(cleanUser, cleanUser, avatarUrl);
    }
  } else if (currentTheme === 'nhau') {
    const lower = commentText.toLowerCase();
    if (lower.includes('dzo') || lower.includes('zo') || lower.includes('123') || lower.includes('uong') || lower.includes('cheers') || lower.includes('can ly')) {
      nhauEngine.triggerCheer();
    } else if (lower.includes('cmsn') || lower.includes('sinh nhat') || lower.includes('sinh nhật') || lower.includes('happy birthday') || lower.includes('snvv')) {
      let targetName = cleanUser;
      const match = commentText.match(/(?:cmsn|sinh nhật|sinh nhat|chúc mừng sinh nhật|snvv)\s+([A-Za-z0-9_À-ỹ\s]+)/i);
      if (match && match[1]?.trim()) targetName = match[1].trim();
      nhauEngine.triggerBirthday(targetName, commentText, avatarUrl);
    } else {
      nhauEngine.addConfession(cleanUser, commentText);
    }
  }

  return { isLayVe, isKinhClaim };
}

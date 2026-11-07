import type { MusicTrack } from '../types/temple';
import { formatUsernameForTts, WISHES, OFFERING_BLESSINGS, FAMILY_BLESSINGS, SHARE_REMINDER_PHRASES } from './ttsPhrases';
import { synthesizeTempleBell, synthesizeMuoGong, synthesizeLotusBloom } from './audioSynthesizer';
import { synthesizeLotoGiftDanceBeat } from './lotoAudioSynthesizer';

export { formatUsernameForTts };

const TRACK_URLS: Record<MusicTrack, string> = {
  chill: '/assets/audio/chill_relax.mp3',
  sao_truc: '/assets/audio/buddhist_flute.mp3',
  niem_phat: '/assets/audio/niem_phat_nam_mo_a_di_da_phat.mp3',
  khuc_thien_dao: '/assets/audio/khuc_thien_dao.mp3',
};

class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private speechQueue: string[] = [];
  private priorityQueue: string[] = [];
  private isSpeaking = false;
  private speechRate = 1;
  private ttsVoice = 'vi-VN-HoaiMyNeural';
  private bgmAudio: HTMLAudioElement | null = null;
  private currentTrack: MusicTrack = 'chill';
  private bgmUserVolume = 0.18;
  private isBgmPlaying = false;
  private bgmWanted = false;
  private isDharmaActive = false;
  private dharmaParagraphs: string[] = [];
  private dharmaParaOfSentence: number[] = [];
  private currentDharmaIndex = 0;
  private onDharmaParagraphCallback?: (idx: number) => void;
  private onDharmaCompleteCallback?: () => void;
  private dharmaAudio: HTMLAudioElement | null = null;
  private lastGiftAckMap: Map<string, number> = new Map();
  private lotoCurrentAudio: HTMLAudioElement | null = null;
  private lotoVoice = 'vi-VN-NamMinhNeural';
  private lotoUseBeat = true;
  private lastSpokeAt = Date.now();
  private lastWishIndex = -1;
  private lastBlessingIndex = -1;
  private channelName = 'Tâm Tịnh Tâm An';
  private shareReminderIndex = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.initAudioContext();
        if (this.bgmWanted && !this.isBgmPlaying) this.startBuddhistMusic(this.currentTrack, this.bgmUserVolume);
        ['click', 'keydown', 'touchstart'].forEach((ev) => window.removeEventListener(ev, unlock));
      };
      ['click', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, unlock));
    }
  }

  public setVoice(voice: string) { this.ttsVoice = voice; }
  public setSpeechRate(rate: number) { this.speechRate = rate; }
  public setChannelName(name: string) { this.channelName = name.trim() || this.channelName; }
  public getIsBgmPlaying(): boolean { return this.isBgmPlaying; }
  public getCurrentTrack(): MusicTrack { return this.currentTrack; }
  public isDharmaLecturePlaying(): boolean { return this.isDharmaActive; }
  public queuedSpeech() { return this.speechQueue.length; }
  public quietForMs() { return this.isSpeaking || this.isDharmaActive ? 0 : Date.now() - this.lastSpokeAt; }
  public setLotoVoice(voice: string) { this.lotoVoice = voice; }
  public getLotoVoice(): string { return this.lotoVoice; }
  public setLotoUseBeat(useBeat: boolean) { this.lotoUseBeat = useBeat; }
  public getLotoUseBeat(): boolean { return this.lotoUseBeat; }

  public initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx?.state === 'suspended') this.audioCtx.resume();
    return this.audioCtx;
  }
  public startBuddhistMusic(track: MusicTrack = 'chill', volume = 0.35) {
    if (typeof window === 'undefined') return;
    this.bgmWanted = true; this.currentTrack = track; this.bgmUserVolume = Math.max(0, Math.min(1, volume));
    const targetUrl = TRACK_URLS[track];
    if (!this.bgmAudio) { this.bgmAudio = new Audio(targetUrl); this.bgmAudio.loop = true; }
    else if (this.bgmAudio.src !== window.location.origin + targetUrl) { this.bgmAudio.pause(); this.bgmAudio.src = targetUrl; }
    this.bgmAudio.volume = (this.isSpeaking || this.isDharmaActive) ? this.bgmUserVolume * 0.25 : this.bgmUserVolume;
    this.bgmAudio.play().then(() => { this.isBgmPlaying = true; }).catch(() => { this.isBgmPlaying = false; });
  }
  public stopBuddhistMusic() { this.bgmWanted = false; this.isBgmPlaying = false; this.bgmAudio?.pause(); }
  public switchBgmTrack(track: MusicTrack) { this.currentTrack = track; if (this.isBgmPlaying) this.startBuddhistMusic(track, this.bgmUserVolume); }
  public setBgmVolume(volume: number) {
    this.bgmUserVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmAudio) this.bgmAudio.volume = (this.isSpeaking || this.isDharmaActive) ? this.bgmUserVolume * 0.25 : this.bgmUserVolume;
  }
  public startDharmaLecture(paragraphs: string[], onParagraphChange: (idx: number) => void, onComplete: () => void) {
    this.stopDharmaLecture(); this.isDharmaActive = true;
    paragraphs.forEach((para, p) => {
      for (const s of para.split(/(?<=[.!?…])\s+/)) { if (s.trim()) { this.dharmaParagraphs.push(s.trim()); this.dharmaParaOfSentence.push(p); } }
    });
    this.onDharmaParagraphCallback = onParagraphChange; this.onDharmaCompleteCallback = onComplete;
    this.speechQueue = []; if (this.currentAudio) { this.currentAudio.pause(); this.currentAudio = null; }
    this.isSpeaking = false; this.setBgmVolume(this.bgmUserVolume); this.playNextDharmaParagraph();
  }
  private playNextDharmaParagraph() {
    if (!this.isDharmaActive) return;
    if (this.priorityQueue.length > 0) { this.processQueue(); return; }
    if (this.currentDharmaIndex >= this.dharmaParagraphs.length) { this.stopDharmaLecture(); this.onDharmaCompleteCallback?.(); return; }
    const i = this.currentDharmaIndex; const para = this.dharmaParaOfSentence[i];
    if (this.onDharmaParagraphCallback && (i === 0 || para !== this.dharmaParaOfSentence[i - 1])) this.onDharmaParagraphCallback(para);
    const lectureRate = Math.max(0.6, this.speechRate - 0.1).toFixed(2);
    const urlFor = (k: number) => `/api/tts?voice=${encodeURIComponent(this.ttsVoice)}&rate=${lectureRate}&text=${encodeURIComponent(this.dharmaParagraphs[k])}`;
    const audio = new Audio(urlFor(i)); audio.volume = 1.0; this.dharmaAudio = audio;
    if (i + 1 < this.dharmaParagraphs.length) fetch(urlFor(i + 1)).catch(() => {});
    const next = () => { this.currentDharmaIndex += 1; setTimeout(() => this.playNextDharmaParagraph(), this.dharmaParaOfSentence[i + 1] !== para ? 700 : 250); };
    audio.onended = next; audio.onerror = next; audio.play().catch(() => this.stopDharmaLecture());
  }
  public stopDharmaLecture() {
    this.isDharmaActive = false; if (this.dharmaAudio) { this.dharmaAudio.pause(); this.dharmaAudio = null; }
    this.dharmaParagraphs = []; this.dharmaParaOfSentence = []; this.currentDharmaIndex = 0; this.setBgmVolume(this.bgmUserVolume);
  }
  public playTempleBell(volume = 1.0) { synthesizeTempleBell(this.initAudioContext(), volume); }
  public playMuoGong(volume = 1.3) { synthesizeMuoGong(this.initAudioContext(), volume); }
  public playLotusBloom(volume = 1.1) { synthesizeLotusBloom(this.initAudioContext(), volume); }
  public playLotoGiftDanceBeat(tier: 'rose' | 'icecream' | 'crown' | 'rocket') { synthesizeLotoGiftDanceBeat(this.initAudioContext(), tier); }
  public speakPreferredBuddhistVoice(text: string) { if (!text?.trim() || this.isDharmaActive) return; this.speechQueue.push(text.trim()); if (!this.isSpeaking) this.processQueue(); }
  public speakNow(text: string) { if (!text?.trim()) return; this.priorityQueue.push(text.trim()); if (!this.isSpeaking && !this.isDharmaActive) this.processQueue(); }
  public speak(text: string) { if (!text?.trim()) return; this.speechQueue.push(text.trim()); if (!this.isSpeaking && !this.isDharmaActive) this.processQueue(); }
  private processQueue() {
    this.lastSpokeAt = Date.now();
    if (this.priorityQueue.length === 0 && this.speechQueue.length === 0) {
      this.isSpeaking = false; this.setBgmVolume(this.bgmUserVolume); if (this.isDharmaActive) this.playNextDharmaParagraph(); return;
    }
    this.isSpeaking = true; this.setBgmVolume(this.bgmUserVolume);
    const nextText = (this.priorityQueue.shift() ?? this.speechQueue.shift())!;
    const audio = new Audio(`/api/tts?voice=${encodeURIComponent(this.ttsVoice)}&rate=${this.speechRate}&text=${encodeURIComponent(nextText)}`);
    audio.volume = 1.0; this.currentAudio = audio;
    const onDone = () => { this.currentAudio = null; setTimeout(() => this.processQueue(), 300); };
    audio.onended = onDone; audio.onerror = onDone; audio.play().catch(() => { this.isSpeaking = false; this.setBgmVolume(this.bgmUserVolume); });
  }
  public playLotoCall(num: number, _verse?: string, _spokenText?: string, onEnded?: () => void) {
    if (typeof window === 'undefined') return;
    this.initAudioContext(); this.stopLotoCall();
    const audio = new Audio(`/api/loto/call-audio?num=${num}&voice=${encodeURIComponent(this.lotoVoice)}&beat=${this.lotoUseBeat ? '1' : '0'}`);
    audio.volume = 1.0; this.lotoCurrentAudio = audio;
    const handleDone = () => { if (this.lotoCurrentAudio === audio) this.lotoCurrentAudio = null; onEnded?.(); };
    audio.onended = handleDone; audio.onerror = handleDone; audio.play().catch(() => { if (this.lotoCurrentAudio === audio) this.lotoCurrentAudio = null; });
  }
  public stopLotoCall() { if (this.lotoCurrentAudio) { this.lotoCurrentAudio.pause(); this.lotoCurrentAudio = null; } }
  public readGiftAcknowledgment(username: string, _giftName: string, diamonds = 0) {
    const key = `gift_${username.trim().toLowerCase()}`; const now = Date.now();
    if (now - (this.lastGiftAckMap.get(key) ?? 0) < 30000) return;
    if (this.isDharmaActive || (diamonds < 99 && this.priorityQueue.length >= 6)) return;
    this.lastGiftAckMap.set(key, now);
    this.priorityQueue.push(`${this.channelName} cảm ơn bạn ${formatUsernameForTts(username)} đã gửi quà tặng.`);
    this.priorityQueue.push(FAMILY_BLESSINGS[Math.floor(Math.random() * FAMILY_BLESSINGS.length)]);
    if (!this.isSpeaking) this.processQueue();
  }
  private pickWish(who: 'bạn' | 'quý vị', extra: string[] = []) {
    const pool = [...WISHES, ...extra]; let i = Math.floor(Math.random() * pool.length);
    if (i === this.lastWishIndex) i = (i + 1) % pool.length;
    this.lastWishIndex = i; return pool[i].replace('{who}', who);
  }
  public readFollowThanks(username: string) {
    const key = `follow_${username.trim().toLowerCase()}`; if (this.lastGiftAckMap.has(key)) return;
    this.lastGiftAckMap.set(key, Date.now());
    this.speakPreferredBuddhistVoice(`Dạ, con cảm ơn bạn ${formatUsernameForTts(username)} đã theo dõi kênh. A Di Đà Phật. ${this.pickWish('bạn')}`);
  }
  public dispose() {
    this.stopBuddhistMusic(); this.stopDharmaLecture(); this.speechQueue = []; this.priorityQueue = [];
    this.currentAudio?.pause(); this.currentAudio = null; this.audioCtx?.close().catch(() => {});
  }

  public readWelcomeJoiners(names: string[]) {
    if (names.length === 0 || this.isDharmaActive) return;
    const spoken = names.map((n) => `bạn ${formatUsernameForTts(n)}`);
    const list = spoken.length > 1 ? `${spoken.slice(0, -1).join(', ')} và ${spoken[spoken.length - 1]}` : spoken[0];
    this.speakPreferredBuddhistVoice(`A Di Đà Phật, ${this.channelName} xin chào ${list} vừa ghé vào.`);
  }

  private pickBlessing() {
    let i = Math.floor(Math.random() * OFFERING_BLESSINGS.length);
    if (i === this.lastBlessingIndex) i = (i + 1) % OFFERING_BLESSINGS.length;
    this.lastBlessingIndex = i;
    return OFFERING_BLESSINGS[i].replace('Tâm Tịnh Tâm An', this.channelName);
  }

  public readIdleBlessing() {
    this.speakPreferredBuddhistVoice(this.pickBlessing());
    this.speakPreferredBuddhistVoice('Quý vị nhớ bấm chia sẻ live cho bạn bè, người thân cùng nghe nhé.');
  }

  public readShareReminder(recentNames: string[] = []) {
    if (recentNames.length > 0) {
      const spoken = recentNames.map((n) => `bạn ${formatUsernameForTts(n)}`);
      const list = spoken.length > 1 ? `${spoken.slice(0, -1).join(', ')} và ${spoken[spoken.length - 1]}` : spoken[0];
      this.speakPreferredBuddhistVoice(`Dạ, ${this.channelName} cảm ơn ${list} đã ghé chơi. Quý vị nhớ bấm chia sẻ live cho bạn bè, người thân cùng nghe nhé. ${this.pickWish(recentNames.length > 1 ? 'quý vị' : 'bạn')}`);
      return;
    }
    this.speakPreferredBuddhistVoice(SHARE_REMINDER_PHRASES[this.shareReminderIndex++ % SHARE_REMINDER_PHRASES.length]);
  }
}

export const soundEngine = new SoundEngine();
import.meta.hot?.dispose(() => soundEngine.dispose());

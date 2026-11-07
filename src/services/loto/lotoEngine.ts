import {
  LotoCell, LotoTicket, LotoWinner, LotoFakeKinhEvent, LotoCageSponsor, LotoPredictionSummary,
  LotoTicketLayout, LotoTicketDisplayMode, LotoScreenConfig, LotoDanceStyle, LotoState,
  DEFAULT_LOTO_VIEWERS, generateVietnameseLotoCard, recalcTicketStatus, normalizeLotoGrid,
} from './lotoTypes';
import { saveLotoBackup, restoreLotoBackup, postLotoServerSync, postLotoAddPlayers, mergeRemoteLotoState } from './lotoSyncHelper';
import { applyTensionWaitingOnTickets, markTicketRowZeroWinner, buildLotoStateSnapshot, upsertTicketInEngine } from './lotoSpecialFeatures';
import { performClaimKinh, performSimulateFakeKinh, performRandomBotChat, performSpinNext, performResetRound } from './lotoActions';

export type {
  LotoCell, LotoTicket, LotoWinner, LotoFakeKinhEvent, LotoCageSponsor, LotoPredictionSummary,
  LotoTicketLayout, LotoTicketDisplayMode, LotoScreenConfig, LotoDanceStyle, LotoState,
};
export { generateVietnameseLotoCard };

class LotoEngineService {
  public roundId = 1;
  public calledNumbers: number[] = [];
  public currentNumber: number | null = null;
  public currentChant = 'Đêm hội Lô Tô đang mở màn, xin chúc cả nhà may mắn!';
  public isSpinning = false;
  public isAutoSpin = false;
  public spinInterval = 18;
  private autoTimer: ReturnType<typeof setInterval> | null = null;
  public screenConfig: LotoScreenConfig = { showOnScreenTickets: true, layout: '4-tickets', mode: 'priority_waiting', pinnedUsernames: [], cycleIntervalSeconds: 8 };
  public spotlightTicketUser: string | null = null;
  public showSpotlightTicket = false;
  public autoShowOnWaitingKin = true;
  public tickets: Map<string, LotoTicket> = new Map();
  public lastWinner: LotoWinner | null = null;
  public historyWinners: LotoWinner[] = [];
  public currentPrize = 'Thẻ cào điện thoại 50.000đ';
  public danceStyle: LotoDanceStyle | null = null;
  public danceDonorName?: string;
  public danceGiftName?: string;
  public customVideoUrl?: string;
  public isGreenScreen?: boolean;
  private danceTimer: ReturnType<typeof setTimeout> | null = null;
  public lastFakeKinh: LotoFakeKinhEvent | null = null;
  public fakeKinhTimer: ReturnType<typeof setTimeout> | null = null;
  public cageSponsor: LotoCageSponsor | null = null;
  public predictions: Map<string, { username: string; displayName: string; choice: 'chan' | 'le' }> = new Map();
  public lastPredictionResult: LotoPredictionSummary['lastResult'] = null;
  public showPredictionWidget = true;
  public lastSavedAt = Date.now();
  public autoResetOnWin = true;
  public autoNextRoundCountdown: number | null = null;
  public nextRoundInterval: ReturnType<typeof setInterval> | null = null;
  public autoBotCrowd = false;
  private botCrowdInterval: ReturnType<typeof setInterval> | null = null;
  private syncTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<(state: LotoState) => void> = new Set();
  public onNumberCalledCallbacks: Set<(num: number, chant: string, spokenText: string) => void> = new Set();
  public onWinCallbacks: Set<(winner: LotoWinner) => void> = new Set();
  public onFakeKinhCallbacks: Set<(fakeEvent: LotoFakeKinhEvent) => void> = new Set();
  public onBotChatCallbacks: Set<(username: string, displayName: string, comment: string, avatarUrl: string) => void> = new Set();

  constructor() {
    const res = restoreLotoBackup();
    if (res.restored && res.data && res.tickets) {
      Object.assign(this, {
        roundId: res.data.roundId ?? 1, calledNumbers: res.data.calledNumbers ?? [], currentNumber: res.data.currentNumber ?? null,
        currentChant: res.data.currentChant ?? this.currentChant, currentPrize: res.data.currentPrize ?? this.currentPrize,
        lastWinner: res.data.lastWinner ?? null, historyWinners: res.data.historyWinners ?? [], cageSponsor: res.data.cageSponsor ?? null,
        showPredictionWidget: res.data.showPredictionWidget ?? true, lastSavedAt: res.data.savedAt ?? Date.now(), tickets: res.tickets,
      });
    } else this.seedInitialTickets(4);
  }

  private saveToLocalStorage() {
    this.lastSavedAt = Date.now();
    saveLotoBackup({
      roundId: this.roundId, calledNumbers: this.calledNumbers, currentNumber: this.currentNumber, currentChant: this.currentChant,
      currentPrize: this.currentPrize, lastWinner: this.lastWinner, historyWinners: this.historyWinners.slice(0, 20),
      cageSponsor: this.cageSponsor, showPredictionWidget: this.showPredictionWidget, tickets: Array.from(this.tickets.values()), savedAt: this.lastSavedAt,
    });
  }

  public onFakeKinh(cb: (fakeEvent: LotoFakeKinhEvent) => void) { this.onFakeKinhCallbacks.add(cb); return () => { this.onFakeKinhCallbacks.delete(cb); }; }
  public onNumberCalled(cb: (num: number, chant: string, spokenText: string) => void) { this.onNumberCalledCallbacks.add(cb); return () => { this.onNumberCalledCallbacks.delete(cb); }; }
  public onWin(cb: (winner: LotoWinner) => void) { this.onWinCallbacks.add(cb); return () => { this.onWinCallbacks.delete(cb); }; }
  public onBotChat(cb: (u: string, d: string, c: string, a: string) => void) { this.onBotChatCallbacks.add(cb); return () => { this.onBotChatCallbacks.delete(cb); }; }
  public subscribe(cb: (state: LotoState) => void) { this.listeners.add(cb); cb(this.getState()); return () => { this.listeners.delete(cb); }; }
  public clearFakeKinh() { if (this.fakeKinhTimer) clearTimeout(this.fakeKinhTimer); this.lastFakeKinh = null; this.notify(); }
  public setShowPredictionWidget(enabled: boolean) { this.showPredictionWidget = enabled; this.notify(); }
  public setSpotlightTicket(u: string | null) { this.spotlightTicketUser = u ? u.toLowerCase() : null; this.showSpotlightTicket = Boolean(u); this.notify(); }
  public closeSpotlightTicket() { this.showSpotlightTicket = false; this.notify(); }
  public setAutoShowOnWaitingKin(enabled: boolean) { this.autoShowOnWaitingKin = enabled; this.notify(); }
  public getScreenConfig(): LotoScreenConfig { return { ...this.screenConfig, pinnedUsernames: [...this.screenConfig.pinnedUsernames] }; }
  public setScreenConfig(partial: Partial<LotoScreenConfig>) { this.screenConfig = { ...this.screenConfig, ...partial }; this.notify(); }
  public pinTicket(u: string) { const k = u.toLowerCase(); if (!this.screenConfig.pinnedUsernames.includes(k)) { this.screenConfig.pinnedUsernames.push(k); this.notify(); } }
  public unpinTicket(u: string) { const k = u.toLowerCase(); this.screenConfig.pinnedUsernames = this.screenConfig.pinnedUsernames.filter((x) => x !== k); this.notify(); }
  public setPrize(prize: string) { this.currentPrize = prize.trim() || 'Thẻ cào 50.000đ'; this.notify(); }
  public getPrize(): string { return this.currentPrize; }
  public getTickets(): LotoTicket[] { return Array.from(this.tickets.values()); }
  public getTicketForUser(username: string): LotoTicket | undefined { return this.tickets.get(username.toLowerCase()); }
  public setSpinInterval(s: number) { this.spinInterval = Math.max(8, Math.min(60, s)); if (this.isAutoSpin) this.setAutoSpin(true); else this.notify(); }
  public pruneOldTickets() { const cutoff = Date.now() - 1800000; this.tickets.forEach((t, k) => { if (t.createdAt < cutoff) this.tickets.delete(k); }); this.notify(); }
  public getState(): LotoState { return buildLotoStateSnapshot(this); }
  public notifyLocalOnly() { const state = this.getState(); this.listeners.forEach((l) => l(state)); }
  public notify() { this.saveToLocalStorage(); this.notifyLocalOnly(); this.syncToServer(); }
  public applyRemoteState(data: any) { mergeRemoteLotoState(this, data); this.saveToLocalStorage(); this.notifyLocalOnly(); }

  public claimKinh(username: string, displayName?: string, avatarUrl?: string) { return performClaimKinh(this, username, displayName, avatarUrl); }
  public simulateFakeKinh(targetUsername?: string): LotoFakeKinhEvent { return performSimulateFakeKinh(this, targetUsername); }
  public triggerRandomBotChat(customUser?: string, customComment?: string) { performRandomBotChat(this, customUser, customComment); }
  public spinNext(preferredNum?: number): number | null { return performSpinNext(this, preferredNum); }
  public resetRound() { performResetRound(this); }

  public upgradeToVip(username: string, displayName: string, avatarUrl: string, giftName = 'Hoa Hồng', coins = 1, skipServerSync = false): LotoTicket {
    const t = this.issueTicket(username, displayName, avatarUrl, undefined, true);
    t.isVip = true; t.vipGiftName = giftName; t.vipCoins = (t.vipCoins || 0) + coins;
    this.cageSponsor = { username: t.username, displayName: t.displayName, avatarUrl: t.avatarUrl, giftName, coins, until: Date.now() + 60000 };
    if (skipServerSync) this.notifyLocalOnly(); else { this.notify(); postLotoAddPlayers([t]); }
    return t;
  }

  public submitPrediction(username: string, displayName: string, choice: 'chan' | 'le', skipServerSync = false) {
    this.predictions.set(username.toLowerCase(), { username, displayName: displayName || username, choice });
    if (skipServerSync) this.notifyLocalOnly(); else this.notify();
  }
  public simulatePredictions(count = 8) {
    const pool = this.getTickets();
    for (let i = 0; i < Math.min(count, Math.max(pool.length, count)); i++) {
      const p = pool[i % Math.max(1, pool.length)];
      const uname = p ? p.username : `khach_${i + 1}`;
      this.predictions.set(uname.toLowerCase(), { username: uname, displayName: p ? p.displayName : `Khách #${i + 1}`, choice: Math.random() > 0.48 ? 'chan' : 'le' });
    }
    this.notify();
  }
  public simulateTensionWaiting(count = 3) {
    if (this.tickets.size === 0) this.seedInitialTickets(4);
    applyTensionWaitingOnTickets(this.getTickets().slice(0, count), this.calledNumbers);
    this.notify();
  }
  public getPredictionSummary(): LotoPredictionSummary {
    const chanUsers: string[] = []; const leUsers: string[] = [];
    this.predictions.forEach((v) => { if (v.choice === 'chan') chanUsers.push(v.displayName); else leUsers.push(v.displayName); });
    return { chanUsers, leUsers, lastResult: this.lastPredictionResult };
  }
  public toggleSpotlightTicket(username?: string) {
    if (this.showSpotlightTicket && (!username || this.spotlightTicketUser === username.toLowerCase())) this.showSpotlightTicket = false;
    else { if (username) this.spotlightTicketUser = username.toLowerCase(); this.showSpotlightTicket = true; }
    this.notify();
  }
  public removeTicket(username: string) {
    const key = username.toLowerCase();
    this.tickets.delete(key); this.screenConfig.pinnedUsernames = this.screenConfig.pinnedUsernames.filter((u) => u !== key);
    if (this.spotlightTicketUser === key) { this.showSpotlightTicket = false; this.spotlightTicketUser = null; }
    this.notify();
  }
  public clearAllTickets(skipServerSync = false) {
    this.tickets.clear(); this.screenConfig.pinnedUsernames = []; this.showSpotlightTicket = false; this.spotlightTicketUser = null;
    if (skipServerSync) this.notifyLocalOnly(); else this.notify();
  }
  public rerollTicket(username: string) {
    const t = this.tickets.get(username.toLowerCase());
    if (!t) return;
    t.grid = normalizeLotoGrid(undefined, this.calledNumbers); recalcTicketStatus(t); this.notify();
  }
  public seedInitialTickets(count = 4) {
    for (let i = 0; i < Math.min(count, DEFAULT_LOTO_VIEWERS.length); i++) {
      const v = DEFAULT_LOTO_VIEWERS[i];
      if (!this.tickets.has(v.user)) this.issueTicket(v.user, v.name, v.avatar, undefined, true);
    }
  }
  private syncToServer() {
    if (typeof window === 'undefined') return;
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => postLotoServerSync({
      roundId: this.roundId, calledNumbers: this.calledNumbers, currentNumber: this.currentNumber, currentChant: this.currentChant,
      isSpinning: this.isSpinning, lastWinner: this.lastWinner, spotlightTicketUser: this.spotlightTicketUser, showSpotlightTicket: this.showSpotlightTicket,
      currentPrize: this.currentPrize, danceStyle: this.danceStyle, danceDonorName: this.danceDonorName, danceGiftName: this.danceGiftName,
      customVideoUrl: this.customVideoUrl, isGreenScreen: this.isGreenScreen, lastFakeKinh: this.lastFakeKinh, cageSponsor: this.cageSponsor,
      predictionSummary: this.getPredictionSummary(), showPredictionWidget: this.showPredictionWidget,
    }), 100);
  }
  public setExternalWinner(winner: LotoWinner) {
    this.lastWinner = winner; this.historyWinners.unshift(winner);
    const t = this.getTicketForUser(winner.username); if (t) t.hasWon = true;
    this.notify(); this.onWinCallbacks.forEach((cb) => cb(winner));
  }
  public triggerDance(style: LotoDanceStyle | null, durationMs = 8000, donorName?: string, giftName?: string, customVideoUrl?: string, isGreenScreen?: boolean) {
    if (this.danceTimer) clearTimeout(this.danceTimer);
    Object.assign(this, { danceStyle: style, danceDonorName: donorName, danceGiftName: giftName, customVideoUrl, isGreenScreen });
    this.notify();
    if (style && durationMs > 0) this.danceTimer = setTimeout(() => this.stopDance(), durationMs);
  }
  public stopDance() {
    if (this.danceTimer) clearTimeout(this.danceTimer);
    Object.assign(this, { danceStyle: null, danceDonorName: undefined, danceGiftName: undefined, customVideoUrl: undefined, isGreenScreen: undefined });
    this.notify();
  }
  public setAutoResetOnWin(enabled: boolean) {
    this.autoResetOnWin = enabled;
    if (!enabled && this.nextRoundInterval) { clearInterval(this.nextRoundInterval); this.nextRoundInterval = null; this.autoNextRoundCountdown = null; }
    else if (enabled && this.isAutoSpin && (this.lastWinner || this.calledNumbers.length >= 90)) this.scheduleAutoNextRound();
    this.notify();
  }
  public scheduleAutoNextRound(seconds = 15) {
    if (!this.isAutoSpin || !this.autoResetOnWin) return;
    if (this.nextRoundInterval) clearInterval(this.nextRoundInterval);
    this.autoNextRoundCountdown = seconds; this.notify();
    this.nextRoundInterval = setInterval(() => {
      if (!this.isAutoSpin || !this.autoResetOnWin) { if (this.nextRoundInterval) clearInterval(this.nextRoundInterval); this.nextRoundInterval = null; this.autoNextRoundCountdown = null; this.notify(); return; }
      if (this.autoNextRoundCountdown !== null && this.autoNextRoundCountdown > 1) { this.autoNextRoundCountdown -= 1; this.notifyLocalOnly(); }
      else { if (this.nextRoundInterval) clearInterval(this.nextRoundInterval); this.nextRoundInterval = null; this.autoNextRoundCountdown = null; this.resetRound(); }
    }, 1000);
  }
  public setAutoBotCrowd(enabled: boolean) {
    this.autoBotCrowd = enabled;
    if (this.botCrowdInterval) { clearInterval(this.botCrowdInterval); this.botCrowdInterval = null; }
    if (enabled) { this.triggerRandomBotChat(); this.botCrowdInterval = setInterval(() => { if (this.autoBotCrowd) this.triggerRandomBotChat(); }, 7500); }
    this.notify();
  }
  public issueTicket(username: string, displayName: string, avatarUrl: string, externalGrid?: any[][], skipServerSync = false, isVip?: boolean, vipGiftName?: string, vipCoins?: number): LotoTicket {
    const { ticket, isNew } = upsertTicketInEngine(this, username, displayName, avatarUrl, externalGrid, isVip, vipGiftName, vipCoins);
    if (!isNew) { if (Array.isArray(externalGrid)) this.notifyLocalOnly(); return ticket; }
    if (skipServerSync) { this.saveToLocalStorage(); this.notifyLocalOnly(); } else { this.notify(); postLotoAddPlayers([ticket]); }
    return ticket;
  }
  public clearWinner() {
    this.lastWinner = null; if (this.nextRoundInterval) { clearInterval(this.nextRoundInterval); this.nextRoundInterval = null; }
    this.autoNextRoundCountdown = null; this.notify();
  }
  public simulateWin(targetName?: string): LotoWinner {
    const allTickets = this.getTickets(); let t = allTickets[0];
    const name = targetName || (t ? t.displayName : 'Hương Giang');
    if (!t) t = this.issueTicket(name.toLowerCase().replace(/\s+/g, '_'), name, '');
    const winner = markTicketRowZeroWinner(t, this.calledNumbers, this.roundId, this.currentPrize);
    this.currentNumber = winner.winningNumber; this.lastWinner = winner; this.historyWinners.unshift(winner);
    this.notify(); this.onWinCallbacks.forEach((cb) => cb(winner)); this.scheduleAutoNextRound(15);
    return winner;
  }
  public setAutoSpin(enabled: boolean) {
    this.isAutoSpin = enabled;
    if (this.autoTimer) { clearInterval(this.autoTimer); this.autoTimer = null; }
    if (!enabled && this.nextRoundInterval) { clearInterval(this.nextRoundInterval); this.nextRoundInterval = null; this.autoNextRoundCountdown = null; }
    if (enabled) {
      if (this.lastWinner || this.calledNumbers.length >= 90) this.scheduleAutoNextRound(10);
      this.autoTimer = setInterval(() => {
        if (!this.isSpinning && this.calledNumbers.length < 90 && !this.lastWinner) this.spinNext();
        else if (!this.isSpinning && (this.lastWinner || this.calledNumbers.length >= 90) && this.autoResetOnWin && this.autoNextRoundCountdown === null) this.scheduleAutoNextRound(12);
      }, this.spinInterval * 1000);
    }
    this.notify();
  }
}

export const lotoEngine = new LotoEngineService();

import { getLotoChant } from './lotoVerses';
import {
  LotoTicket,
  LotoWinner,
  LotoCageSponsor,
  LotoFakeKinhEvent,
  LotoPredictionSummary,
  LotoDanceStyle,
  recalcTicketStatus,
} from './lotoTypes';

const LOTO_STORAGE_KEY = 'loto_engine_backup_v1';

export interface LotoBackupPayload {
  roundId: number;
  calledNumbers: number[];
  currentNumber: number | null;
  currentChant: string;
  currentPrize: string;
  lastWinner: LotoWinner | null;
  historyWinners: LotoWinner[];
  cageSponsor: LotoCageSponsor | null;
  showPredictionWidget: boolean;
  tickets: LotoTicket[];
  savedAt: number;
}

export function saveLotoBackup(payload: LotoBackupPayload) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOTO_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors
  }
}

export function restoreLotoBackup(): {
  restored: boolean;
  data?: Partial<LotoBackupPayload>;
  tickets?: Map<string, LotoTicket>;
} {
  if (typeof window === 'undefined') return { restored: false };
  try {
    const raw = window.localStorage.getItem(LOTO_STORAGE_KEY);
    if (!raw) return { restored: false };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { restored: false };
    if (parsed.savedAt && Date.now() - parsed.savedAt > 12 * 3600 * 1000) return { restored: false };

    if (Array.isArray(parsed.tickets) && parsed.tickets.length > 0) {
      const tickets = new Map<string, LotoTicket>();
      for (const t of parsed.tickets) {
        if (t && t.username && Array.isArray(t.grid)) {
          recalcTicketStatus(t);
          tickets.set(t.username.toLowerCase(), t);
        }
      }
      return { restored: true, data: parsed, tickets };
    }
  } catch {
    // Ignore parse errors
  }
  return { restored: false };
}

export interface LotoServerSyncPayload {
  roundId: number;
  calledNumbers: number[];
  currentNumber: number | null;
  currentChant: string;
  isSpinning: boolean;
  lastWinner: LotoWinner | null;
  spotlightTicketUser: string | null;
  showSpotlightTicket: boolean;
  currentPrize: string;
  danceStyle: LotoDanceStyle | null;
  danceDonorName?: string;
  danceGiftName?: string;
  customVideoUrl?: string;
  isGreenScreen?: boolean;
  lastFakeKinh: LotoFakeKinhEvent | null;
  cageSponsor: LotoCageSponsor | null;
  predictionSummary: LotoPredictionSummary;
  showPredictionWidget: boolean;
}

export function postLotoServerSync(payload: LotoServerSyncPayload) {
  if (typeof window === 'undefined') return;
  fetch('/api/loto/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

export function postLotoAddPlayers(players: Array<Partial<LotoTicket>>) {
  if (typeof window === 'undefined' || players.length === 0) return;
  fetch('/api/loto/add-players', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ players }),
  }).catch(() => {});
}

export function postSimulateBotChat(picked: LotoTicket, text: string) {
  if (typeof window === 'undefined') return;
  fetch('/api/control', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'simulate_chat',
      username: picked.username,
      displayName: picked.displayName,
      text,
      avatarUrl: picked.avatarUrl,
    }),
  }).catch(() => {});
}

export function mergeRemoteLotoState(engine: any, data: any) {
  if (!data) return;
  let roundChanged = false;
  if (typeof data.roundId === 'number' && data.roundId !== engine.roundId) {
    engine.roundId = data.roundId;
    engine.calledNumbers = [];
    engine.currentNumber = null;
    engine.lastWinner = null;
    engine.lastFakeKinh = null;
    engine.predictions.clear();
    engine.lastPredictionResult = null;
    roundChanged = true;
  }
  const prevNumber = engine.currentNumber;
  const prevSpinning = engine.isSpinning;
  if (typeof data.isSpinning === 'boolean') engine.isSpinning = data.isSpinning;
  if (typeof data.currentChant === 'string') engine.currentChant = data.currentChant;
  if (data.currentNumber !== undefined) engine.currentNumber = data.currentNumber;
  if (Array.isArray(data.calledNumbers) || roundChanged) {
    if (Array.isArray(data.calledNumbers)) engine.calledNumbers = data.calledNumbers;
    engine.tickets.forEach((ticket: LotoTicket) => {
      ticket.grid.forEach((row) =>
        row.forEach((c) => {
          c.isMarked = c.val !== null && engine.calledNumbers.includes(c.val);
        })
      );
      recalcTicketStatus(ticket);
    });
  }
  if (data.spotlightTicketUser !== undefined) engine.spotlightTicketUser = data.spotlightTicketUser;
  if (typeof data.showSpotlightTicket === 'boolean') engine.showSpotlightTicket = data.showSpotlightTicket;
  if (typeof data.currentPrize === 'string') engine.currentPrize = data.currentPrize;
  if (data.danceStyle !== undefined) {
    engine.danceStyle = data.danceStyle;
    engine.danceDonorName = data.danceDonorName ?? undefined;
    engine.danceGiftName = data.danceGiftName ?? undefined;
    engine.customVideoUrl = data.customVideoUrl ?? undefined;
    engine.isGreenScreen = data.isGreenScreen ?? undefined;
  }
  const prevFake = engine.lastFakeKinh;
  if (data.lastFakeKinh !== undefined) {
    engine.lastFakeKinh = data.lastFakeKinh;
    if (engine.lastFakeKinh && (!prevFake || prevFake.id !== engine.lastFakeKinh.id)) {
      engine.onFakeKinhCallbacks.forEach((cb: any) => cb(engine.lastFakeKinh));
    }
  }
  if (data.cageSponsor !== undefined) engine.cageSponsor = data.cageSponsor;
  if (typeof data.showPredictionWidget === 'boolean') engine.showPredictionWidget = data.showPredictionWidget;
  if (data.predictionSummary && typeof data.predictionSummary === 'object') {
    engine.predictions.clear();
    if (Array.isArray(data.predictionSummary.chanUsers)) {
      data.predictionSummary.chanUsers.forEach((n: string) =>
        engine.predictions.set(n.toLowerCase(), { username: n, displayName: n, choice: 'chan' })
      );
    }
    if (Array.isArray(data.predictionSummary.leUsers)) {
      data.predictionSummary.leUsers.forEach((n: string) =>
        engine.predictions.set(n.toLowerCase(), { username: n, displayName: n, choice: 'le' })
      );
    }
    if (data.predictionSummary.lastResult !== undefined) {
      engine.lastPredictionResult = data.predictionSummary.lastResult;
    }
  }
  const prevWinner = engine.lastWinner;
  if (data.lastWinner !== undefined) {
    engine.lastWinner = data.lastWinner;
    if (
      engine.lastWinner &&
      (!prevWinner ||
        prevWinner.username !== engine.lastWinner.username ||
        prevWinner.wonAt !== engine.lastWinner.wonAt)
    ) {
      const t = engine.getTicketForUser(engine.lastWinner.username);
      if (t) t.hasWon = true;
      engine.onWinCallbacks.forEach((cb: any) => cb(engine.lastWinner));
    }
  }
  if (engine.currentNumber !== null && !engine.isSpinning && (engine.currentNumber !== prevNumber || prevSpinning)) {
    const { verse, spokenText } = getLotoChant(engine.currentNumber);
    engine.onNumberCalledCallbacks.forEach((cb: any) => cb(engine.currentNumber, engine.currentChant || verse, spokenText));
  }
}

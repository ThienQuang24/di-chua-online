export interface NhauGuest {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  tableId: number; // 0, 1, 2, 3
  seatIndex: number; // 0 to 3 per table
  beerCount: number;
  joinedAt: number;
  lastToast?: string;
  isRaisingGlass?: boolean;
}

export interface NhauTable {
  id: number;
  name: string;
  maxSeats: number;
  specialDishes: string[]; // e.g., 'Lạc luộc', 'Tháp bia', 'Tôm hùm', 'Mực nướng'
}

export interface BirthdayEvent {
  username: string;
  displayName: string;
  avatarUrl?: string;
  wishes: string;
  activeUntil: number;
}

export interface NhauState {
  guests: NhauGuest[];
  cheerCount: number;
  totalBeers: number;
  isCheering: boolean;
  isDiscoMode: boolean;
  discoUntil: number;
  birthdayEvent: BirthdayEvent | null;
  recentToast: string;
  topSponsor: { username: string; displayName: string; avatarUrl: string; contribution: string } | null;
}

const DEFAULT_TABLES: NhauTable[] = [
  { id: 0, name: 'Bàn 1: Anh Em Chiến Hữu', maxSeats: 4, specialDishes: ['Đậu phộng', 'Nem chua'] },
  { id: 1, name: 'Bàn 2: Trút Bầu Tâm Sự', maxSeats: 4, specialDishes: ['Mực nướng'] },
  { id: 2, name: 'Bàn 3: Bàn Đại Gia VIP', maxSeats: 4, specialDishes: ['Tháp bia tươi', 'Tôm hùm'] },
  { id: 3, name: 'Bàn 4: Hội Bạn Thân', maxSeats: 4, specialDishes: ['Cua hoàng đế'] },
];

class NhauEngineService {
  private guests: Map<string, NhauGuest> = new Map();
  private cheerCount: number = 28;
  private totalBeers: number = 88;
  private isCheering: boolean = false;
  private isDiscoMode: boolean = false;
  private discoUntil: number = 0;
  private discoTimeout: NodeJS.Timeout | null = null;
  private birthdayEvent: BirthdayEvent | null = null;
  private birthdayTimeout: NodeJS.Timeout | null = null;
  private recentToast: string = 'Hôm nay không say không về nha anh em ơi!';
  private topSponsor = {
    username: 'dai_gia_pho_nui',
    displayName: 'Đại Gia Phố Núi',
    avatarUrl: '',
    contribution: 'Bao 10 két bia tươi & 2 đĩa Tôm Hùm',
  };

  private listeners: Set<(state: NhauState) => void> = new Set();
  private onCheerCallbacks: Set<(chant: string) => void> = new Set();

  constructor() {
    // Add default friendly guests so tables look lively right away
    [
      { name: 'Anh Ba Hưng', table: 0, seat: 0 },
      { name: 'Hoàng Nam', table: 0, seat: 1 },
      { name: 'Thanh Hằng', table: 1, seat: 0 },
      { name: 'Bảo Ngọc', table: 2, seat: 0 },
    ].forEach((d) => this.addGuest(d.name, d.name, '', d.table, d.seat));
  }

  public subscribe(cb: (state: NhauState) => void) {
    this.listeners.add(cb);
    cb(this.getState());
    return () => { this.listeners.delete(cb); };
  }

  public onCheer(cb: (chant: string) => void) {
    this.onCheerCallbacks.add(cb);
    return () => { this.onCheerCallbacks.delete(cb); };
  }

  private notify() {
    const st = this.getState();
    this.listeners.forEach((l) => l(st));
  }

  public getState(): NhauState {
    return {
      guests: Array.from(this.guests.values()),
      cheerCount: this.cheerCount,
      totalBeers: this.totalBeers,
      isCheering: this.isCheering,
      isDiscoMode: this.isDiscoMode,
      discoUntil: this.discoUntil,
      birthdayEvent: this.birthdayEvent,
      recentToast: this.recentToast,
      topSponsor: this.topSponsor,
    };
  }

  public getTables(): NhauTable[] {
    return DEFAULT_TABLES;
  }

  // Add or seat a guest
  public addGuest(username: string, displayName: string, avatarUrl = '', preferredTable?: number, preferredSeat?: number): NhauGuest {
    const key = username.toLowerCase();
    const existing = this.guests.get(key);
    if (existing) {
      if (avatarUrl) existing.avatarUrl = avatarUrl;
      return existing;
    }

    // Find first available seat
    let assignedTable = preferredTable ?? 0;
    let assignedSeat = preferredSeat ?? 0;

    if (preferredTable === undefined) {
      const occupied = new Set<string>();
      this.guests.forEach((g) => occupied.add(`${g.tableId}_${g.seatIndex}`));
      found: for (let t = 0; t < 4; t++) {
        for (let s = 0; s < 4; s++) {
          if (!occupied.has(`${t}_${s}`)) {
            assignedTable = t;
            assignedSeat = s;
            break found;
          }
        }
      }
    }

    const guest: NhauGuest = {
      id: `guest_${Date.now()}_${key}`,
      username,
      displayName: displayName || username,
      avatarUrl,
      tableId: assignedTable,
      seatIndex: assignedSeat,
      beerCount: 1,
      joinedAt: Date.now(),
      lastToast: 'Cho xin 1 ly bia mát lạnh!',
    };

    this.guests.set(key, guest);
    this.totalBeers += 1;
    this.notify();
    return guest;
  }

  // Trigger "1 2 3 DÔ!"
  public triggerCheer(customToast?: string) {
    if (this.isCheering) return;
    this.isCheering = true;
    this.cheerCount += 1;
    this.totalBeers += this.guests.size;

    const chant = customToast || '1... 2... 3... DÔ! 2... 3... DÔ! 2... 3... UỐNG CẠN LY!';
    this.recentToast = chant;

    // Raise all glasses
    this.guests.forEach((g) => {
      g.beerCount += 1;
      g.isRaisingGlass = true;
    });

    this.notify();
    this.onCheerCallbacks.forEach((cb) => cb(chant));

    setTimeout(() => {
      this.isCheering = false;
      this.guests.forEach((g) => { g.isRaisingGlass = false; });
      this.notify();
    }, 4500);
  }

  // Handle confession/comment
  public addConfession(username: string, text: string) {
    const key = username.toLowerCase();
    const guest = this.guests.get(key) || this.addGuest(username, username);
    guest.lastToast = text;
    this.recentToast = `${guest.displayName}: "${text}"`;
    this.notify();
  }

  // Handle gift/donation
  public addDonation(username: string, displayName: string, avatarUrl: string, giftName: string, coins: number) {
    const guest = this.guests.get(username.toLowerCase()) || this.addGuest(username, displayName, avatarUrl);
    guest.beerCount += Math.max(2, Math.floor(coins / 10));

    if (coins >= 50) {
      this.topSponsor = {
        username,
        displayName: displayName || username,
        avatarUrl,
        contribution: `Đã tặng ${giftName} (${coins} xu) - Mời toàn quán!`,
      };
      DEFAULT_TABLES[2].specialDishes.unshift(giftName);
    }

    this.triggerCheer(`Cảm ơn đại gia ${guest.displayName} đã gửi tặng ${giftName}! Anh em nâng ly chúc sức khỏe đại gia nào!`);
  }

  // Toggle Disco Mode (when 666 likes reached or button clicked)
  public setDiscoMode(enabled: boolean) {
    this.isDiscoMode = enabled;
    this.discoUntil = enabled ? Date.now() + 60000 : 0;
    this.notify();

    if (enabled) {
      if (this.discoTimeout) clearTimeout(this.discoTimeout);
      this.discoTimeout = setTimeout(() => {
        this.isDiscoMode = false;
        this.discoUntil = 0;
        this.notify();
      }, 60000); // 60s disco
    }
  }

  // Trigger Birthday Party Celebration
  public triggerBirthday(displayName: string, customWish?: string, avatarUrl = '') {
    const wish = customWish || 'Chúc tuổi mới bình an, vạn sự hanh thông, tiền vào như nước!';
    this.birthdayEvent = { username: displayName, displayName, avatarUrl, wishes: wish, activeUntil: Date.now() + 35000 };
    this.notify();

    if (this.birthdayTimeout) clearTimeout(this.birthdayTimeout);
    this.birthdayTimeout = setTimeout(() => {
      this.birthdayEvent = null;
      this.notify();
    }, 35000); // 35s birthday party
  }
}

export const nhauEngine = new NhauEngineService();

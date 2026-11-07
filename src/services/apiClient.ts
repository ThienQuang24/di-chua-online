export interface NetworkInfoResponse {
  localIp: string;
  port: number;
  ticketUrl: string;
}

export interface AutoLiveConfigPayload {
  tiktokUsername?: string;
  autoWatchTikTok?: boolean;
  launchStage?: boolean;
  connectObs?: boolean;
  obsWebSocketUrl?: string;
  obsPassword?: string;
  rtmpServer?: string;
  rtmpStreamKey?: string;
  enableAutoPilot?: boolean;
}

export const apiClient = {
  async sendControl(actionOrPayload: Record<string, unknown> | string, value?: unknown): Promise<any> {
    const body = typeof actionOrPayload === 'string' ? { action: actionOrPayload, value } : actionOrPayload;
    const res = await fetch('/api/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json().catch(() => ({}));
  },

  async connectTikTok(username: string): Promise<{ success: boolean; error?: string }> {
    const res = await fetch('/api/tiktok/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    return res.json();
  },

  async disconnectTikTok(): Promise<void> {
    await fetch('/api/tiktok/disconnect', { method: 'POST' });
  },

  async getNetworkInfo(): Promise<NetworkInfoResponse | null> {
    try {
      const res = await fetch('/api/network-info');
      return await res.json();
    } catch {
      return null;
    }
  },

  async getLotoSongs(): Promise<number[]> {
    try {
      const res = await fetch('/api/loto/songs');
      const data = await res.json();
      return Array.isArray(data?.songs) ? data.songs : [];
    } catch {
      return [];
    }
  },

  async uploadLotoSong(num: number, buffer: ArrayBuffer, mimeType: string): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(`/api/loto/upload-song?num=${num}`, {
      method: 'POST',
      headers: { 'Content-Type': mimeType || 'audio/mpeg' },
      body: buffer,
    });
    return res.json();
  },

  async getAutoLiveConfig(): Promise<any> {
    try {
      const res = await fetch('/api/live/auto-config');
      return await res.json();
    } catch {
      return null;
    }
  },

  async startAutoLive(payload: AutoLiveConfigPayload): Promise<any> {
    const res = await fetch('/api/live/auto-start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async launchStageWindow(openObs: boolean = false): Promise<any> {
    const res = await fetch('/api/live/launch-stage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ openObs }),
    });
    return res.json();
  },

  async addLotoPlayers(players: Array<{ username: string; displayName: string; avatarUrl: string; grid: any[][] }>): Promise<void> {
    await fetch('/api/loto/add-players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ players }),
    }).catch(() => {});
  },

  async clearLotoTickets(): Promise<void> {
    await fetch('/api/loto/clear-tickets', { method: 'POST' }).catch(() => {});
  },

  async uploadDanceVideo(fileName: string, dataBase64: string, isGreenScreen: boolean): Promise<{ success: boolean; url?: string; error?: string }> {
    const res = await fetch('/api/upload-dance-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, dataBase64, isGreenScreen }),
    });
    return res.json();
  },

  async submitLotoPrediction(username: string, choice: 'chan' | 'le'): Promise<void> {
    await fetch('/api/loto/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, choice }),
    });
  },

  async fetchMobileTicket(username: string): Promise<any> {
    const res = await fetch(`/api/loto/ticket?user=${encodeURIComponent(username.trim())}`);
    if (!res.ok) throw new Error('Không thể tải vé từ máy chủ');
    return res.json();
  },

  async claimMobileWin(username: string): Promise<any> {
    const res = await fetch('/api/loto/claim-win', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    return res.json();
  },
};

import { useEffect, useRef } from 'react';
import { Devotee, GiftCategory, TikTokLiveStatus } from '../types/temple';
import { lotoEngine } from '../services/loto/lotoEngine';
import { apiClient } from '../services/apiClient';
import { mapTikTokGiftToTemple } from './useStreamCommentHelper';

interface TikTokSseHandlers {
  handleTriggerGift: (
    giftType: GiftCategory,
    giftName: string,
    prayerMeaning: string,
    username: string,
    countIncrement?: number,
    diamondsPerUnit?: number,
    avatarUrl?: string
  ) => void;
  handleAddComment: (username: string, commentText: string, avatarUrl?: string) => void;
  handleFollow: (username: string) => void;
  handleControl: (action: string, text?: string, extra?: any) => void;
  handleJoin: (name: string, avatarUrl?: string) => void;
  addLikes: (count: number) => void;
  addOrUpdateDevotee: (username: string, update: (d?: Devotee) => Partial<Devotee>, allowNew?: boolean) => void;
  setDevotees: React.Dispatch<React.SetStateAction<Devotee[]>>;
  setTikTokStatus: React.Dispatch<React.SetStateAction<TikTokLiveStatus>>;
}

export function useTikTokSse(handlers: TikTokSseHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const lastTotalLikesRef = useRef<number | null>(null);

  useEffect(() => {
    return lotoEngine.onBotChat((username, displayName, comment, avatarUrl) => {
      handlersRef.current.handleAddComment(displayName || username, comment, avatarUrl);
    });
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('demo') !== '1') return;
    (window as unknown as { __dco: unknown }).__dco = {
      gift: (name: string, coins: number, avatar = '') =>
        handlersRef.current.handleTriggerGift('dang_hoa_sen', 'Hoa Hồng', 'Cầu bình an', name, 1, coins, avatar),
      comment: (name: string, text: string) => handlersRef.current.handleAddComment(name, text),
    };
  }, []);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/tiktok/events');
      const onJson = (event: string, fn: (data: any) => void) => {
        eventSource?.addEventListener(event, (e) => {
          try {
            fn(JSON.parse(e.data));
          } catch {
            // Ignore malformed JSON
          }
        });
      };

      onJson('status', (data) => handlersRef.current.setTikTokStatus(data));
      onJson('chat', (data) => {
        const name = data.nickname || data.username || 'Phật tử';
        handlersRef.current.handleAddComment(name, data.comment || '', data.avatar || '');
      });
      onJson('gift', (data) => {
        const name = data.nickname || data.username || 'Bạn';
        const rawGiftName = data.giftName || 'Hoa Sen';
        const diamondCount = data.diamondCount || 1;
        const repeatCount = data.repeatCount || 1;
        const mapped = mapTikTokGiftToTemple(rawGiftName, diamondCount);
        handlersRef.current.handleTriggerGift(
          mapped.giftType,
          mapped.displayGiftName,
          mapped.prayerMeaning,
          name,
          repeatCount,
          diamondCount,
          data.avatar || ''
        );
      });
      onJson('member', (data) => {
        const name = data.nickname || data.username;
        if (name) handlersRef.current.handleJoin(name, data.avatar || '');
      });
      onJson('control', (data) => handlersRef.current.handleControl(data.action, data.text, data));
      onJson('loto_update', (data) => lotoEngine.applyRemoteState(data));
      onJson('follow', (data) => {
        const name = data.nickname || data.username;
        if (name) handlersRef.current.handleFollow(name);
      });
      onJson('roomUser', (data) => {
        if (typeof data.viewerCount === 'number') {
          handlersRef.current.setTikTokStatus((prev) => ({ ...prev, viewerCount: data.viewerCount }));
        }
      });
      onJson('like', (data) => {
        if (typeof data.totalLikes === 'number') {
          handlersRef.current.setTikTokStatus((prev) => ({ ...prev, totalLikes: data.totalLikes }));
        }
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
      });
      onJson('loto_win', (winner) => {
        lotoEngine.setExternalWinner(winner);
        handlersRef.current.addOrUpdateDevotee(
          winner.username,
          () => ({ displayName: winner.displayName, avatarUrl: winner.avatarUrl }),
          true
        );
      });

      const handleNewPlayer = (player: any) => {
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
        handlersRef.current.addOrUpdateDevotee(
          player.username,
          () => ({ displayName: player.displayName, avatarUrl: player.avatarUrl, isVip: !!player.isVip }),
          true
        );
      };

      onJson('loto_new_player', handleNewPlayer);
      onJson('loto_initial_players', (list) => {
        if (Array.isArray(list)) list.forEach(handleNewPlayer);
      });
      onJson('loto_fake_kinh', (data) => {
        if (data?.username) lotoEngine.claimKinh(data.username, data.displayName, data.avatarUrl);
      });
      onJson('loto_predict', (data) => {
        if (data?.username && (data.choice === 'chan' || data.choice === 'le')) {
          lotoEngine.submitPrediction(data.username, data.displayName || data.username, data.choice, true);
        }
      });

      eventSource.addEventListener('loto_clear_players', () => {
        lotoEngine.clearAllTickets(true);
        handlersRef.current.setDevotees([]);
      });
    } catch {
      // Ignore SSE startup error
    }

    return () => {
      eventSource?.close();
    };
  }, []);

  const handleConnectTikTok = async (username: string) => {
    handlersRef.current.setTikTokStatus((prev) => ({ ...prev, isConnecting: true, error: '' }));
    try {
      const result = await apiClient.connectTikTok(username);
      if (!result.success) {
        handlersRef.current.setTikTokStatus((prev) => ({
          ...prev,
          isConnecting: false,
          error: result.error || 'Không thể kết nối phòng Live TikTok',
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      handlersRef.current.setTikTokStatus((prev) => ({ ...prev, isConnecting: false, error: msg }));
    }
  };

  const handleDisconnectTikTok = async () => {
    try {
      await apiClient.disconnectTikTok();
    } catch {
      // Ignore
    }
  };

  return { handleConnectTikTok, handleDisconnectTikTok };
}

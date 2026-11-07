import React from 'react';
import { AppTheme } from './HeaderNav';
import { ChanhDienStage } from './ChanhDienStage';
import { StreamerDeck } from './StreamerDeck';
import { LotoStage } from './loto/LotoStage';
import { LotoStreamerPanel } from './loto/LotoStreamerPanel';
import { NhauStage } from './nhau/NhauStage';
import { NhauStreamerPanel } from './nhau/NhauStreamerPanel';
import {
  StreamConfig,
  Devotee,
  GiftEvent,
  LeaderboardEntry,
  TikTokLiveStatus,
  OfferRequest,
} from '../types/temple';

interface AppStageViewportProps {
  currentTheme: AppTheme;
  config: StreamConfig;
  devotees: Devotee[];
  currentGift: GiftEvent | null;
  likeProgress: number;
  rainUntil: number;
  offerers: GiftEvent[];
  offerRequests: OfferRequest[];
  spotlightRequests: OfferRequest[];
  leaderboardDonors: LeaderboardEntry[];
  auraIntensity: number;
  isGiftActive: boolean;
  tikTokStatus: TikTokLiveStatus;
  onToggleBgm: () => void;
  onRingBell: () => void;
  onPlayGong: () => void;
  onSpotlightStart: (username: string) => void;
  onAddDevoteeWithAvatar: (name: string, avatar?: string) => void;
  onTriggerLotoGift: (username: string, giftName: string, count?: number) => void;
  onResetCrowd: () => void;
  onConnectTikTok: (username: string) => void;
  onDisconnectTikTok: () => void;
  onSimulateChat: (name: string, text: string, avatar?: string) => void;
  onSaveChannelName: (name: string) => void;
  onUpdateConfig: (updates: Partial<StreamConfig>) => void;
}

export const ActiveStageView: React.FC<
  Pick<
    AppStageViewportProps,
    | 'currentTheme'
    | 'config'
    | 'devotees'
    | 'currentGift'
    | 'likeProgress'
    | 'rainUntil'
    | 'offerers'
    | 'offerRequests'
    | 'spotlightRequests'
    | 'leaderboardDonors'
    | 'auraIntensity'
    | 'isGiftActive'
    | 'onToggleBgm'
    | 'onRingBell'
    | 'onPlayGong'
    | 'onSpotlightStart'
  >
> = ({
  currentTheme,
  config,
  devotees,
  currentGift,
  likeProgress,
  rainUntil,
  offerers,
  offerRequests,
  spotlightRequests,
  leaderboardDonors,
  auraIntensity,
  isGiftActive,
  onToggleBgm,
  onRingBell,
  onPlayGong,
  onSpotlightStart,
}) => {
  if (currentTheme === 'loto') {
    return (
      <LotoStage
        config={config}
        devotees={devotees}
        currentGift={currentGift}
        likeProgress={likeProgress}
        rainUntil={rainUntil}
        isBgmPlaying={config.bgmEnabled}
        onToggleBgm={onToggleBgm}
      />
    );
  }
  if (currentTheme === 'nhau') {
    return (
      <NhauStage
        config={config}
        devotees={devotees}
        currentGift={currentGift}
        likeProgress={likeProgress}
        rainUntil={rainUntil}
        isBgmPlaying={config.bgmEnabled}
        onToggleBgm={onToggleBgm}
      />
    );
  }
  return (
    <ChanhDienStage
      onSpotlightStart={onSpotlightStart}
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
      onRingBell={onRingBell}
      onPlayGong={onPlayGong}
      onToggleBgm={onToggleBgm}
      isBgmPlaying={config.bgmEnabled}
    />
  );
};

export const ActiveStreamerPanel: React.FC<
  Pick<
    AppStageViewportProps,
    | 'currentTheme'
    | 'config'
    | 'tikTokStatus'
    | 'onAddDevoteeWithAvatar'
    | 'onTriggerLotoGift'
    | 'onResetCrowd'
    | 'onConnectTikTok'
    | 'onDisconnectTikTok'
    | 'onSimulateChat'
    | 'onSaveChannelName'
    | 'onUpdateConfig'
  > & { deckHeightClass?: string }
> = ({
  currentTheme,
  config,
  tikTokStatus,
  onAddDevoteeWithAvatar,
  onTriggerLotoGift,
  onResetCrowd,
  onConnectTikTok,
  onDisconnectTikTok,
  onSimulateChat,
  onSaveChannelName,
  onUpdateConfig,
  deckHeightClass = 'h-[680px]',
}) => {
  return (
    <>
      {currentTheme === 'loto' && (
        <LotoStreamerPanel
          onAddDevotee={onAddDevoteeWithAvatar}
          onTriggerGift={onTriggerLotoGift}
          onResetCrowd={onResetCrowd}
          tikTokStatus={tikTokStatus}
          onConnectTikTok={onConnectTikTok}
          onDisconnectTikTok={onDisconnectTikTok}
          onSimulateChat={onSimulateChat}
        />
      )}
      {currentTheme === 'nhau' && (
        <NhauStreamerPanel onAddDevotee={onAddDevoteeWithAvatar} />
      )}
      {currentTheme !== 'loto' && (
        <div className={deckHeightClass}>
          <StreamerDeck
            config={config}
            onSaveChannelName={onSaveChannelName}
            onUpdateConfig={onUpdateConfig}
            tikTokStatus={tikTokStatus}
            onConnectTikTok={onConnectTikTok}
            onDisconnectTikTok={onDisconnectTikTok}
          />
        </div>
      )}
    </>
  );
};

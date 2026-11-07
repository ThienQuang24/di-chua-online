import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DevoteeCrowd, SEATS } from './DevoteeCrowd';
import { OfferingArea, TOP10_SEATS } from './OfferingArea';
import { Temple3D } from '../three/Temple3D';
import type { ActorSpec } from '../three/templeScene';
import { SpotlightCard } from './SpotlightCard';
import { ChanhDienHeaderOverlays, ChanhDienFooterBar } from './ChanhDienStageControls';
import { Devotee, GiftEvent, OfferRequest, LeaderboardEntry, StreamConfig } from '../types/temple';

interface ChanhDienStageProps {
  config: StreamConfig;
  devotees: Devotee[];
  currentGift: GiftEvent | null;
  offerers: GiftEvent[];
  offerRequests: OfferRequest[];
  leaderboardDonors: LeaderboardEntry[];
  auraIntensity: number;
  isGiftActive: boolean;
  onRingBell: () => void;
  onPlayGong: () => void;
  onToggleBgm?: () => void;
  isBgmPlaying?: boolean;
  likeProgress?: number;
  rainUntil?: number;
  spotlightRequests?: OfferRequest[];
  onSpotlightStart?: (username: string) => void;
}

const MAX_AT_BURNER = 5;

export const ChanhDienStage: React.FC<ChanhDienStageProps> = ({
  config, devotees, currentGift, offerers, offerRequests, leaderboardDonors,
  auraIntensity, isGiftActive, onRingBell, onPlayGong, onToggleBgm,
  isBgmPlaying = true, likeProgress = 0, rainUntil = 0, spotlightRequests = [], onSpotlightStart,
}) => {
  const [raining, setRaining] = useState(false);
  useEffect(() => {
    const left = rainUntil - Date.now();
    setRaining(left > 0);
    if (left <= 0) return;
    const t = setTimeout(() => setRaining(false), left);
    return () => clearTimeout(t);
  }, [rainUntil]);

  const [has3D, setHas3D] = useState(false);
  const [incenseLit, setIncenseLit] = useState(false);
  const [awayKeys, setAwayKeys] = useState<string[]>([]);
  const [activeOffers, setActiveOffers] = useState<OfferRequest[]>([]);
  const queueRef = useRef<OfferRequest[]>([]);
  const seenRef = useRef(new Set<string>());
  const lastOfferAtRef = useRef(new Map<string, number>());
  const keyUserRef = useRef(new Map<string, string>());
  const activeRef = useRef<OfferRequest[]>([]);

  const settleOffers = (done?: string) => {
    const active = activeRef.current;
    const next = done ? active.filter((o) => o.username !== done) : [...active];
    while (next.length < MAX_AT_BURNER && queueRef.current.length) {
      const r = queueRef.current.shift()!;
      next.push(r);
      setTimeout(() => settleOffers(r.username), 90000);
    }
    if (next.length === active.length && next.every((o, i) => o === active[i])) return;
    activeRef.current = next;
    setActiveOffers(next);
  };

  useEffect(() => {
    const now = Date.now();
    for (const r of offerRequests) {
      if (seenRef.current.has(r.id)) continue;
      seenRef.current.add(r.id);
      const waiting = activeRef.current.some((a) => a.username === r.username) || queueRef.current.some((q) => q.username === r.username);
      if (waiting || now - (lastOfferAtRef.current.get(r.username) ?? 0) < 60000) continue;
      lastOfferAtRef.current.set(r.username, now);
      queueRef.current.push(r);
    }
    queueRef.current = queueRef.current.slice(-12);
    settleOffers();
  }, [offerRequests]);

  const offerKeyRef = useRef(new Map<string, string>());

  const specs = useMemo(() => {
    const list: ActorSpec[] = [];
    const offering = new Map(activeOffers.map((o) => [o.username, o]));
    const offerKeys = new Map<string, string>();
    offerKeyRef.current = offerKeys;
    const offerFor = (key: string, username: string) => {
      const o = offering.get(username);
      if (!o) return {};
      keyUserRef.current.set(key, username);
      offerKeys.set(username, key);
      offering.delete(username);
      return { offer: o.id, label: { name: o.displayName || o.username, avatar: o.avatarUrl || undefined } };
    };
    const top = leaderboardDonors.slice(0, TOP10_SEATS.length);
    top.forEach((d, i) => {
      const key = `top-${d.username}`;
      list.push({ key, at: TOP10_SEATS[i], mode: 'pray', enter: 'walk', label: { name: d.displayName || d.username, avatar: d.avatarUrl }, ...offerFor(key, d.username) });
    });
    const bySeat = new Map(devotees.map((d) => [(d.seat ?? 0) % SEATS.length, d]));
    SEATS.forEach((at, i) => {
      const d = bySeat.get(i);
      if (!d) return list.push({ key: `npc-${i}`, at, mode: 'pray', enter: 'place' });
      const key = `v-${d.id}`;
      list.push({ key, at, mode: 'pray', enter: Date.now() - d.joinedAt < 3500 ? 'walk' : 'place', ...offerFor(key, d.username) });
    });
    for (const o of offering.values()) {
      const key = `guest-${o.username}`;
      list.push({ key, at: { x: 50, y: 106 }, mode: 'pray', enter: 'walk', leave: true, ...offerFor(key, o.username) });
    }
    return list;
  }, [devotees, leaderboardDonors, activeOffers]);

  const bgRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const [spotKey, setSpotKey] = useState<string | null>(null);
  const [spotPerson, setSpotPerson] = useState<{ id: string; name: string; avatar?: string } | null>(null);
  const spotQueueRef = useRef<Array<OfferRequest & { at: number }>>([]);
  const spotSeenRef = useRef(new Set<string>());
  const spotBusyRef = useRef(false);
  const spotNextAtRef = useRef(0);
  const onSpotlightStartRef = useRef(onSpotlightStart);
  onSpotlightStartRef.current = onSpotlightStart;

  useEffect(() => {
    for (const r of spotlightRequests) {
      if (spotSeenRef.current.has(r.id)) continue;
      spotSeenRef.current.add(r.id);
      if (spotQueueRef.current.some((q) => q.username === r.username)) continue;
      spotQueueRef.current.push({ ...r, at: Date.now() });
      if (!activeRef.current.some((a) => a.username === r.username)) {
        queueRef.current = [{ ...r, id: `${r.id}-spot` }, ...queueRef.current.filter((q) => q.username !== r.username)];
        lastOfferAtRef.current.set(r.username, Date.now());
        settleOffers();
      }
    }
  }, [spotlightRequests]);

  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      spotQueueRef.current = spotQueueRef.current.filter((q) => now - q.at < 120000);
      if (spotBusyRef.current || now < spotNextAtRef.current) return;
      for (const q of spotQueueRef.current) {
        const key = offerKeyRef.current.get(q.username);
        if (!key) continue;
        spotQueueRef.current = spotQueueRef.current.filter((x) => x !== q);
        spotBusyRef.current = true;
        setSpotKey(key);
        onSpotlightStartRef.current?.(q.username);
        setSpotPerson({ id: q.id, name: q.displayName || q.username, avatar: q.avatarUrl || undefined });
        return;
      }
    }, 400);
    return () => clearInterval(t);
  }, []);

  const endSpotlight = () => {
    spotBusyRef.current = false;
    spotNextAtRef.current = Date.now() + 6000;
    setSpotKey(null);
    setSpotPerson(null);
  };

  return (
    <div
      className={`relative mx-auto bg-[#0a0403] overflow-hidden shadow-2xl flex flex-col justify-between border border-amber-500/40 select-none ${
        config.displayRatio === '9:16' ? 'w-full max-w-[430px] aspect-9/16 rounded-2xl' : 'w-full h-full rounded-none'
      }`}
    >
      <div ref={bgRef} className="absolute inset-0 z-0">
        <img src="/assets/bg/chanh-dien-2-hd.webp" alt="Chánh Điện Kim Phật" className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.8) saturate(0.95)' }} />
        <img
          src="/assets/bg/chanh-dien-2-4k.webp"
          alt=""
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700"
          style={{ filter: 'brightness(0.8) saturate(0.95)', opacity: spotKey ? 1 : 0 }}
        />
        <div className="absolute left-1/2 -translate-x-1/2 top-[20%] w-[38%] aspect-square rounded-full bg-radial from-amber-200/25 via-amber-400/10 to-transparent mix-blend-screen animate-pulse-gold pointer-events-none" />
        <div className="absolute inset-0 bg-linear-to-b from-black/55 via-transparent to-black/60 pointer-events-none" />
      </div>

      <ChanhDienHeaderOverlays
        config={config} currentGift={currentGift} leaderboardDonors={leaderboardDonors}
        auraIntensity={auraIntensity} isGiftActive={isGiftActive} likeProgress={likeProgress}
        rainUntil={rainUntil} raining={raining}
      />

      <div ref={worldRef} className="absolute inset-0 z-20">
        <div className="absolute inset-0 z-[1]">
          <OfferingArea offering={currentGift} offerers={offerers} topDonors={leaderboardDonors} layer={has3D ? 'floor' : 'all'} burnerLit={has3D ? incenseLit : undefined} />
          {!has3D && <DevoteeCrowd devotees={devotees} recentGiftDonor={currentGift?.username || null} recentGiftPrayer={currentGift?.prayerMeaning || null} />}
        </div>
        <div className="absolute inset-0 z-[2]">
          <Temple3D
            specs={specs}
            onReady={setHas3D}
            onIncenseLit={() => { setIncenseLit(true); setTimeout(() => setIncenseLit(false), 8000); }}
            onAway={(key, away) => {
              setAwayKeys((prev) => (away ? [...prev, key] : prev.filter((k) => k !== key)));
              const user = keyUserRef.current.get(key);
              if (!away && user) settleOffers(user);
            }}
            spotlightKey={spotKey}
            zoomTargets={() => [bgRef.current, worldRef.current].filter((el): el is HTMLDivElement => Boolean(el))}
            onSpotlightEnd={endSpotlight}
          />
        </div>
        {has3D && (
          <div className="absolute inset-0 z-[3]">
            <OfferingArea offering={currentGift} offerers={offerers} topDonors={leaderboardDonors} layer="labels" away={awayKeys.filter((k) => k.startsWith('top-')).map((k) => k.slice(4))} />
            <DevoteeCrowd devotees={devotees} recentGiftDonor={currentGift?.username || null} recentGiftPrayer={currentGift?.prayerMeaning || null} labelsOnly />
          </div>
        )}
      </div>

      <SpotlightCard person={spotPerson} />
      <ChanhDienFooterBar config={config} currentGift={currentGift} isBgmPlaying={isBgmPlaying} onToggleBgm={onToggleBgm} onRingBell={onRingBell} onPlayGong={onPlayGong} />
    </div>
  );
};

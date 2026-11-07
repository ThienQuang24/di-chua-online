export function synthesizeTempleBell(ctx: AudioContext | null, volume = 1.0) {
  try {
    if (!ctx) return;
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(volume * 0.9, now);
    master.connect(ctx.destination);

    const freqs = [146.83, 293.66, 440.0, 734.16, 1174.66, 1760.0];
    const gains = [0.8, 0.5, 0.35, 0.2, 0.12, 0.06];
    const decayTimes = [8.0, 6.2, 4.8, 3.2, 2.0, 1.4];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((Math.random() - 0.5) * 6, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(gains[idx], now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decayTimes[idx]);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc.stop(now + decayTimes[idx]);
    });
  } catch {
    // Ignored
  }
}

export function synthesizeMuoGong(ctx: AudioContext | null, volume = 1.3) {
  try {
    if (!ctx) return;
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(volume * 1.1, now);
    master.connect(ctx.destination);

    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    const clickFilter = ctx.createBiquadFilter();

    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(2400, now);
    clickOsc.frequency.exponentialRampToValueAtTime(800, now + 0.012);

    clickFilter.type = 'bandpass';
    clickFilter.frequency.setValueAtTime(2200, now);
    clickFilter.Q.setValueAtTime(3.0, now);

    clickGain.gain.setValueAtTime(0.8, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(master);

    clickOsc.start(now);
    clickOsc.stop(now + 0.02);

    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    const bodyFilter = ctx.createBiquadFilter();

    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(460, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(340, now + 0.07);

    bodyFilter.type = 'bandpass';
    bodyFilter.frequency.setValueAtTime(410, now);
    bodyFilter.Q.setValueAtTime(6.5, now);

    bodyGain.gain.setValueAtTime(0, now);
    bodyGain.gain.linearRampToValueAtTime(1.2, now + 0.003);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    bodyOsc.connect(bodyFilter);
    bodyFilter.connect(bodyGain);
    bodyGain.connect(master);

    bodyOsc.start(now);
    bodyOsc.stop(now + 0.18);

    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(220, now);
    subOsc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

    subGain.gain.setValueAtTime(0.9, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    subOsc.connect(subGain);
    subGain.connect(master);

    subOsc.start(now);
    subOsc.stop(now + 0.15);
  } catch {
    // Ignored
  }
}

export function synthesizeLotusBloom(ctx: AudioContext | null, volume = 1.1) {
  try {
    if (!ctx) return;
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(volume * 1.0, now);
    master.connect(ctx.destination);

    const chimeFreqs = [1046.5, 1567.98, 2093.0, 2637.02];
    const chimeGains = [0.8, 0.5, 0.35, 0.2];
    const chimeDecays = [2.8, 2.2, 1.8, 1.2];

    chimeFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.035);
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now + idx * 0.035);

      gain.gain.setValueAtTime(0, now + idx * 0.035);
      gain.gain.linearRampToValueAtTime(chimeGains[idx], now + idx * 0.035 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.035 + chimeDecays[idx]);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now + idx * 0.035);
      osc.stop(now + idx * 0.035 + chimeDecays[idx] + 0.1);
    });
  } catch {
    // Ignored
  }
}

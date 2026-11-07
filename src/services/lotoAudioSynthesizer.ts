export function synthesizeLotoGiftDanceBeat(
  ctx: AudioContext | null,
  tier: 'rose' | 'icecream' | 'crown' | 'rocket'
) {
  try {
    if (!ctx) return;
    const now = ctx.currentTime + 0.05;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.85, now);
    master.connect(ctx.destination);

    if (tier === 'rose') {
      const notes = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        osc.connect(gain);
        gain.connect(master);
        osc.start(t);
        osc.stop(t + 1.3);
      });
    } else if (tier === 'icecream') {
      const beatSec = 0.44;
      const totalBeats = 11;
      for (let b = 0; b < totalBeats; b++) {
        const t = now + b * beatSec;
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(b % 2 === 0 ? 130.81 : 98.0, t);
        bassGain.gain.setValueAtTime(0.6, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        bassOsc.connect(bassGain);
        bassGain.connect(master);
        bassOsc.start(t);
        bassOsc.stop(t + 0.38);

        const chordT = t + beatSec * 0.5;
        [523.25, 659.25, 783.99].forEach((freq) => {
          const stabOsc = ctx.createOscillator();
          const stabGain = ctx.createGain();
          stabOsc.type = 'square';
          stabOsc.frequency.setValueAtTime(freq, chordT);
          stabGain.gain.setValueAtTime(0.18, chordT);
          stabGain.gain.exponentialRampToValueAtTime(0.001, chordT + 0.22);
          stabOsc.connect(stabGain);
          stabGain.connect(master);
          stabOsc.start(chordT);
          stabOsc.stop(chordT + 0.25);
        });
      }
    } else if (tier === 'crown') {
      const beatSec = 0.44;
      const totalBeats = 18;
      for (let b = 0; b < totalBeats; b++) {
        const t = now + b * beatSec;
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(160, t);
        kickOsc.frequency.exponentialRampToValueAtTime(45, t + 0.08);
        kickGain.gain.setValueAtTime(0.85, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        kickOsc.connect(kickGain);
        kickGain.connect(master);
        kickOsc.start(t);
        kickOsc.stop(t + 0.32);

        if (b % 2 === 1) {
          const snareT = t;
          const noise = ctx.createBufferSource();
          const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.15), ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
          noise.buffer = buffer;
          const snareFilter = ctx.createBiquadFilter();
          snareFilter.type = 'highpass';
          snareFilter.frequency.setValueAtTime(1000, snareT);
          const snareGain = ctx.createGain();
          snareGain.gain.setValueAtTime(0.4, snareT);
          snareGain.gain.exponentialRampToValueAtTime(0.001, snareT + 0.14);
          noise.connect(snareFilter);
          snareFilter.connect(snareGain);
          snareGain.connect(master);
          noise.start(snareT);
        }

        const bassT = t + beatSec * 0.5;
        const bassFreqs = [110, 110, 130.81, 146.83, 164.81, 130.81];
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassFreqs[b % bassFreqs.length], bassT);
        bassGain.gain.setValueAtTime(0.35, bassT);
        bassGain.gain.exponentialRampToValueAtTime(0.001, bassT + 0.2);
        bassOsc.connect(bassGain);
        bassGain.connect(master);
        bassOsc.start(bassT);
        bassOsc.stop(bassT + 0.22);
      }
    } else if (tier === 'rocket') {
      const riserOsc = ctx.createOscillator();
      const riserGain = ctx.createGain();
      riserOsc.type = 'sawtooth';
      riserOsc.frequency.setValueAtTime(220, now);
      riserOsc.frequency.exponentialRampToValueAtTime(1320, now + 1.5);
      riserGain.gain.setValueAtTime(0.01, now);
      riserGain.gain.linearRampToValueAtTime(0.45, now + 1.4);
      riserGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
      riserOsc.connect(riserGain);
      riserGain.connect(master);
      riserOsc.start(now);
      riserOsc.stop(now + 1.6);

      const dropStart = now + 1.5;
      const beatSec = 0.42;
      const dropBeats = 22;
      for (let b = 0; b < dropBeats; b++) {
        const t = dropStart + b * beatSec;
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(200, t);
        kickOsc.frequency.exponentialRampToValueAtTime(42, t + 0.09);
        kickGain.gain.setValueAtTime(1.0, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        kickOsc.connect(kickGain);
        kickGain.connect(master);
        kickOsc.start(t);
        kickOsc.stop(t + 0.36);

        const hatT = t + beatSec * 0.5;
        const hatNoise = ctx.createBufferSource();
        const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.08), ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        hatNoise.buffer = buffer;
        const hatFilter = ctx.createBiquadFilter();
        hatFilter.type = 'highpass';
        hatFilter.frequency.setValueAtTime(7000, hatT);
        const hatGain = ctx.createGain();
        hatGain.gain.setValueAtTime(0.3, hatT);
        hatGain.gain.exponentialRampToValueAtTime(0.001, hatT + 0.07);
        hatNoise.connect(hatFilter);
        hatFilter.connect(hatGain);
        hatGain.connect(master);
        hatNoise.start(hatT);

        const hornFreqs = [587.33, 659.25, 783.99, 880.0, 1046.5, 880.0];
        const hornOsc = ctx.createOscillator();
        const hornGain = ctx.createGain();
        hornOsc.type = 'sawtooth';
        hornOsc.frequency.setValueAtTime(hornFreqs[b % hornFreqs.length], t + 0.1);
        hornGain.gain.setValueAtTime(0.3, t + 0.1);
        hornGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        hornOsc.connect(hornGain);
        hornGain.connect(master);
        hornOsc.start(t + 0.1);
        hornOsc.stop(t + 0.38);
      }
    }
  } catch {
    // Ignored
  }
}

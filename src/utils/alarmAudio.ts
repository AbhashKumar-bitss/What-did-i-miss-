// Web Audio API & Speech Synthesis Alarm Sound Engine

let audioCtx: AudioContext | null = null;
let activeLoopInterval: any = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSingleBeep(freq = 880, duration = 0.15, type: OscillatorType = 'sine', gainVal = 0.25) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    console.error('Audio playback error:', err);
  }
}

export function playChimeTone() {
  const ctx = getAudioContext();
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } catch (e) {
        // ignore
      }
    }, idx * 110);
  });
}

export function playDigitalAlarm() {
  const ctx = getAudioContext();
  // Beep-beep-beep-beep pattern
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(950, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } catch (e) {}
    }, i * 160);
  }
}

export function playRadarSound() {
  const ctx = getAudioContext();
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}

export function playVoiceNotification(text: string) {
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(`Reminder alert: ${text}`);
      utter.rate = 1.0;
      utter.pitch = 1.05;
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('Voice reminder error:', e);
    }
  }
}

export function startAlarmRinging(soundType: 'chime' | 'digital' | 'radar' | 'voice', taskText: string) {
  stopAlarmRinging();

  const triggerSound = () => {
    switch (soundType) {
      case 'chime':
        playChimeTone();
        break;
      case 'digital':
        playDigitalAlarm();
        break;
      case 'radar':
        playRadarSound();
        break;
      case 'voice':
        playChimeTone();
        setTimeout(() => playVoiceNotification(taskText), 500);
        break;
    }
  };

  triggerSound();
  // Loop alarm every 3.5 seconds until dismissed
  activeLoopInterval = setInterval(triggerSound, 3500);
}

export function stopAlarmRinging() {
  if (activeLoopInterval) {
    clearInterval(activeLoopInterval);
    activeLoopInterval = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

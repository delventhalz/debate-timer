// Based on this blog post:
// https://odino.org/emit-a-beeping-sound-with-javascript/

const DEFAULT_FREQUENCY = 520;
const DEFAULT_VOLUME = 1;
const DEFAULT_DURATION = 150;

let ctx = null;

const audioContextGetter = () => {
  if (window.AudioContext) {
    return () => new window.AudioContext();
  }

  if (window.webkitAudioContext) {
    return () => {
      const ctx = new window.webkitAudioContext();
      ctx.resume();
      return ctx;
    };
  }

  return null;
};

const getAudioContext = audioContextGetter();

export const activate = () => {
  if (getAudioContext && !ctx) {
    ctx = getAudioContext();
  }
};

export const beep = ({
  frequency = DEFAULT_FREQUENCY,
  volume = DEFAULT_VOLUME,
  duration = DEFAULT_DURATION
} = {}) => {
  if (ctx) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  }
};

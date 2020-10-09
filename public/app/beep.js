// Based on this blog post:
// https://odino.org/emit-a-beeping-sound-with-javascript/

const DEFAULT_FREQUENCY = 520;
const DEFAULT_VOLUME = 1;
const DEFAULT_DURATION = 150;

const noop = () => {};

const getBeeper = ctx => ({
  frequency = DEFAULT_FREQUENCY,
  volume = DEFAULT_VOLUME,
  duration = DEFAULT_DURATION
} = {}) => {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.type = 'square';
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration / 1000);
};

// Safari has an alternate AudioContext which must be activated
// immediately on a user action, not in a user trigger setTimeout
const getAudioInterface = () => {
  if (window.AudioContext) {
    return {
      activate: noop,
      beep: getBeeper(new window.AudioContext())
    };
  }

  if (window.webkitAudioContext) {
    const ctx = new window.webkitAudioContext();

    return {
      activate: ctx.resume.bind(ctx),
      beep: getBeeper(ctx)
    };
  }

  return {
    activate: noop,
    beep: noop
  };
}

export const { activate, beep } = getAudioInterface();

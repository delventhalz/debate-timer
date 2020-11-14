import m from '../lib/mithril.js';
import { Timer } from './timer.js';

const appRoot = document.getElementById('app');

const parseSeconds = seconds => Math.max(Number(seconds) * 1000, 0);

const App = {
  view() {
    const params = new URLSearchParams(window.location.search);
    const hideText = params.get('notext') !== null;
    const isSilent = params.get('silent') !== null;

    // Specify as comma separated "timers" or as multiple "timer" parameters
    const timers = (params.get('timers') || '')
      .split(',')
      .concat(params.getAll('timer'))
      .map(parseSeconds)
      .filter(Boolean);

    const warningString = params.get('warning');
    const warning = warningString ? parseSeconds(warningString) : undefined;

    return m('.content', [
      m(Timer, { hideText, isSilent, timers, warning })
    ]);
  }
};

m.mount(appRoot, App);

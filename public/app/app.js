import m from '../lib/mithril.js';
import { Timer } from './timer.js';

const appRoot = document.getElementById('app');

const App = {
  view() {
    const params = new URLSearchParams(window.location.search);
    const hideText = params.get('notext') !== null;

    // Specify as comma separated "timers" or as multiple "timer" parameters
    const timers = (params.get('timers') || '')
      .split(',')
      .concat(params.getAll('timer'))
      .map(Number)
      .filter(Boolean)
      .map(num => num * 1000);

    return m('.content', [
      m(Timer, { hideText, timers })
    ]);
  }
};

m.mount(appRoot, App);

import m from '../lib/mithril.js';
import { Timer } from './timer.js';

const appRoot = document.getElementById('app');

const App = {
  view() {
    const params = new URLSearchParams(window.location.search);
    const hideText = params.get('notext') !== null;

    return m('.content', [
      m(Timer, { hideText })
    ]);
  }
};

m.mount(appRoot, App);

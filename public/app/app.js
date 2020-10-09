import m from '../lib/mithril.js';
import { Timer } from './timer.js';

const appRoot = document.getElementById('app');

const App = {
  view() {
    return m('.content', [
      m(Timer)
    ]);
  }
};

m.mount(appRoot, App);

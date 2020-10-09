import m from './mithril.js';
import { beep } from './beep.js';

const appRoot = document.getElementById('app');

const WARNING_TIME = 10000;
const NO_REALLY_TIME = 5000;
const ALARM_FREQUENCY = 1500;
const RAMP_UP_TIME = 15000;

const STATUSES = {
  NOT_RUNNING: 'not-running',
  GO: 'go',
  WARNING: 'warning',
  STOP: 'stop',
  NO_REALLY: 'no-really'
};

const easeVal = (current, max) => {
  const percent = Math.min(current / max, 1);
  return percent ** 2;
};

const statusSetter = state => nextStatus => {
  state.status = nextStatus;
  m.redraw();
};
const timeoutAdder = state => (callback, delay) => {
  const timeoutId = setTimeout(callback, delay);
  state.timeouts.push(timeoutId);
};

const timeoutsClearer = state => () => {
  for (const timeoutId of state.timeouts) {
    clearTimeout(timeoutId);
  }
  state.timeouts.length = 0;
};

const StopButton = {
  view(vnode) {
    const { setStatus, clearTimeouts } = vnode.attrs;

    const onclick = () => {
      clearTimeouts();
      setStatus(STATUSES.NOT_RUNNING);
    }

    return m('button.button.stop-button', { onclick }, 'Stop');
  }
}

const StartButton = {
  view(vnode) {
    const { setStatus, addTimeout, duration } = vnode.attrs;
    let alarmStart;

    const emitAlarm = () => {
      // Start at a low volume, but not quite zero, and ease up to full volume
      const rampProgress = easeVal(Date.now() - alarmStart, RAMP_UP_TIME);
      const volume = 0.02 + rampProgress * 0.98;

      addTimeout(() => beep({ volume }), 0);
      addTimeout(() => beep({ volume }), 250);

      addTimeout(emitAlarm, ALARM_FREQUENCY);
    };

    const onclick = () => {
      setStatus(STATUSES.GO);

      addTimeout(() => {
        setStatus(STATUSES.WARNING);
      }, duration - WARNING_TIME);

      addTimeout(() => {
        setStatus(STATUSES.STOP);
      }, duration);

      addTimeout(() => {
        alarmStart = Date.now();
        emitAlarm();
        setStatus(STATUSES.NO_REALLY);
      }, duration + NO_REALLY_TIME);
    }

    return m('button.button', { onclick }, vnode.children);
  }
}

const Timer = {
  status: STATUSES.NOT_RUNNING,
  timeouts: [],

  view({ state }) {
    const setStatus = statusSetter(state);
    const addTimeout = timeoutAdder(state);
    const clearTimeouts = timeoutsClearer(state);

    const buttons = state.status === STATUSES.NOT_RUNNING
      ? [
        m(StartButton, { setStatus, addTimeout, duration: 120000 }, '2 min'),
        m(StartButton, { setStatus, addTimeout, duration: 60000 }, '1 min'),
        m(StartButton, { setStatus, addTimeout, duration: 30000 }, '30 sec')
      ]
      : m(StopButton, { setStatus, clearTimeouts });

    return m('.container', [
      m('#indicator', { className: state.status }),
      m('.row', buttons)
    ]);
  }
}

m.mount(appRoot, Timer);

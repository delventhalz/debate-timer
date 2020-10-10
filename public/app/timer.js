import m from '../lib/mithril.js';
import { activate, beep } from './beeper.js';

const DEFAULT_WARNING_TIME = 10000;
const NO_REALLY_TIME = 5000;

const RAMP_UP_TIME = 12500;
const EXTRA_ANNOYING_TIME = 15000;

const ALARM_FREQUENCY = 1500;
const BEEP_INTERVAL = 250;

const DEFAULT_TIMERS = [120000, 60000, 30000];

const STATUSES = {
  NOT_RUNNING: 'not-running',
  GO: 'go',
  WARNING: 'warning',
  STOP: 'stop',
  NO_REALLY: 'no-really',
  YOUR_TIME_HAS_EXPIRED_MR_PRESIDENT: 'your-time-has-expired-mr-president'
};

const easeVal = (current, max) => {
  const percent = Math.min(current / max, 1);
  return percent ** 2;
};

const toIndicatorLabel = (status, input) => {
  switch (status) {
    case STATUSES.WARNING:
      return `${Math.round(input / 1000)} Seconds`;
    case STATUSES.STOP:
      return 'Please Stop';
    case STATUSES.NO_REALLY:
      return 'Over Time';
    case STATUSES.YOUR_TIME_HAS_EXPIRED_MR_PRESIDENT:
      return 'Your Time Has Expired Mr. President';
    default:
      return '';
  }
};

const toTimerLabel = duration => {
  const secs = Math.round(duration / 1000);
  const extraSecs = secs % 60;
  const isNearlyAMinute = secs > 30 && (extraSecs > 57 || extraSecs < 3);

  if (isNearlyAMinute) {
    return `${Math.round(secs / 60)} min`;
  }

  if (secs < 120) {
    return `${secs} sec`;
  }

  return `${Math.round(secs / 6) / 10} min`;
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
    const { setStatus, clearTimeouts, ...attrs } = vnode.attrs;

    const onclick = () => {
      clearTimeouts();
      setStatus(STATUSES.NOT_RUNNING);
    };

    return m('button.button.stop-button.col-1', { onclick, ...attrs }, 'Stop');
  }
};

const StartButton = {
  view(vnode) {
    const {
      setStatus,
      addTimeout,
      isSilent,
      duration,
      warning,
      ...attrs
    } = vnode.attrs;
    let alarmStart;

    const emitAnnoyingAlarm = () => {
      beep();
      addTimeout(emitAnnoyingAlarm, 250);
    };

    const emitAlarm = () => {
      // Start at a low volume, but not quite zero, and ease up to full volume
      const elapsedTime = Date.now() - alarmStart;
      const rampProgress = easeVal(elapsedTime, RAMP_UP_TIME);
      const volume = 0.02 + rampProgress * 0.98;

      addTimeout(() => beep({ volume }), 0);
      addTimeout(() => beep({ volume }), BEEP_INTERVAL);

      if (elapsedTime < EXTRA_ANNOYING_TIME) {
        addTimeout(emitAlarm, ALARM_FREQUENCY);
      } else {
        addTimeout(emitAnnoyingAlarm, BEEP_INTERVAL);
        setStatus(STATUSES.YOUR_TIME_HAS_EXPIRED_MR_PRESIDENT);
      }
    };

    const onclick = () => {
      setStatus(STATUSES.GO);
      if (!isSilent) {
        activate();
      }

      if (warning) {
        addTimeout(() => {
          setStatus(STATUSES.WARNING);
        }, duration - warning);
      }

      addTimeout(() => {
        setStatus(STATUSES.STOP);
      }, duration);

      addTimeout(() => {
        setStatus(STATUSES.NO_REALLY);
        if (!isSilent) {
          alarmStart = Date.now();
          emitAlarm();
        }
      }, duration + NO_REALLY_TIME);
    };

    return m('button.button', { onclick, ...attrs }, vnode.children);
  }
};

export const Timer = {
  status: STATUSES.NOT_RUNNING,
  timeouts: [],

  view({ attrs, state }) {
    const {
      hideText = false,
      isSilent = false,
      timers = [],
      warning = DEFAULT_WARNING_TIME
    } = attrs;
    const { status } = state;

    const setStatus = statusSetter(state);
    const addTimeout = timeoutAdder(state);
    const clearTimeouts = timeoutsClearer(state);

    const label = hideText ? '' : toIndicatorLabel(status, warning);
    const durations = timers.length > 0
      ? timers.slice(0, 3).sort((a, b) => b - a)
      : DEFAULT_TIMERS;

    const buttons = status === STATUSES.NOT_RUNNING
      ? durations.map(duration => (
        m(StartButton, {
          className: `col-${durations.length}`,
          setStatus,
          addTimeout,
          isSilent,
          duration,
          warning
        }, toTimerLabel(duration))
      ))
      : m(StopButton, { setStatus, clearTimeouts });

    return m('.container', [
      m('.indicator', { className: status }, label),
      m('.row', buttons)
    ]);
  }
};

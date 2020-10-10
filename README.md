# Debate Timer

https://debate-timer.netlify.app

## Usage

- Press a button to start timing 2 minutes, 1 minute, or 30 seconds
- Get a yellow warning at 10 seconds
- Starts to beep at five seconds of over time

## Customization

### notext

Use the `notext` query parameter to remove the helper text which appears during
warnings and overtime.

```
https://debate-timer.netlify.app?notext
```

### timers

Use the `timers` parameter to set the durations for up to three timers. Specify
times in seconds, separated by commas.

```
https://debate-timer.netlify.app?timers=120,60,30
https://debate-timer.netlify.app?timers=15,45
```

### timer

Alternatively, one or more `timer` parameters can be used to specify timer
durations.

```
https://debate-timer.netlify.app?timer=120&timer=60&timer=30
https://debate-timer.netlify.app?timer=90
```

### warning

You can also specify the amount of time left before the warning appears. Use
zero or a negative number to disable the warning completely.

```
https://debate-timer.netlify.app?warning=20
https://debate-timer.netlify.app?warning=-1
```

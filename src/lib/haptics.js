// Haptic feedback utility — uses Vibration API where available
export const haptic = {
  light: () => {
    if (navigator.vibrate) navigator.vibrate(10);
  },
  medium: () => {
    if (navigator.vibrate) navigator.vibrate(25);
  },
  heavy: () => {
    if (navigator.vibrate) navigator.vibrate([30, 10, 30]);
  },
  success: () => {
    if (navigator.vibrate) navigator.vibrate([15, 10, 15, 10, 30]);
  },
  error: () => {
    if (navigator.vibrate) navigator.vibrate([50, 20, 50]);
  },
  tap: () => {
    if (navigator.vibrate) navigator.vibrate(8);
  },
};
// ============================================================
//  audioUnlock.js
//  Shared, site-wide "has the visitor interacted yet?" flag.
//
//  Browsers only allow a <video>/<audio> to autoplay WITH SOUND after
//  a real user gesture — click, tap, or key press — has happened
//  somewhere on the page. Scrolling / mouse-wheel does NOT count on
//  desktop (this is enforced by the browser, not something any code
//  can bypass). On mobile, touchstart (the start of a scroll swipe)
//  DOES count, so this unlocks naturally as soon as someone touches
//  the screen to scroll.
//
//  Any component can call isAudioUnlocked() to check, or onAudioUnlock()
//  to get notified the instant it flips to true.
// ============================================================

let unlocked = false;
const listeners = new Set();

function markUnlocked() {
  if (unlocked) return;
  unlocked = true;
  listeners.forEach((fn) => fn());
}

export function isAudioUnlocked() {
  return unlocked;
}

export function onAudioUnlock(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Attach the real, browser-recognized gesture listeners once, globally,
// the moment this module is first imported anywhere in the app.
if (typeof document !== "undefined") {
  const opts = { passive: true };
  const handler = () => markUnlocked();
  document.addEventListener("click", handler, opts);
  document.addEventListener("touchstart", handler, opts);
  document.addEventListener("keydown", handler, opts);
}
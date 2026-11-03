import { useState, useEffect } from './html.js';
import { MEMBERS } from '../data/members.js';
import { ENTRIES, WARNINGS } from '../data/calendar.js';
import { USERS } from '../data/people.js';
import { AD_BOOKINGS } from '../data/ads.js';
import { REDUCED } from './dotfield.js';

// Simulated network latency for prototype actions. Engineering replaces calls to this with real requests.
export const wait = ms => new Promise(r => setTimeout(r, REDUCED ? Math.min(ms, 150) : ms));

// A tiny observable store, same shape as a Zustand store so it can be swapped 1:1.
export function createStore(initial) {
  let state = initial; const subs = new Set();
  return {
    get: () => state,
    set(patch) { state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }; subs.forEach(f => f(state)); },
    subscribe(f) { subs.add(f); return () => subs.delete(f); }
  };
}

// Pitch deck frames pass settings in the frame name, e.g. "mi:as=cheryl&open=band:lo". They never read or write the saved session.
const FRAME_NAME = typeof window === 'undefined' ? '' : window.name || (() => { try { return window.frameElement?.name || ''; } catch { return ''; } })();
export const EMBED = /^mi:/.test(FRAME_NAME) ? new URLSearchParams(FRAME_NAME.slice(3)) : null;
const saved = EMBED ? null : (() => { try { return JSON.parse(sessionStorage.getItem('mi-session') || 'null'); } catch { return null; } })();

export const store = createStore({
  user: EMBED?.get('as') ? USERS[EMBED.get('as')] : saved?.user ? USERS[saved.user] : null,
  justSignedIn: !!EMBED?.has('morph'),       // the home sphere rolls up from the login wave once, right after sign-in
  theme: EMBED?.get('theme') || saved?.theme || 'dark',
  navOpen: true,
  members: MEMBERS,
  memberId: 'harbourline',
  entries: ENTRIES.map(e => ({ ...e, history: [...e.history] })),
  warnings: WARNINGS.map(w => ({ ...w })),
  adBookings: AD_BOOKINGS.map(b => ({ ...b })),
  done: [],                  // completed next-best-action keys
  hot: null,                 // { id, from: 'sphere'|'panel' } member under the pointer, shared by the sphere and the side panel
  overlay: null,             // { kind: 'sera'|'entry'|'new'|'bulk'|'notifs', ...props }
  toasts: []
});

function persist() { if (EMBED) return; try { const s = store.get(); sessionStorage.setItem('mi-session', JSON.stringify({ user: s.user?.id, theme: s.theme })); } catch {} }

export function useStore() {
  const [s, setS] = useState(store.get());
  useEffect(() => store.subscribe(setS), []);
  return s;
}

const log = (e, who, what) => ({ ...e, history: [...e.history, ['3 Nov', who, what]] });
let toastId = 0;

export const actions = {
  toast(msg, tone = 'ok', life = 3400) {
    const id = ++toastId;
    store.set(s => ({ toasts: [...s.toasts, { id, msg, tone }] }));
    setTimeout(() => store.set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), life);
  },
  open(kind, props = {}) { store.set({ overlay: { kind, ...props } }); },
  close() { store.set({ overlay: null, hot: null }); },
  hot(id, from) { const h = store.get().hot; if ((h?.id || null) !== id) store.set({ hot: id ? { id, from } : null }); },

  async signIn(id) {
    await wait(900);
    store.set({ user: USERS[id], justSignedIn: true, overlay: null }); persist();
  },
  landed() { store.set({ justSignedIn: false }); },
  signOut() { store.set({ user: null, overlay: null }); persist(); },
  // Ads: approve or send back a booking, or book a placement directly
  async adDecide(id, st) {
    await wait(700);
    store.set(s => ({ adBookings: s.adBookings.map(b => b.id === id ? { ...b, st } : b) }));
    actions.toast(st === 'booked' ? 'Approved. The advertiser has been told and the placement is booked.' : 'Sent back to the advertiser with a request for changes.', st === 'booked' ? 'ok' : 'info');
  },
  async adBook(b) {
    await wait(800);
    store.set(s => ({ adBookings: [{ id: 'b' + Date.now(), st: 'booked', when: '3 Nov', fresh: true, ...b }, ...s.adBookings], overlay: null }));
    actions.toast(`Booked for ${b.who}. It shows on the placement grid.`);
  },
  toggleTheme() { store.set(s => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })); persist(); },
  toggleNav() { store.set(s => ({ navOpen: !s.navOpen })); },

  selectMember(id) { store.set({ memberId: id }); },
  async doAction(member, i, label) {
    await wait(700);
    store.set(s => ({ done: [...s.done, member.id + ':' + i] }));
    actions.toast(label + ' · logged on the member record in the CRM');
  },

  // calendar
  async addEntries(list, who) {
    await wait(900);
    const made = list.map((e, i) => ({ id: 'n' + Date.now() + i, channels: [], stage: 'draft', fresh: true, history: [['3 Nov', who, 'Created the entry']], ...e }));
    store.set(s => ({ entries: [...s.entries, ...made], overlay: null }));
    actions.toast(made.length === 1 ? 'Added to the shared calendar. Sera is suggesting channels.' : made.length + ' entries added to the shared calendar.');
    return made;
  },
  async applyFix(id) {
    await wait(700);
    store.set(s => ({ warnings: s.warnings.filter(w => w.id !== id) }));
    actions.toast('Calendar updated. Members affected will get one fewer message that week.');
  },

  // landing page for one channel of an entry: { mode: 'existing', url } or { mode: 'custom', url, headline, summary, cta, form }
  setLanding(id, ch, l) { store.set(s => ({ entries: s.entries.map(e => e.id === id ? { ...e, landing: { ...(e.landing || {}), [ch]: l } } : e) })); },

  // workflow
  async submit(id, channels, who) {
    await wait(900);
    store.set(s => ({ entries: s.entries.map(e => e.id === id ? log({ ...e, channels, stage: 'audience', fresh: true }, who, 'Sent for audience sign-off (' + channels.length + ' channels)') : e) }));
    actions.toast('Sent to Membership for audience sign-off.');
  },
  async approve(id, user) {
    await wait(800);
    let next;
    store.set(s => ({ entries: s.entries.map(e => {
      if (e.id !== id) return e;
      next = e.stage === 'audience' ? 'creative' : 'scheduled';
      return log({ ...e, stage: next, fresh: false }, user.name, e.stage === 'audience' ? 'Approved the audience' : 'Approved the creative');
    }) }));
    actions.toast(next === 'creative' ? 'Audience approved. Sent to the Marketing & Communications Department for creative sign-off.' : 'Creative approved. Scheduled to send on the planned dates.');
  },
  async requestChanges(id, user, note) {
    await wait(700);
    store.set(s => ({ entries: s.entries.map(e => e.id === id ? log({ ...e, stage: 'draft', fresh: false }, user.name, 'Asked for changes: ' + (note || 'see comments')) : e) }));
    actions.toast('Sent back to the owner with your comments.', 'info');
  }
};

store.subscribe(s => { document.documentElement.dataset.theme = s.theme; });
document.documentElement.dataset.theme = store.get().theme;

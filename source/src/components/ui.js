import { html, useState, useRef, useEffect } from '../lib/html.js';
import { Icon } from '../lib/icons.js';
import { actions, EMBED } from '../lib/store.js';

// Button with built-in async states: if onClick returns a promise it shows loading → success → idle.
export function Button({ variant = 'p', size, block, icon, disabled, done, doneLabel, type = 'button', onClick, children, cls = '', label }) {
  const [state, setState] = useState('idle');
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  const shown = done ? 'success' : state;
  async function handle(e) {
    if (state !== 'idle' || done) return;
    const r = onClick && onClick(e);
    if (r && typeof r.then === 'function') {
      setState('loading');
      try { await r; if (!alive.current) return; setState('success'); setTimeout(() => alive.current && setState('idle'), 1500); }
      catch { if (alive.current) setState('idle'); }
    }
  }
  const classes = ['btn', 'btn-' + variant, size && 'btn-' + size, block && 'btn-block', cls].filter(Boolean).join(' ');
  return html`<button type=${type} class=${classes} data-state=${shown} disabled=${disabled} aria-busy=${shown === 'loading'} aria-label=${label} onClick=${handle}>
    <span class="btn-label">${shown === 'success' ? html`<${Icon} name="check"/>${doneLabel || 'Done'}` : html`${icon && html`<${Icon} name=${icon}/>`}${children}`}</span>
    ${shown === 'loading' && html`<span class="btn-spin" aria-hidden="true"></span>`}
  </button>`;
}

export const Chip = ({ tone = '', children }) => html`<span class=${'chip ' + tone}>${children}</span>`;
export const Avatar = ({ ab, size = 36, tone = '' }) => html`<span class=${'av ' + tone} style=${`width:${size}px;height:${size}px;font-size:${size * .36}px`}>${ab}</span>`;
export const Empty = ({ icon = 'inbox', title, children }) => html`<div class="empty"><${Icon} name=${icon}/><b>${title}</b>${children && html`<p>${children}</p>`}</div>`;

export function Modal({ title, children, footer, onClose = actions.close, wide }) {
  const ref = useRef();
  useEffect(() => {
    const prev = document.activeElement;
    if (!EMBED) ref.current?.querySelector('input,textarea,select')?.focus({ preventScroll: true });
    const key = e => e.key === 'Escape' && onClose();
    addEventListener('keydown', key);
    return () => { removeEventListener('keydown', key); prev?.focus?.({ preventScroll: true }); };
  }, []);
  return html`<div class="scrim" onClick=${e => e.target === e.currentTarget && onClose()}>
    <div class=${'modal' + (wide ? ' wide' : '')} role="dialog" aria-modal="true" aria-label=${title} ref=${ref}>
      <div class="mhd"><h3>${title}</h3><button class="icon-btn" aria-label="Close" onClick=${onClose}><${Icon} name="x"/></button></div>
      <div class="mbd">${children}</div>
      ${footer && html`<div class="mft">${footer}</div>`}
    </div></div>`;
}

export function Drawer({ label, children, onClose = actions.close, modal = true }) {
  useEffect(() => { const key = e => e.key === 'Escape' && onClose(); addEventListener('keydown', key); return () => removeEventListener('keydown', key); }, []);
  return html`${modal && html`<div class="scrim scrim-side" onClick=${onClose}></div>`}<aside class=${'drawer' + (modal ? '' : ' side-panel')} role=${modal ? 'dialog' : 'complementary'} aria-label=${label}>${children}</aside>`;
}

export function Toasts({ toasts }) {
  return html`<div class="toasts" aria-live="polite">${toasts.map(t => html`<div key=${t.id} class=${'toast ' + t.tone} role="status">
    <${Icon} name=${t.tone === 'info' ? 'info' : t.tone === 'err' ? 'alert' : 'check'}/><span>${t.msg}</span></div>`)}</div>`;
}

// Animated number, used for counts that change
export function Count({ value }) {
  const [v, setV] = useState(value); const from = useRef(value);
  useEffect(() => {
    const a = from.current, b = value, t0 = performance.now(); let raf;
    const step = now => { const k = Math.min(1, (now - t0) / 700); setV(Math.round(a + (b - a) * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(step); else from.current = b; };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [value]);
  return html`${v.toLocaleString('en-SG')}`;
}

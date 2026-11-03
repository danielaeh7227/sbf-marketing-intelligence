import { html, useState, useRef, useEffect, useMemo } from '../lib/html.js';
import { Icon } from '../lib/icons.js';
import { actions, EMBED } from '../lib/store.js';
import { navigate } from '../lib/router.js';
import { BAND, BAND_COUNTS } from '../data/members.js';
import { SERA } from '../data/people.js';
import { fmtDate } from '../data/channels.js';
import { TYPES, TODAY } from '../data/calendar.js';
import { DotCanvas } from '../components/DotCanvas.js';
import { Constellation } from '../lib/constellation.js';
import { myQueue } from '../components/Shell.js';

// What Sera suggests as you type, on top of the role's own prompts
const ASK_MORE = ['What is coming up in the next 30 days?', 'Who are our most active members?', 'Draft a welcome for new members',
  'Which members have overdue renewals?', 'Which events clash this month?', 'Summarise the Associates Night audience',
  'Draft a LinkedIn post for the Indonesia briefing', 'Which members opened BizSpoke but never attend events?'];

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

export function Overview({ s }) {
  const field = useRef(), tip = useRef();
  const [hover, setHover] = useState(null);
  const panel = s.overlay?.kind === 'band' ? s.overlay : null, focus = panel?.band || null;
  const queue = myQueue(s), noun = s.user.approves;
  const points = useMemo(() => s.members.map(m => ({ size: .14 + .86 * Math.pow(m.score / 100, 1.6), tone: m.band, data: m })), []);
  const upcoming = s.entries.filter(e => e.date >= TODAY && e.stage !== 'review').sort((a, b) => a.date.localeCompare(b.date));
  const attention = s.members.filter(m => m.band === 'lo').sort((a, b) => (b.billing ? 1 : 0) - (a.billing ? 1 : 0) || a.delta - b.delta).slice(0, 4);

  // the login wave rolls up into the sphere once, right after sign-in
  useEffect(() => {
    if (!s.justSignedIn) return;
    const t = setTimeout(() => { field.current?.morph(1, 2800); actions.landed(); }, 250);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => { field.current?.setFocus(focus); }, [focus]);
  // the side panel spotlights the row under the pointer, or else the member it is showing
  const spotId = s.hot?.from === 'panel' ? s.hot.id : panel?.id || null;
  useEffect(() => { field.current?.spotlight(spotId ? s.members.findIndex(m => m.id === spotId) : -1); }, [spotId]);

  // tooltip follows the dot without re-rendering the page each frame
  const onHover = h => {
    if (field.current?.spot < 0) actions.hot(h && panel ? h.data.id : null, 'sphere'); // tell the side panel which member is under the pointer
    if (!h) { setHover(null); return; }
    if (tip.current) tip.current.style.transform = `translate(${h.x}px, ${h.y - h.r - 12}px)`;
    setHover(prev => prev?.id === h.data.id ? prev : h.data);
  };

  return html`
  <section class=${'home' + (panel ? ' panel-open' : '')}>
    <${Sky} field=${field}/>
    <h1 class="greet">${greeting()}, ${s.user.first}.<br/>
      <span>${queue.length ? html`<a class="cue" href=${'#/approve/' + queue[0].id}>${queue.length} ${queue.length === 1 ? 'item needs' : 'items need'} your ${noun} sign-off<${Icon} name="chevR"/></a>` : 'Nothing is waiting on you today.'}</span></h1>
    <div class="stage">
      <${DotCanvas} points=${points} shape=${s.justSignedIn ? 'wave' : 'sphere'} scale=${1.18} field=${f => field.current = f}
        onHover=${onHover} onPick=${m => panel ? actions.open('band', { band: m.band, id: m.id }) : (actions.selectMember(m.id), navigate('know/' + m.id))}/>
      <div class="dot-tip" ref=${tip} hidden=${!hover}>${hover && html`<b>${hover.name}</b><span>${hover.sector} · ${hover.tier}</span>
        <span class="tip-score"><i class=${'sw ' + hover.band}></i>${BAND[hover.band][0]} · score ${hover.score}${hover.billing ? ' · billing' : ''}</span>`}</div>
    </div>
    <div class="console">
      <div class="legend" role="group" aria-label="Filter the sphere">
        ${['hi', 'mid', 'lo'].map(b => html`<button class=${'lg ' + (focus === b ? 'on' : '')} aria-pressed=${focus === b} onClick=${() => focus === b ? actions.close() : actions.open('band', { band: b })}>
          <i class=${'sw ' + b}></i>${BAND[b][0]} <b>${BAND_COUNTS[b]}</b></button>`)}
      </div>
      <small class="legend-note">Each circle is a member company (sample of ${s.members.length}). Bigger and greener means more active. Drag to turn. Pick a group to see its members.</small>
      <${AskSera} s=${s}/>
    </div>
  </section>

  <section class="below">
    <div class="card">
      <h3>Waiting on You <small>${s.user.role === 'md' ? 'Audience sign-off' : 'Creative sign-off'}</small></h3>
      ${queue.length ? queue.map(e => html`<a class="row-link" href=${'#/approve/' + e.id}>
        <span class=${'type-dot ' + e.type}></span><span class="grow"><b>${e.title}</b><small>Requested by ${e.owner} · ${fmtDate(e.date)} · ${e.audience.count.toLocaleString('en-SG')} members</small></span><${Icon} name="chevR"/></a>`)
        : html`<p class="muted">All clear. New items appear here as soon as they are submitted.</p>`}
    </div>
    <div class="card">
      <h3>Coming Up <small>Shared calendar</small></h3>
      ${upcoming.slice(0, 5).map(e => html`<a class="row-link" href=${'#/plan/' + e.id}>
        <span class="date-chip"><b>${fmtDate(e.date, { day: 'numeric' })}</b>${fmtDate(e.date, { month: 'short' })}</span>
        <span class="grow"><b>${e.title}</b><small>${TYPES[e.type][0]} · Requested by ${e.owner}</small></span><span class=${'stage-chip ' + e.stage}>${e.stage === 'audience' ? 'Audience' : e.stage === 'creative' ? 'Creative' : e.stage[0].toUpperCase() + e.stage.slice(1)}</span></a>`)}
    </div>
    <div class="card">
      <h3>Needs Attention <small>Orange on the sphere</small></h3>
      ${attention.map(m => html`<a class="row-link" href=${'#/know/' + m.id} onClick=${() => actions.selectMember(m.id)}>
        <span class="av av-sm lo">${m.ab}</span><span class="grow"><b>${m.name.replace(/ Pte Ltd$/, '')}</b><small>${m.billing || ('Score ' + m.score + ' · ' + (m.delta < 0 ? 'down ' + -m.delta : 'up ' + m.delta) + ' in 60 days')}</small></span><${Icon} name="chevR"/></a>`)}
    </div>
  </section>`;
}

// Background: linked dots that orbit the sphere and now and then link into its member dots
function Sky({ field }) {
  const ref = useRef();
  useEffect(() => {
    const sphere = () => {
      const f = field.current, S = f?.sphere; if (!S) return null;
      const a = f.cv.getBoundingClientRect(), b = ref.current.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top;
      return { x: S.x + dx, y: S.y + dy, r: S.r, dx, dy, dots: f.pts };
    };
    const c = new Constellation(ref.current, { sphere }); return () => c.destroy();
  }, []);
  return html`<canvas class="sky" ref=${ref} aria-hidden="true"></canvas>`;
}

// Keyboard-first ask box. Suggestions appear once you start typing; Tab takes the faded completion.
function AskSera({ s }) {
  const [q, setQ] = useState(''), [sel, setSel] = useState(-1), [open, setOpen] = useState(false);
  const input = useRef();
  const all = useMemo(() => [...new Set([...SERA[s.user.role].prompts, ...ASK_MORE])], [s.user.role]);
  const typed = q.trim().toLowerCase(), words = typed.split(/\s+/).filter(w => w.length > 1);
  const matches = typed ? all.map(p => { const l = p.toLowerCase(); return [p, (l.startsWith(typed) ? 10 : 0) + words.filter(w => l.includes(w)).length]; })
    .filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([p]) => p) : [];
  const list = matches.length ? matches : all.slice(0, 3);
  const ghost = typed && matches[0]?.toLowerCase().startsWith(q.toLowerCase()) ? matches[0].slice(q.length) : '';

  useEffect(() => {
    if (!EMBED && matchMedia('(pointer: fine)').matches) input.current?.focus({ preventScroll: true });
    const key = e => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) { e.preventDefault(); input.current?.focus(); } };
    addEventListener('keydown', key); return () => removeEventListener('keydown', key);
  }, []);

  const ask = text => { if (!text.trim()) return; actions.open('sera', { ask: text.trim() }); setQ(''); setSel(-1); setOpen(false); };
  const onKey = e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setOpen(true); setSel(i => e.key === 'ArrowDown' ? (i + 1 < list.length ? i + 1 : -1) : (i > -1 ? i - 1 : list.length - 1)); } // -1 is the typed text
    else if (e.key === 'Tab' && ghost) { e.preventDefault(); setQ(q + ghost); }
    else if (e.key === 'Escape') { setOpen(false); setSel(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); ask(sel >= 0 && sel < list.length ? list[sel] : q); }
  };
  const showSugg = open && typed;

  return html`<form class="ask" onSubmit=${e => e.preventDefault()}>
    <div class="ask-sugg" role="listbox" id="ask-sugg" hidden=${!showSugg}>
      <small>${matches.length ? 'Suggestions' : 'Try asking'}</small>
      ${list.map((p, i) => html`<button type="button" role="option" aria-selected=${i === sel} class=${i === sel ? 'on' : ''} onMouseDown=${e => e.preventDefault()} onClick=${() => ask(p)}>
        <${Icon} name="spark"/><span>${p}</span></button>`)}
    </div>
    <div class="ask-box">
      <span class="sera-av sm"><span class="sera-dot"></span></span>
      <div class="ask-field">
        <span class="ask-ghost" aria-hidden="true"><span>${q}</span>${ghost}</span>
        <input ref=${input} value=${q} placeholder="Ask Sera" aria-label="Ask Sera" autocomplete="off"
          role="combobox" aria-expanded=${!!showSugg} aria-controls="ask-sugg"
          onInput=${e => { setQ(e.target.value); setSel(-1); setOpen(true); }} onKeyDown=${onKey} onBlur=${() => document.hasFocus() && setOpen(false)} onFocus=${() => setOpen(true)}/>
      </div>
      <kbd class="ask-kbd" hidden=${!q}>${ghost ? 'Tab' : 'Enter'}</kbd>
      <button type="button" class="icon-btn" aria-label="Attach a file" onClick=${() => actions.open('sera', { attach: true })}><${Icon} name="clip"/></button>
      <button type="button" class="ask-mic" aria-label="Speak to Sera" onClick=${() => actions.open('sera', { listen: true })}><${Icon} name="mic"/></button>
    </div>
  </form>`;
}

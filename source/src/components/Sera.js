import { html, useState, useEffect, useRef } from '../lib/html.js';
import { Icon } from '../lib/icons.js';
import { actions, wait, EMBED } from '../lib/store.js';
import { navigate } from '../lib/router.js';
import { SERA } from '../data/people.js';
import { BAND_COUNTS } from '../data/members.js';
import { fmtDate } from '../data/channels.js';
import { myQueue } from './Shell.js';

// Sera: the assistant. Prepared answers per role; voice is simulated (it "hears" the first suggestion).
export function Sera({ s, listen, type, ask, attach }) {
  const role = SERA[s.user.role];
  const [msgs, setMsgs] = useState([{ who: 'sera', parts: [`Hi ${s.user.first}. Ask me about members, the calendar, drafts or results. I suggest and draft; you decide.`] }]);
  const [text, setText] = useState(''), [busy, setBusy] = useState(false), [hearing, setHearing] = useState(!!listen);
  const input = useRef(), end = useRef();

  async function send(q) {
    if (!q.trim() || busy) return;
    setMsgs(m => [...m, { who: 'me', parts: [q] }]); setText(''); setBusy(true);
    await wait(900);
    // the sign-off answer is built from the live queue, so it stays true after approvals
    const queue = myQueue(s), noun = s.user.approves;
    const live = q === role.prompts[0] && (queue.length ? [`${queue.length === 1 ? 'One entry needs' : queue.length + ' entries need'} your ${noun} sign-off:`,
      ...queue.map(e => `• ${e.title}, ${fmtDate(e.date)}: ${e.channels.length} channels for ${e.audience.count.toLocaleString('en-SG')} members.`), { go: 'approve', label: 'Open approvals' }]
      : ['Nothing needs your sign-off right now. New items appear in Approve as soon as they are submitted.']);
    const known = live || role.answers[q] || Object.entries(role.answers).find(([k]) => k.toLowerCase().split(' ').filter(w => w.length > 4).some(w => q.toLowerCase().includes(w)))?.[1];
    const parts = (known || ["I can't answer that in this prototype. In the full product I answer from member, calendar and campaign data. Try one of the suggestions below."])
      .map(p => typeof p === 'string' ? p.replace('{lo}', BAND_COUNTS.lo) : p);
    setMsgs(m => [...m, { who: 'sera', parts }]); setBusy(false);
  }

  useEffect(() => {
    if (ask) send(ask);
    if (type && !EMBED) input.current?.focus();
    if (attach) setMsgs(m => [...m, { who: 'sera', parts: ['Attach a brief, a CSV of events or a past campaign report and I will turn it into calendar entries or a post-mortem. (File upload is not part of this prototype.)'] }]);
    if (listen) { const t = setTimeout(() => { setHearing(false); send(role.prompts[0]); }, 2200); return () => clearTimeout(t); }
  }, []);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }); }, [msgs, busy]);

  return html`<div class="dr-head"><span class="sera-av"><span class="sera-dot"></span></span><div class="grow"><h2>Sera</h2><small>Marketing Intelligence assistant</small></div>
      <button class="icon-btn" aria-label="Close" onClick=${actions.close}><${Icon} name="x"/></button></div>
    <div class="chat" aria-live="polite">
      ${msgs.map(m => html`<div class=${'msg ' + m.who}>${m.parts.map(p => typeof p === 'string' ? html`<p>${p}</p>`
        : html`<button class="btn btn-o btn-sm" onClick=${() => { actions.close(); navigate(p.go); }}>${p.label}<${Icon} name="arrow"/></button>`)}</div>`)}
      ${busy && html`<div class="msg sera typing"><i></i><i></i><i></i></div>`}
      ${hearing && html`<div class="hearing"><span class="wave">${[0, 1, 2, 3, 4, 5, 6].map(i => html`<i style=${'--i:' + i}></i>`)}</span>Listening…</div>`}
      <div ref=${end}></div>
    </div>
    <div class="chat-sugg">${role.prompts.map(p => html`<button class="prompt sm" onClick=${() => send(p)}>${p}</button>`)}</div>
    <form class="chat-in" onSubmit=${e => { e.preventDefault(); send(text); }}>
      <input ref=${input} value=${text} onInput=${e => setText(e.target.value)} placeholder="Ask Sera" aria-label="Message Sera"/>
      <button class="icon-btn" type="submit" aria-label="Send" disabled=${!text.trim()}><${Icon} name="arrow"/></button>
    </form>`;
}

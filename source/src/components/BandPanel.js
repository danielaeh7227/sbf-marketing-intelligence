import { html, useState, useEffect, useRef } from '../lib/html.js';
import { Icon } from '../lib/icons.js';
import { actions } from '../lib/store.js';
import { navigate } from '../lib/router.js';
import { BAND } from '../data/members.js';
import { Chip } from './ui.js';

const BAND_NOTE = { hi: 'Score 70 and above. Keep them close and give them a stage.', mid: 'Score 40 to 69. Room to deepen the relationship.', lo: 'Below 40. Reach out before renewal.' };
const TL_KIND = { ev: 'plan', em: 'mail', web: 'globe', so: 'linkedin', ac: 'check' };

// Side panel opened from the sphere legend: the members in one band, then one member's summary.
// It sits beside the sphere (no scrim) so the highlighted band stays in view.
export function BandPanel({ s, band, id }) {
  const [q, setQ] = useState(''), [limit, setLimit] = useState(40);
  const listRef = useRef(), hot = s.hot?.id;
  const all = s.members.filter(m => m.band === band)
    .sort(band === 'lo' ? (a, b) => (b.billing ? 1 : 0) - (a.billing ? 1 : 0) || a.score - b.score : (a, b) => b.score - a.score);
  const ql = q.trim().toLowerCase();
  const list = ql ? all.filter(x => (x.name + ' ' + x.sector + ' ' + x.contact[0]).toLowerCase().includes(ql)) : all;
  // a dot hovered on the sphere scrolls its row into view
  useEffect(() => {
    if (id || s.hot?.from !== 'sphere' || !hot) return;
    const i = list.findIndex(x => x.id === hot);
    if (i >= limit) setLimit(i + 20);
    requestAnimationFrame(() => listRef.current?.querySelector(`[data-id="${hot}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  }, [hot]);
  const m = id && s.members.find(x => x.id === id);
  if (m) return html`<${MemberCard} m=${m} band=${band}/>`;

  const avg = Math.round(all.reduce((n, x) => n + x.score, 0) / all.length);
  const falling = all.filter(x => x.delta < 0).length, billing = all.filter(x => x.billing).length;

  return html`<div class="dr-head"><span class=${'sw sw-lg ' + band}></span><div class="grow"><h2>${BAND[band][0]} <small>${all.length} members</small></h2><small>${BAND_NOTE[band]}</small></div>
      <button class="icon-btn" aria-label="Close" onClick=${actions.close}><${Icon} name="x"/></button></div>
    <div class="dr-body">
      <div class="band-stats"><span><b>${avg}</b>Average score</span><span><b>${falling}</b>Down in 60 days</span><span><b>${billing}</b>Billing issues</span></div>
      <label class="search"><${Icon} name="search"/><input placeholder="Search this group" value=${q} onInput=${e => { setQ(e.target.value); setLimit(40); }}/></label>
      <div class="band-list" ref=${listRef} onMouseLeave=${() => actions.hot(null, 'panel')}>
        ${list.length === 0 && html`<p class="muted small">No members match.</p>`}
        ${list.slice(0, limit).map(x => html`<button class=${'mrow' + (x.id === hot ? ' hot' : '')} data-id=${x.id}
          onMouseEnter=${() => actions.hot(x.id, 'panel')} onFocus=${() => actions.hot(x.id, 'panel')} onClick=${() => actions.open('band', { band, id: x.id })}>
          <span class=${'av av-sm ' + x.band}>${x.ab}</span>
          <span class="grow"><b>${x.name.replace(/ Pte Ltd$/, '')}</b><small>${x.billing ? x.billing : x.sector + ' · ' + (x.delta >= 0 ? '+' : '') + x.delta + ' in 60 days'}</small></span>
          <span class=${'score ' + x.band}>${x.score}</span><${Icon} name="chevR"/></button>`)}
        ${list.length > limit && html`<button class="more" onClick=${() => setLimit(l => l + 60)}>Show more (${list.length - limit} left)</button>`}
      </div>
    </div>`;
}

function MemberCard({ m, band }) {
  const [act, why] = m.nba[0] ? m.nba[0].slice(1) : [];
  return html`<div class="dr-head"><button class="icon-btn" aria-label="Back to the list" onClick=${() => actions.open('band', { band })}><${Icon} name="back"/></button>
      <div class="grow"><small>${BAND[band][0]}</small></div>
      <button class="icon-btn" aria-label="Close" onClick=${actions.close}><${Icon} name="x"/></button></div>
    <div class="dr-body" key=${m.id}>
      <div class="mc-head"><span class=${'av av-lg ' + m.band}>${m.ab}</span>
        <div class="grow"><h2>${m.name}</h2><small class="muted">${m.sector} · ${m.tier} since ${m.since}</small>
          <p class="contact"><${Icon} name="users"/>${m.contact[0]}, ${m.contact[1]}</p></div></div>
      <div class="mc-score"><span class=${'score-ring ' + m.band} style=${'--v:' + m.score}><b>${m.score}</b></span>
        <div><${Chip} tone=${BAND[m.band][1]}>${BAND[m.band][0]}<//><p class=${'small ' + (m.delta < 0 ? 'neg' : 'pos')}>${m.delta >= 0 ? '+' : ''}${m.delta} points in 60 days</p>
          ${m.billing ? html`<${Chip} tone="warn">${m.billing}<//>` : html`<p class="muted small">Billing in good standing</p>`}</div></div>
      ${act && html`<div class="sera-note"><span class="sera-dot"></span><span><b>Next Best Action:</b> ${act}<small>${why}</small></span></div>`}
      <h4>Recent Interactions</h4>
      <ol class="tl">${m.tl.slice(0, 4).map(([d, k, t]) => html`<li><span class=${'tl-ic ' + k}><${Icon} name=${TL_KIND[k] || 'info'}/></span><span class="grow">${t}</span><small>${d}</small></li>`)}</ol>
      ${m.ext.length > 0 && html`<h4>Outside SBF</h4>${m.ext.slice(0, 2).map(([src, t]) => html`<div class="ext"><b>${src}</b><p>${t}</p></div>`)}`}
    </div>
    <div class="dr-foot">
      <button class="btn btn-p" onClick=${() => { actions.selectMember(m.id); navigate('know/' + m.id); }}>Open full profile<${Icon} name="arrow"/></button>
      <button class="btn btn-o" onClick=${() => navigate('create')}>Draft a message</button>
    </div>`;
}

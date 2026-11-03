import { html, useState } from '../lib/html.js';
import { Icon } from '../lib/icons.js';
import { actions } from '../lib/store.js';
import { RESULTS, TYPES } from '../data/calendar.js';
import { CHANNELS, chName, fmtDate } from '../data/channels.js';
import { BAND_COUNTS } from '../data/members.js';
import { Button, Chip, Count } from '../components/ui.js';

// Members per activity band, month by month (sample, modelled), ending at today's counts
const TREND = [[-38, -8, 46], [-32, -4, 36], [-25, 0, 25], [-17, 2, 15], [-8, 0, 8], [0, 0, 0]]
  .map(([a, b, c], i) => [['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'][i], BAND_COUNTS.hi + a, BAND_COUNTS.mid + b, BAND_COUNTS.lo + c]);
const CH_BENCH = [['invite', 'Opened', 45, 'Clicked', 18], ['wa', 'Read', 88, 'Tapped', 34], ['letter', 'Opened', 79, 'RSVP', 29], ['welcome', 'Opened', 89, 'Clicked', 55], ['bizspoke', 'Opened', 39, 'Clicked', 6], ['li', 'Engaged', 2.9, 'Sign-ups', .4]];
const NEXT_ICON = { mice: 'plan', call: 'phone', news: 'news', onboard: 'hand', story: 'spark' };

export function Learn({ s, route }) {
  const past = s.entries.filter(e => e.stage === 'review').sort((a, b) => b.date.localeCompare(a.date));
  const [sel, setSel] = useState(route.id && RESULTS[route.id] ? route.id : past[0].id);
  const e = s.entries.find(x => x.id === sel), r = RESULTS[sel];
  const funnel = [['Sent', r.sent], ['Opened', r.opened], ['Clicked', r.clicked], ...(r.rsvp ? [['RSVP', r.rsvp], ['Attended', r.attended]] : [])];
  const max = Math.max(...TREND.map(t => t[1] + t[2] + t[3]));

  return html`<div class="learn">
    <div class="kpis">
      <div class="card kpi"><small>Messages Sent This Quarter</small><b><${Count} value=${71840}/></b><span class="pos"><${Icon} name="up"/>12% on last quarter</span></div>
      <div class="card kpi"><small>Average Open Rate</small><b>41%</b><span class="pos"><${Icon} name="up"/>3 points</span></div>
      <div class="card kpi"><small>RSVPs That Attended</small><b>82%</b><span class="pos"><${Icon} name="up"/>No-shows down to 18%</span></div>
      <div class="card kpi"><small>Members Moved Up a Band</small><b><${Count} value=${38}/></b><span class="muted">Since June · 46 fewer need attention</span></div>
    </div>

    <div class="learn-grid">
      <aside class="card list-pane">
        <h3>Campaigns <small>Reviewed by Sera</small></h3>
        ${past.map(x => html`<button class=${'arow ' + (x.id === sel ? 'on' : '')} onClick=${() => setSel(x.id)}>
          <span class=${'type-dot ' + x.type}></span><span class="grow"><b>${x.title}</b><small>${fmtDate(x.date)} · ${TYPES[x.type][0]}</small>
          <span class="arow-tags">${RESULTS[x.id].goalMet ? html`<${Chip} tone="ok">Goal met<//>` : html`<${Chip} tone="warn">Goal missed<//>`}</span></span></button>`)}
      </aside>

      <section class="pm" key=${sel}>
        <div class="card">
          <h3>${e.title} <small>Goal: ${e.goal}</small></h3>
          <div class="funnel">${funnel.map(([l, v], i) => html`<div class="fn" style=${'--w:' + Math.max(4, v / r.sent * 100) + '%;--i:' + i}>
            <span>${l}</span><i></i><b>${v.toLocaleString('en-SG')}</b><small>${i ? Math.round(v / r.sent * 100) + '%' : ''}</small></div>`)}</div>
          <div class="ch-results">${r.channels.map(([k, t]) => html`<div><${Icon} name=${CHANNELS[k].icon}/><b>${chName(k)}</b><small>${t}</small></div>`)}</div>
        </div>
        <div class="card postmortem">
          <h3><span class="sera-dot"></span>Post-mortem by Sera <small>Written 2 days after the last send</small></h3>
          <div class="pm-cols">
            <div><h4 class="pos"><${Icon} name="check"/>What Worked</h4><ul>${r.worked.map(t => html`<li>${t}</li>`)}</ul></div>
            <div><h4 class="warn-t"><${Icon} name="alert"/>What to Change</h4><ul>${r.change.map(t => html`<li>${t}</li>`)}</ul></div>
          </div>
          <h4>Next Actions</h4>
          ${r.next.map(([t, k]) => html`<div class="nba"><span class="nba-ic"><${Icon} name=${NEXT_ICON[k] || 'spark'}/></span><span class="grow"><b>${t}</b></span>
            <${Button} variant="g" size="sm" doneLabel="Added" onClick=${async () => { await actions.addEntries([{ title: t, type: k === 'call' || k === 'story' ? 'promo' : k === 'news' ? 'news' : k === 'onboard' ? 'onboard' : 'mice', dept: 'Membership Department', owner: 'Membership', date: '2026-11-24', time: '9:00 am', rsvpBy: null, eligibility: 'All members', goal: 'From post-mortem: ' + e.title, audience: { label: 'From post-mortem', count: 0, segments: [] } }], 'Sera'); }}>Add to calendar<//></div>`)}
        </div>
        <div class="card">
          <h3>By Member Group <small>Open rate and click rate</small></h3>
          ${r.segments.map(([n, o, c]) => html`<div class="bar-row two"><span>${n}</span><span class="bar"><i class="mid" style=${'width:' + o + '%'}></i><i class="hi" style=${'width:' + c + '%'}></i></span><b>${o}%<small> / ${c}%</small></b></div>`)}
        </div>
      </section>

      <aside class="side-stats">
        <div class="card">
          <h3>Member Activity <small>Since June</small></h3>
          <div class="trend">${TREND.map(([m, hi, mid, lo]) => html`<div class="tcol"><span class="tbar" style=${'height:' + ((hi + mid + lo) / max * 100) + '%'}>
            <i class="lo" style=${'flex:' + lo}></i><i class="mid" style=${'flex:' + mid}></i><i class="hi" style=${'flex:' + hi}></i></span><small>${m}</small></div>`)}</div>
          <div class="legend-s"><span><i class="sw hi"></i>Active</span><span><i class="sw mid"></i>Steady</span><span><i class="sw lo"></i>Needs attention</span></div>
        </div>
        <div class="card">
          <h3>Channel Benchmarks <small>Last 90 days</small></h3>
          ${CH_BENCH.map(([k, a, av, b, bv]) => html`<div class="bench"><${Icon} name=${CHANNELS[k].icon}/><span class="grow">${chName(k)}</span><small>${a} <b>${av}%</b> · ${b} <b>${bv}%</b></small></div>`)}
        </div>
      </aside>
    </div>
  </div>`;
}

import { html, useState, useEffect } from '../lib/html.js';
import { Icon } from '../lib/icons.js';
import { actions } from '../lib/store.js';
import { navigate } from '../lib/router.js';
import { TYPES, STAGES, TODAY, stageIndex } from '../data/calendar.js';
import { CHANNELS, fmtDate, shift, suggestChannels, chName, landingFor } from '../data/channels.js';
import { Button, Chip, Modal, Drawer } from '../components/ui.js';

const MONTHS = ['2026-09', '2026-10', '2026-11', '2026-12'];
const monthName = ym => new Date(ym + '-01T00:00:00Z').toLocaleDateString('en-SG', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const stageLabel = st => STAGES.find(x => x[0] === st)[1];

export function Plan({ s, route }) {
  const [month, setMonth] = useState('2026-11'), [view, setView] = useState('month');
  // deep link #/plan/<id>: open after App has closed the previous page's overlays (parent effects run after this one)
  useEffect(() => { if (route.id) { const e = s.entries.find(x => x.id === route.id); if (e) { setMonth(e.date.slice(0, 7)); setTimeout(() => actions.open('entry', { id: e.id })); } } }, [route.id]);
  const entries = s.entries;
  const inMonth = entries.filter(e => e.date.startsWith(month)).sort((a, b) => a.date.localeCompare(b.date));

  // month grid, Monday first
  const first = new Date(month + '-01T00:00:00Z'), lead = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const cells = Array.from({ length: Math.ceil((lead + days) / 7) * 7 }, (_, i) => { const d = i - lead + 1; return d >= 1 && d <= days ? month + '-' + String(d).padStart(2, '0') : null; });
  const mi = MONTHS.indexOf(month);

  return html`<div class="plan">
    <div class="toolbar">
      <div class="month-nav">
        <button class="icon-btn ring" aria-label="Previous month" disabled=${mi <= 0} onClick=${() => setMonth(MONTHS[mi - 1])}><${Icon} name="chevL"/></button>
        <h1>${monthName(month)}</h1>
        <button class="icon-btn ring" aria-label="Next month" disabled=${mi >= MONTHS.length - 1} onClick=${() => setMonth(MONTHS[mi + 1])}><${Icon} name="chevR"/></button>
      </div>
      <div class="seg"><button class=${view === 'month' ? 'on' : ''} onClick=${() => setView('month')}>Month</button><button class=${view === 'list' ? 'on' : ''} onClick=${() => setView('list')}>List</button></div>
      <span class="grow"></span>
      <button class="btn btn-o" onClick=${() => actions.open('bulk')}><${Icon} name="upload"/>Bulk Import</button>
      <button class="btn btn-p" onClick=${() => actions.open('new')}><${Icon} name="plus"/>New Entry</button>
    </div>

    ${s.warnings.map(w => html`<div class=${'warn-bar ' + w.tone} key=${w.id}><${Icon} name="alert"/><span class="grow"><b>Sera:</b> ${w.text}</span>
      <${Button} variant="g" size="sm" onClick=${() => actions.applyFix(w.id)}>${w.fix}<//></div>`)}

    <div class="type-legend">${Object.entries(TYPES).map(([k, [l]]) => html`<span><i class=${'type-dot ' + k}></i>${l}</span>`)}<span class="muted">· Dots Show the Sign-Off Stage</span></div>

    ${view === 'month' ? html`<div class="cal card">
      ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => html`<div class="cal-h">${d}</div>`)}
      ${cells.map(d => html`<div class=${'cal-d ' + (d ? '' : 'off ') + (d === TODAY ? 'today' : '')}>
        ${d && html`<span class="dn">${+d.slice(8)}</span>`}
        ${d && entries.filter(e => e.date === d).map(e => html`<button class=${'cal-e ' + e.type + (e.fresh ? ' fresh' : '')} onClick=${() => actions.open('entry', { id: e.id })} title=${e.title + ' · ' + stageLabel(e.stage)}>
          <i class=${'st ' + e.stage}></i>${e.title}</button>`)}
      </div>`)}
    </div>` : html`<div class="card table-card"><table class="tbl">
      <thead><tr><th>Date</th><th>Entry</th><th>Type</th><th>Audience</th><th>Channels</th><th>Stage</th></tr></thead>
      <tbody>${inMonth.length === 0 ? html`<tr><td colspan="6" class="muted">Nothing planned this month.</td></tr>` : inMonth.map(e => html`<tr onClick=${() => actions.open('entry', { id: e.id })}>
        <td data-l="Date">${fmtDate(e.date)}</td><td><b>${e.title}</b><small>Requested by ${e.owner}</small></td><td data-l="Type"><i class=${'type-dot ' + e.type}></i>${TYPES[e.type][0]}</td>
        <td data-l="Audience">${e.audience.count ? e.audience.count.toLocaleString('en-SG') : 'Public'}</td>
        <td class="ch-icons" data-l="Channels">${e.channels.length ? e.channels.map(c => html`<span title=${chName(c)}><${Icon} name=${CHANNELS[c].icon}/></span>`) : html`<span class="muted">Not chosen</span>`}</td>
        <td data-l="Stage"><span class=${'stage-chip ' + e.stage}>${stageLabel(e.stage)}</span></td></tr>`)}</tbody></table></div>`}
  </div>`;
}

export function StageTrack({ stage }) {
  const i = stageIndex(stage);
  return html`<ol class="track">${STAGES.map(([k, l, who], j) => html`<li class=${j < i ? 'done' : j === i ? 'now' : ''}><i></i><b>${l}</b><small>${who}</small></li>`)}</ol>`;
}

export function EntryDrawer({ s, id }) {
  const e = s.entries.find(x => x.id === id); if (!e) return null;
  const plan = e.channels.length ? suggestChannels(e).filter(c => e.channels.includes(c.key)) : [];
  const editable = ['draft', 'audience', 'creative'].includes(e.stage);
  return html`<div class="dr-head"><span class=${'type-dot lg ' + e.type}></span><div class="grow"><small>${TYPES[e.type][0]} · ${e.dept}</small><h2>${e.title}</h2></div>
      <button class="icon-btn" aria-label="Close" onClick=${() => { actions.close(); if (location.hash.startsWith('#/plan/')) navigate('plan'); }}><${Icon} name="x"/></button></div>
    <div class="dr-body">
      <${StageTrack} stage=${e.stage}/>
      <dl class="facts">
        <dt>When</dt><dd>${fmtDate(e.date, { weekday: 'long', day: 'numeric', month: 'long' })}${e.time ? ', ' + e.time : ''}</dd>
        ${e.venue && html`<dt>Where</dt><dd>${e.venue}</dd>`}
        ${e.rsvpBy && html`<dt>RSVP by</dt><dd>${fmtDate(e.rsvpBy)}</dd>`}
        <dt>Open to</dt><dd>${e.eligibility}</dd>
        <dt>Audience</dt><dd>${e.audience.label}${e.audience.count ? ' · ' + e.audience.count.toLocaleString('en-SG') + ' members' : ''}</dd>
        <dt>Goal</dt><dd>${e.goal}</dd>
        <dt>Requested By</dt><dd>${e.owner}</dd>
      </dl>
      <h4>Channels</h4>
      ${plan.length ? html`<ul class="plan-ch">${plan.map(c => html`<li><${Icon} name=${CHANNELS[c.key].icon}/><span class="grow">${chName(c.key)}<small>${landingFor(e, c.key).url}</small></span><small>${fmtDate(c.date)}</small></li>`)}</ul>`
        : html`<p class="muted">No channels yet. Open it in Create and Sera will suggest them, each with a landing page.</p>`}
      ${e.history.length > 0 && html`<h4>History</h4><ol class="hist">${e.history.map(([d, who, what]) => html`<li><small>${d}</small><span><b>${who}</b> ${what.charAt(0).toLowerCase() + what.slice(1)}</span></li>`)}</ol>`}
    </div>
    <div class="dr-foot">
      ${e.stage === 'review' ? html`<button class="btn btn-p" onClick=${() => { actions.close(); navigate('learn/' + e.id); }}>See Results and Post-Mortem</button>`
        : editable ? html`<button class="btn btn-p" onClick=${() => { actions.close(); navigate('create/' + e.id); }}><${Icon} name="create"/>Open in Create</button>
          ${(e.stage === 'audience' || e.stage === 'creative') && html`<button class="btn btn-o" onClick=${() => { actions.close(); navigate('approve/' + e.id); }}>View Sign-Off</button>`}`
        : html`<p class="muted">Scheduled. Sends go out on the dates above.</p>`}
    </div>`;
}

const AUDIENCES = [['All members', 34160], ['Ordinary members', 33424], ['Associate members', 736], ['Active members', 1100], ['Steady members', 1500], ['Members needing attention', 154],
  ['New members (last 30 days)', 86], ['Trade and logistics members', 1240], ['Manufacturing members', 980], ['Financial and professional services', 1460], ['SG-WEN members', 310], ['YBLN members', 420], ['PW Mark holders', 412]];

// Groups overlap, so the reach is an estimate: "All members" covers everything, otherwise the largest group plus 80% of the rest
export function reach(groups, people) {
  const n = groups.map(g => AUDIENCES.find(a => a[0] === g)[1]).sort((a, b) => b - a);
  const total = groups.includes('All members') ? 34160 : n.length ? Math.min(34160, Math.round(n[0] + n.slice(1).reduce((x, y) => x + y, 0) * .8)) : 0;
  return total + (groups.includes('All members') ? 0 : people.length);
}

function AudiencePicker({ s, groups, people, onChange, err }) {
  const [q, setQ] = useState('');
  const ql = q.trim().toLowerCase();
  const hits = ql.length < 2 ? [] : s.members.filter(m => !people.includes(m.id) && (m.name + ' ' + m.contact[0] + ' ' + m.sector).toLowerCase().includes(ql)).slice(0, 6);
  const tog = g => onChange(groups.includes(g) ? groups.filter(x => x !== g) : [...groups, g], people);
  const total = reach(groups, people);
  return html`<div class="field full aud-pick"><span>Custom Audience <small class="aud-sum">${total ? '≈ ' + total.toLocaleString('en-SG') + ' members' : 'Pick groups or members'}</small></span>
    <div class="aud-groups" role="group" aria-label="Member groups">${AUDIENCES.map(([l, n]) => html`<button type="button" class=${'aud-g ' + (groups.includes(l) ? 'on' : '')} aria-pressed=${groups.includes(l)} onClick=${() => tog(l)}>${l}<small>${n.toLocaleString('en-SG')}</small></button>`)}</div>
    <div class="aud-search"><${Icon} name="search"/><input value=${q} onInput=${x => setQ(x.target.value)} placeholder="Add specific members: company, contact or sector" aria-label="Search members"/>
      ${hits.length > 0 && html`<div class="aud-hits">${hits.map(m => html`<button type="button" onClick=${() => { onChange(groups, [...people, m.id]); setQ(''); }}><span class=${'av av-sm ' + m.band}>${m.ab}</span><span class="grow"><b>${m.name.replace(/ Pte Ltd$/, '')}</b><small>${m.contact[0]} · ${m.sector}</small></span><${Icon} name="plus"/></button>`)}</div>`}</div>
    ${people.length > 0 && html`<div class="aud-people">${people.map(id => { const m = s.members.find(x => x.id === id); return html`<span class="aud-chip">${m.name.replace(/ Pte Ltd$/, '')}<button type="button" aria-label=${'Remove ' + m.name} onClick=${() => onChange(groups, people.filter(x => x !== id))}><${Icon} name="x"/></button></span>`; })}</div>`}
    ${err ? html`<small class="err">${err}</small>` : html`<small>Membership confirms the final audience at sign-off. Consent rules apply to every member.</small>`}
  </div>`;
}

export function NewEntry({ s }) {
  const [f, setF] = useState({ title: '', type: 'mice', date: '2026-12-02', time: '9:00 am', venue: '', rsvpBy: '', eligibility: 'All members', groups: ['All members'], people: [], goal: '' });
  const [err, setErr] = useState({});
  const set = k => e => setF({ ...f, [k]: e.target.value });
  async function save() {
    const er = {}; if (!f.title.trim()) er.title = 'Give the entry a name.'; if (!f.date) er.date = 'Pick a date.'; if (!f.groups.length && !f.people.length) er.aud = 'Pick at least one group or member.';
    setErr(er); if (Object.keys(er).length) return Promise.reject();
    const segments = [...f.groups.map(g => [g, AUDIENCES.find(a => a[0] === g)[1]]), ...(f.people.length ? [['Specific members', f.people.length]] : [])];
    const label = segments.length === 1 ? segments[0][0] : 'Custom: ' + segments.map(x => x[0]).join(', ');
    const [made] = await actions.addEntries([{ title: f.title.trim(), type: f.type, dept: 'Membership Department', owner: 'Membership', date: f.date, time: f.time, venue: f.venue, rsvpBy: f.type === 'mice' ? (f.rsvpBy || shift(f.date, -7)) : null,
      eligibility: f.eligibility, goal: f.goal || 'Not set', audience: { label, count: reach(f.groups, f.people), segments, people: f.people } }], s.user.name);
    navigate('create/' + made.id);
  }
  return html`<${Modal} wide title="New Calendar Entry" footer=${html`<button class="btn btn-g" onClick=${actions.close}>Cancel</button><${Button} onClick=${save}>Add and Get Channel Ideas<//>`}>
    <div class="form">
      <label class="field full"><span>Name</span><input value=${f.title} onInput=${set('title')} placeholder="e.g. Go Global: Malaysia Market Briefing" aria-invalid=${!!err.title}/>${err.title && html`<small class="err">${err.title}</small>`}</label>
      <label class="field"><span>Type</span><select value=${f.type} onChange=${set('type')}>${Object.entries(TYPES).map(([k, [l, d]]) => html`<option value=${k}>${l} · ${d}</option>`)}</select></label>
      <div class="field"><span>Requested By</span><div class="ro-val">Membership Department</div></div>
      <label class="field"><span>Date</span><input type="date" value=${f.date} onInput=${set('date')} aria-invalid=${!!err.date}/></label>
      <label class="field"><span>Time</span><input value=${f.time} onInput=${set('time')}/></label>
      ${f.type === 'mice' && html`<label class="field"><span>Venue</span><input value=${f.venue} onInput=${set('venue')} placeholder="SBF Centre"/></label>
        <label class="field"><span>RSVP By</span><input type="date" value=${f.rsvpBy} onInput=${set('rsvpBy')}/><small>Default: a week before</small></label>`}
      <label class="field"><span>Open To</span><select value=${f.eligibility} onChange=${set('eligibility')}>${['All members', 'Associate members', 'A network only (e.g. SG-WEN, YBLN)', 'Invite only', 'Public'].map(o => html`<option value=${o}>${o}</option>`)}</select></label>
      <label class="field"><span>Goal</span><input value=${f.goal} onInput=${set('goal')} placeholder="e.g. 120 confirmed seats"/></label>
      <${AudiencePicker} s=${s} groups=${f.groups} people=${f.people} err=${err.aud} onChange=${(groups, people) => setF({ ...f, groups, people })}/>
    </div><//>`;
}

const SAMPLE_CSV = `title,type,date,audience
Go Global: Malaysia Market Briefing,mice,2026-12-03,Trade and logistics members
YBLN Year-End Mixer,mice,2026-12-10,YBLN members
Membership Renewal Reminder,promo,2026-12-01,Members needing attention
BizSpoke · January Issue,news,,All members`;

export function BulkImport({ s }) {
  const [text, setText] = useState(SAMPLE_CSV);
  const rows = text.trim().split(/\r?\n/).slice(1).filter(Boolean).map(line => {
    const [title, type, date, aud] = line.split(',').map(x => (x || '').trim());
    const problems = [!title && 'no name', !TYPES[type] && 'unknown type', !/^\d{4}-\d{2}-\d{2}$/.test(date || '') && 'no date'].filter(Boolean);
    return { title, type, date, aud, problems };
  });
  const ok = rows.filter(r => !r.problems.length);
  const file = e => { const f = e.target.files[0]; if (f) f.text().then(setText); };
  const add = () => actions.addEntries(ok.map(r => { const a = AUDIENCES.find(x => x[0] === r.aud) || [r.aud || 'All members', 0];
    return { title: r.title, type: r.type, dept: 'Membership Department', owner: 'Membership', date: r.date, time: '9:00 am', rsvpBy: r.type === 'mice' ? shift(r.date, -7) : null, eligibility: 'All members', goal: 'Not set', audience: { label: a[0], count: a[1], segments: [[a[0], a[1]]] } }; }), s.user.name);
  return html`<${Modal} wide title="Bulk Import" footer=${html`<button class="btn btn-g" onClick=${actions.close}>Cancel</button><${Button} disabled=${!ok.length} onClick=${add}>Add ${ok.length} ${ok.length === 1 ? 'entry' : 'entries'}<//>`}>
    <p class="muted">Paste rows from a spreadsheet or upload a CSV. Columns: title, type (mice, promo, news, onboard, announce), date (YYYY-MM-DD), audience. Every entry is requested by the Membership Department.</p>
    <div class="bulk">
      <div><textarea class="csv" value=${text} onInput=${e => setText(e.target.value)} spellcheck="false" aria-label="CSV rows"></textarea>
        <label class="btn btn-o btn-sm file-btn"><${Icon} name="upload"/>Upload CSV<input type="file" accept=".csv,text/csv" onChange=${file}/></label></div>
      <div class="preview"><b>Preview</b>${rows.map(r => html`<div class=${'pv-row ' + (r.problems.length ? 'bad' : '')}>
        <${Icon} name=${r.problems.length ? 'alert' : 'check'}/><span class="grow"><b>${r.title || 'Untitled'}</b><small>${r.problems.length ? 'Skipped: ' + r.problems.join(', ') : (TYPES[r.type][0] + ' · ' + fmtDate(r.date) + ' · ' + (r.aud || 'All members'))}</small></span></div>`)}</div>
    </div><//>`;
}

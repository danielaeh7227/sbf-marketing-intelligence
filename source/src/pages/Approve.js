import { html, useState } from '../lib/html.js';
import { Icon } from '../lib/icons.js';
import { actions } from '../lib/store.js';
import { navigate } from '../lib/router.js';
import { TYPES } from '../data/calendar.js';
import { CHANNELS, suggestChannels, copyFor, fmtDate, chName, landingFor, pageTitle } from '../data/channels.js';
import { USERS } from '../data/people.js';
import { Button, Chip, Empty } from '../components/ui.js';
import { Preview, LandingPreview } from '../components/Preview.js';
import { StageTrack } from './Plan.js';

// Approved templates with no changes skip the queue on the creative side
const FAST_TRACK = ['e4'];

export function Approve({ s, route }) {
  const [tab, setTab] = useState('mine');
  const mine = s.entries.filter(e => e.stage === s.user.approves);
  const others = s.entries.filter(e => (e.stage === 'audience' || e.stage === 'creative') && e.stage !== s.user.approves);
  const done = s.entries.filter(e => e.stage === 'scheduled');
  const lists = { mine, others, done };
  const list = lists[tab];
  const sel = s.entries.find(e => e.id === route.id) || list[0];

  return html`<div class="approve">
    <aside class="card list-pane">
      <div class="seg full">
        ${[['mine', 'Waiting on you'], ['others', 'With others'], ['done', 'Approved']].map(([k, l]) => html`<button class=${tab === k ? 'on' : ''} onClick=${() => { setTab(k); navigate('approve'); }}>${l} <small>${lists[k].length}</small></button>`)}
      </div>
      <p class="muted small">${s.user.role === 'md' ? 'You approve who receives each message. The Marketing & Communications Department then approves the tone, visuals and channel.' : 'You approve tone, visuals and channel once the Membership Department has approved the audience.'}</p>
      ${list.length === 0 ? html`<${Empty} icon="check" title=${tab === 'mine' ? 'Nothing Waiting on You' : 'Nothing Here'}>${tab === 'mine' ? 'New items appear as soon as they are submitted.' : ''}<//>`
        : list.map(e => html`<a class=${'arow ' + (sel?.id === e.id ? 'on' : '')} href=${'#/approve/' + e.id}>
          <span class=${'type-dot ' + e.type}></span><span class="grow"><b>${e.title}</b><small>${e.dept} · ${fmtDate(e.date)}</small>
          <span class="arow-tags"><span class=${'stage-chip ' + e.stage}>${e.stage === 'audience' ? 'Audience' : e.stage === 'creative' ? 'Creative' : 'Scheduled'}</span>${FAST_TRACK.includes(e.id) && e.stage === 'creative' && html`<${Chip} tone="ok">Fast track<//>`}</span></span></a>`)}
    </aside>
    ${sel ? html`<${Detail} s=${s} e=${sel} key=${sel.id}/>` : html`<div class="card empty-pane"><${Icon} name="approve"/><b>All Signed Off</b><p>Nothing needs a decision right now.</p></div>`}
  </div>`;
}

function Detail({ s, e }) {
  const [note, setNote] = useState(''), [asking, setAsking] = useState(false), [ch, setCh] = useState(e.channels[0]);
  const mineNow = e.stage === s.user.approves;
  const waitingOn = e.stage === 'audience' ? USERS.cheryl : e.stage === 'creative' ? USERS.carolina : null;
  const plan = suggestChannels(e).filter(c => e.channels.includes(c.key));
  const segs = e.audience.segments, total = e.audience.count;
  const consent = Math.round(total * .015), load = e.id === 'e1' ? 12 : Math.round(total * .01);

  return html`<section class="adetail">
    <div class="card">
      <div class="ad-head"><span class=${'type-dot lg ' + e.type}></span><div class="grow"><small>${TYPES[e.type][0]} · ${e.dept} · Requested by ${e.owner}</small><h1>${e.title}</h1>
        <p class="muted">${fmtDate(e.date, { weekday: 'long', day: 'numeric', month: 'long' })}${e.time ? ', ' + e.time : ''} · Goal: ${e.goal}</p></div></div>
      <${StageTrack} stage=${e.stage}/>
      ${!mineNow && waitingOn && html`<div class="lock"><${Icon} name="clock"/>Waiting on ${waitingOn.name} (${waitingOn.dept}).</div>`}
    </div>

    ${e.stage === 'audience' || s.user.role === 'md' ? html`<div class="card">
      <h3>Audience <small>${e.eligibility}</small></h3>
      <div class="aud-total"><b>${total.toLocaleString('en-SG')}</b><span>members in ${segs.length} ${segs.length === 1 ? 'group' : 'groups'}</span></div>
      ${segs.map(([n, c]) => html`<div class="bar-row"><span>${n}</span><span class="bar"><i class="mid" style=${'width:' + (c / total * 100) + '%'}></i></span><b>${c.toLocaleString('en-SG')}</b></div>`)}
      <div class="excl">
        <span><${Icon} name="shield"/>${consent} left out for consent (unsubscribed or Do Not Call)</span>
        <span><${Icon} name="alert"/>${load} already get 3+ messages that week; Sera delays theirs by 2 days</span>
      </div>
      ${e.id === 'e2' && html`<div class="sera-note"><span class="sera-dot"></span><span><b>Sera:</b> 196 Associates need attention. A VIP Invitation for them, rather than the Guest Invitation, lifted turnout by 27% at the Sustainability roundtable. It is already in the plan.</span></div>`}
    </div>` : ''}

    <div class="card">
      <h3>Creative <small>${e.channels.length} channels, each with a landing page</small></h3>
      <div class="ch-strip">${plan.map(p => html`<button class=${ch === p.key ? 'on' : ''} onClick=${() => setCh(p.key)}><${Icon} name=${CHANNELS[p.key].icon}/><span>${chName(p.key)}<small>${fmtDate(p.date)}</small></span></button>`)}</div>
      ${ch && html`<div class="ad-preview"><div class="ad-pv"><${Preview} ch=${ch} c=${{ ...copyFor(e, ch, 'warm', segs[0]?.[0]), link: landingFor(e, ch).url }} entry=${e}/>
          <small class="pv-label">Landing Page · ${landingFor(e, ch).mode === 'existing' ? 'Existing: ' + pageTitle(landingFor(e, ch).url) : 'Custom'}</small><${LandingPreview} lp=${landingFor(e, ch)} entry=${e}/></div>
        <div class="ad-notes">
          ${FAST_TRACK.includes(e.id) ? html`<div class="ck ok"><${Icon} name="check"/><span><b>Approved Template, No Changes</b><small>Eligible for fast track.</small></span></div>`
            : html`<div class="ck warn"><${Icon} name="create"/><span><b>Changed From the Template</b><small>A new version for ${segs[1]?.[0] || 'one group'} and a rewritten opening line.</small></span></div>`}
          <div class="ck ok"><${Icon} name="check"/><span><b>Brand</b><small>Colours, type and logo locked.</small></span></div>
          <div class="ck ok"><${Icon} name="check"/><span><b>Tone</b><small>Warm. Matches the last 3 approved event invitations.</small></span></div>
        </div></div>`}
    </div>

    ${e.history.length > 0 && html`<div class="card"><h3>History</h3><ol class="hist">${e.history.map(([d, who, what]) => html`<li><small>${d}</small><span><b>${who}</b> ${what.charAt(0).toLowerCase() + what.slice(1)}</span></li>`)}</ol></div>`}

    ${mineNow && html`<div class="card decide">
      ${asking && html`<label class="field"><span>What Should Change?</span><textarea rows="3" value=${note} onInput=${x => setNote(x.target.value)} placeholder=${e.stage === 'audience' ? 'e.g. Leave out members already registered for the Vietnam mission' : 'e.g. Use the formal tone for the letter'}></textarea></label>`}
      <div class="decide-row">
        <span class="muted">${e.stage === 'audience' ? 'Approving sends it to the Marketing & Communications Department for creative sign-off.' : 'Approving schedules every channel on its planned date.'}</span>
        ${asking ? html`<button class="btn btn-g" onClick=${() => setAsking(false)}>Cancel</button><${Button} variant="o" onClick=${() => actions.requestChanges(e.id, s.user, note.trim())}>Send back<//>`
          : html`<button class="btn btn-o" onClick=${() => setAsking(true)}>Request changes</button>
            <${Button} onClick=${() => actions.approve(e.id, s.user)}>${e.stage === 'audience' ? 'Approve audience' : 'Approve creative'}<//>`}
      </div></div>`}
  </section>`;
}

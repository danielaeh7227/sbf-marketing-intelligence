import { html, useState, useEffect } from '../lib/html.js';
import { Icon } from '../lib/icons.js';
import { actions } from '../lib/store.js';
import { navigate } from '../lib/router.js';
import { BAND, SCORE_WEIGHTS, BAND_COUNTS } from '../data/members.js';
import { Button, Chip, Empty } from '../components/ui.js';

const NBA_ICON = { event: 'plan', call: 'phone', story: 'spark', promo: 'layers', wa: 'wa', welcome: 'letter' };
const NBA_DO = { event: 'Add to invite list', call: 'Assign a call', story: 'Draft invitation', promo: 'Draft offer', wa: 'Draft WhatsApp', welcome: 'Draft letter' };
const TL_ICON = { ev: 'plan', em: 'mail', web: 'globe', so: 'linkedin', ac: 'check' };

export function Know({ s, route }) {
  const [q, setQ] = useState(''), [band, setBand] = useState('all'), [limit, setLimit] = useState(60);
  useEffect(() => { if (route.id && route.id !== s.memberId) actions.selectMember(route.id); }, [route.id]);
  const m = s.members.find(x => x.id === (route.id || s.memberId)) || s.members[0];
  const ql = q.trim().toLowerCase();
  const list = s.members.filter(x => (band === 'all' || x.band === band) && (!ql || (x.name + ' ' + x.sector + ' ' + x.contact[0]).toLowerCase().includes(ql)))
    .sort((a, b) => band === 'lo' ? (b.billing ? 1 : 0) - (a.billing ? 1 : 0) || a.score - b.score : 0);
  const pick = id => { actions.selectMember(id); navigate('know/' + id); };

  return html`<div class="know">
    <aside class="card list-pane">
      <label class="search"><${Icon} name="search"/><input placeholder="Search members, sectors, people" value=${q} onInput=${e => { setQ(e.target.value); setLimit(60); }}/></label>
      <div class="seg" role="tablist">
        ${[['all', 'All', s.members.length], ['hi', 'Active', BAND_COUNTS.hi], ['mid', 'Steady', BAND_COUNTS.mid], ['lo', 'Attention', BAND_COUNTS.lo]].map(([k, l, n]) =>
          html`<button role="tab" aria-selected=${band === k} class=${band === k ? 'on' : ''} onClick=${() => { setBand(k); setLimit(60); }}>${l} <small>${n}</small></button>`)}
      </div>
      <div class="mlist">
        ${list.length === 0 && html`<${Empty} icon="search" title="No Members Match">Try another name or clear the filter.<//>`}
        ${list.slice(0, limit).map(x => html`<button class=${'mrow ' + (x.id === m.id ? 'on' : '')} onClick=${() => pick(x.id)}>
          <span class=${'av av-sm ' + x.band}>${x.ab}</span>
          <span class="grow"><b>${x.name.replace(/ Pte Ltd$/, '')}</b><small>${x.sector}${x.billing ? ' · billing' : ''}</small></span>
          <span class=${'score ' + x.band}>${x.score}</span></button>`)}
        ${list.length > limit && html`<button class="more" onClick=${() => setLimit(l => l + 100)}>Show more (${list.length - limit} left)</button>`}
      </div>
    </aside>

    <section class="profile" key=${m.id}>
      <div class="card p-head">
        <span class=${'av av-lg ' + m.band}>${m.ab}</span>
        <div class="grow"><h1>${m.name}</h1>
          <p class="muted">${m.sector} · ${m.tier} member since ${m.since} · ${m.staff} staff</p>
          <p class="contact"><${Icon} name="users"/>${m.contact[0]}, ${m.contact[1]}</p></div>
        <div class="p-score"><span class=${'score-ring ' + m.band} style=${'--v:' + m.score}><b>${m.score}</b></span>
          <${Chip} tone=${BAND[m.band][1]}>${BAND[m.band][0]}<//><small class=${m.delta < 0 ? 'neg' : 'pos'}>${m.delta >= 0 ? '+' : ''}${m.delta} in 60 days</small></div>
      </div>
      <div class="sources"><span>Pulled from</span>${['CRM', 'Event attendance', 'eDM and WhatsApp', 'SBF website and portal', 'SBF social', 'Company website and socials'].map((t, i) =>
        html`<span class=${'src ' + (i === 5 ? 'ai' : '')}><${Icon} name=${i === 5 ? 'spark' : 'check'}/>${t}</span>`)}</div>

      <div class="p-grid">
        <div class="card span2">
          <h3>Next Best Actions <small>Suggested by Sera · you decide</small></h3>
          ${m.nba.map(([k, t, why], i) => { const done = s.done.includes(m.id + ':' + i); return html`<div class=${'nba ' + (done ? 'done' : '')}>
            <span class="nba-ic"><${Icon} name=${NBA_ICON[k] || 'spark'}/></span>
            <span class="grow"><b>${t}</b><small>${why}</small></span>
            ${['story', 'promo', 'wa', 'welcome'].includes(k) && !done
              ? html`<${Button} variant="g" size="sm" onClick=${() => navigate('create')}>${NBA_DO[k]}<//>`
              : html`<${Button} variant="g" size="sm" done=${done} doneLabel="Done" onClick=${() => actions.doAction(m, i, NBA_DO[k] || 'Done')}>${NBA_DO[k] || 'Do it'}<//>`}
          </div>`; })}
        </div>
        <div class="card">
          <h3>Activity Score <small>How ${m.score} is made up</small></h3>
          ${SCORE_WEIGHTS.map(([k, label, w]) => html`<div class="bar-row"><span>${label}</span><span class="bar"><i class=${m.band} style=${'width:' + (m.parts[k] / w * 100) + '%'}></i></span><b>${m.parts[k]}<small>/${w}</small></b></div>`)}
          <p class="note">Weights are set in Settings and shown to everyone who sees the score.</p>
        </div>
        <div class="card">
          <h3>Interactions <small>Newest first</small></h3>
          <ol class="tl">${m.tl.map(([d, k, t]) => html`<li><span class=${'tl-ic ' + k}><${Icon} name=${TL_ICON[k] || 'info'}/></span><span class="grow">${t}</span><small>${d}</small></li>`)}</ol>
        </div>
        <div class="card">
          <h3>Outside SBF <small>Found by Sera in public sources</small></h3>
          ${m.ext.length ? m.ext.map(([src, t, url]) => html`<div class="ext"><b>${src}</b><p>${t}</p><small><${Icon} name="link"/>${url}</small></div>`)
            : html`<p class="muted">No recent public news. Sera checks the company website and socials weekly.</p>`}
          <p class="note"><${Icon} name="info"/>Found on 1 Nov 2026. Check the source before using it in a message.</p>
        </div>
        <div class="card">
          <h3>Channels and Consent</h3>
          <div class="consent">
            <span><${Icon} name="mail"/>Email<${Chip} tone="ok">Opted in<//></span>
            <span><${Icon} name="wa"/>WhatsApp${m.wa ? html`<${Chip} tone="ok">Opted in<//>` : html`<${Chip}>No consent<//>`}</span>
            <span><${Icon} name="phone"/>Phone calls<${Chip} tone="ok">Allowed<//></span>
            <span><${Icon} name="coin"/>Billing${m.billing ? html`<${Chip} tone="warn">${m.billing}<//>` : html`<${Chip} tone="ok">In good standing<//>`}</span>
          </div>
        </div>
      </div>
    </section>
  </div>`;
}

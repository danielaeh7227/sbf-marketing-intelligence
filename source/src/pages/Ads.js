import { html, useState } from '../lib/html.js';
import { Icon } from '../lib/icons.js';
import { actions } from '../lib/store.js';
import { AD_SLOTS, AD_TIERS, AD_WEEKS, AD_RESULTS, AD_MONTHS, AD_BY_SLOT, adPrice, adMoney } from '../data/ads.js';
import { Button, Chip, Empty, Modal } from '../components/ui.js';

const AD_ST = { booked: ['ok', 'Booked'], pending: ['warn', 'Waiting for you'], changes: ['', 'Changes requested'] };
const slotOf = id => AD_SLOTS.find(x => x.id === id);
const tierName = t => AD_TIERS.find(x => x[0] === t)[1];
// which booking holds a slot in a given week of the placement grid
const holder = (list, slot, w) => list.find(b => b.slot === slot && b.st !== 'changes' && w >= b.week && w < b.week + b.weeks);

// Ads: purchase (bookings and sign-off), placement (inventory by week) and tracking (results). Marketing & Communications only.
export function Ads({ s }) {
  const [tab, setTab] = useState('bookings');
  if (s.user.role !== 'mcd') return html`<${Empty} icon="coin" title="Ads Are Run by the Marketing & Communications Department">Carolina Ng books, places and tracks partner ads.<//>`;
  const list = s.adBookings, pending = list.filter(b => b.st === 'pending');
  const cells = AD_SLOTS.length * AD_WEEKS.length, held = AD_SLOTS.reduce((n, sl) => n + AD_WEEKS.filter((_, w) => holder(list, sl.id, w)).length, 0);
  const nov = list.filter(b => b.st === 'booked' && b.week < 5).reduce((a, b) => a + b.value, 0);

  return html`<div class="adv">
    <div class="kpis">
      <div class="card kpi"><small>Ad Revenue This Year</small><b>$186K</b><span class="pos"><${Icon} name="up"/>Up 2.2x a month since May</span></div>
      <div class="card kpi"><small>Booked for November</small><b>${adMoney(nov)}</b><span class="muted">${pending.length} more waiting for sign-off</span></div>
      <div class="card kpi"><small>Inventory Sold, Next 8 Weeks</small><b>${Math.round(held / cells * 100)}%</b><span class="muted">${cells - held} of ${cells} slot-weeks open</span></div>
      <div class="card kpi"><small>Average Click Rate</small><b>1.9%</b><span class="pos"><${Icon} name="up"/>BizSpoke leads at 3.1%</span></div>
    </div>
    <div class="toolbar">
      <div class="seg">${[['bookings', 'Bookings', pending.length], ['placements', 'Placements'], ['performance', 'Performance']].map(([k, l, n]) =>
        html`<button class=${tab === k ? 'on' : ''} onClick=${() => setTab(k)}>${l}${n ? html` <small>${n}</small>` : ''}</button>`)}</div>
      <span class="grow"></span><${Chip}>Sample figures<//>
      <${Button} icon="plus" onClick=${() => actions.open('book')}>New booking<//>
    </div>
    ${tab === 'bookings' ? html`<${AdBookings} list=${list}/>` : tab === 'placements' ? html`<${AdPlacements} list=${list}/>` : html`<${AdPerformance} nov=${nov}/>`}
  </div>`;
}

function AdBookings({ list }) {
  return html`<div class="card table-card adv-book">
      <table class="tbl adv-tbl"><thead><tr><th>Advertiser</th><th>Placement</th><th>Runs</th><th class="n">Value</th><th>Status</th><th></th></tr></thead>
        <tbody>${list.map(b => { const sl = slotOf(b.slot), [tone, label] = AD_ST[b.st]; return html`<tr key=${b.id} class=${b.fresh ? 'row-new' : ''}>
          <td><b>${b.who}</b><small>${tierName(b.tier)} · requested ${b.when}</small></td>
          <td data-l="Placement">${sl.name}<small>${b.units} ${sl.unit}${b.units > 1 ? 's' : ''}</small></td>
          <td class="nw" data-l="Runs">${AD_WEEKS[b.week]}<small>${b.weeks} week${b.weeks > 1 ? 's' : ''}</small></td>
          <td class="n" data-l="Value">${adMoney(b.value)}</td><td data-l="Status"><${Chip} tone=${tone}>${label}<//></td>
          <td class="adv-act">${b.st === 'pending' && html`<${Button} variant="g" size="sm" doneLabel="Sent" onClick=${() => actions.adDecide(b.id, 'changes')}>Ask for changes<//>
            <${Button} size="sm" doneLabel="Approved" onClick=${() => actions.adDecide(b.id, 'booked')}>Approve<//>`}</td></tr>`; })}</tbody></table>
    </div>
    <div class="adv-pair">
      <div class="card">
        <h3>Rate Card <small>Before member discounts: 15% off for members, 25% for active members</small></h3>
        <div class="adv-rates">${AD_SLOTS.map(sl => html`<div class="kv"><span>${sl.name}</span><b>${adMoney(sl.rate)} a ${sl.unit}</b></div>`)}</div>
      </div>
      <div class="card">
        <h3>Booking Rules</h3>
        <ul class="adv-rules">
          <li><${Icon} name="shield"/>Every ad is labelled "Partner". Advertisers see results for their own ad, never member data.</li>
          <li><${Icon} name="check"/>Carolina Ng approves every booking and its creative before it goes live.</li>
          <li><${Icon} name="clock"/>Bookings that wait more than 2 working days get a reminder.</li>
        </ul>
      </div>
  </div>`;
}

function AdPlacements({ list }) {
  return html`<div class="card adv-place">
      <h3>Placements, Next 8 Weeks <small>Pick an open week to book it</small></h3>
      <div class="adv-scroll"><div class="adv-grid">
        <span class="adv-h"></span>${AD_WEEKS.map(w => html`<span class="adv-h">${w}</span>`)}
        ${AD_SLOTS.map(sl => html`<span class="adv-slot"><b>${sl.name}</b><small>${sl.where} · ${(sl.reach / 1000).toFixed(sl.reach < 1000 ? 1 : 0)}K reach</small></span>
          ${AD_WEEKS.map((_, w) => { const b = holder(list, sl.id, w);
            return b ? html`<span class=${'adv-cell ' + b.st + (b.week === w ? ' first' : '')} title=${b.who}>${b.week === w ? b.who.split(' ')[0] : ''}</span>`
              : html`<button class="adv-cell free" aria-label=${'Book ' + sl.name + ', week of ' + AD_WEEKS[w]} onClick=${() => actions.open('book', { slot: sl.id, week: w })}><${Icon} name="plus"/></button>`; })}`)}
      </div></div>
      <div class="legend-s"><span><i class="adv-key booked"></i>Booked</span><span><i class="adv-key pending"></i>Waiting for sign-off</span><span><i class="adv-key free"></i>Open</span></div>
    </div>
    <div class="adv-slots">${AD_SLOTS.map(sl => { const n = AD_WEEKS.filter((_, w) => holder(list, sl.id, w)).length, pct = Math.round(n / AD_WEEKS.length * 100);
      return html`<div class="card adv-sc"><h3>${sl.name}</h3><small class="muted">${sl.where}</small>
        <div class="adv-nums"><span><b>${(sl.reach / 1000).toFixed(sl.reach < 1000 ? 1 : 0)}K</b>Reach</span><span><b>${sl.ctr}%</b>Click rate</span><span><b>${adMoney(sl.rate)}</b>a ${sl.unit}</span></div>
        <div class="bar-row"><span>Sold</span><span class="bar"><i class=${pct >= 75 ? 'hi' : pct < 40 ? 'lo' : ''} style=${'width:' + pct + '%'}></i></span><b>${pct}%</b></div></div>`; })}</div>`;
}

function AdPerformance({ nov }) {
  const months = [...AD_MONTHS, ['Nov', Math.round(nov / 1000)]];
  const max = Math.max(...months.map(m => m[1])), top = Math.max(...AD_BY_SLOT.map(r => r[1]));
  return html`<div class="adv-two">
    <div class="adv-stack">
      <div class="card table-card">
        <table class="tbl adv-tbl"><thead><tr><th>Advertiser</th><th class="n">Impressions</th><th class="n">Clicks</th><th class="n">Click Rate</th><th class="n">Leads</th><th>Delivered</th></tr></thead>
          <tbody>${AD_RESULTS.map(([who, slot, imp, clk, leads, done]) => html`<tr>
            <td><b>${who}</b><small>${slotOf(slot).name}</small></td><td class="n" data-l="Impressions">${imp.toLocaleString('en-SG')}</td><td class="n" data-l="Clicks">${clk}</td>
            <td class="n" data-l="Click Rate">${(clk / imp * 100).toFixed(1)}%</td><td class="n" data-l="Leads">${leads}</td>
            <td data-l="Delivered"><span class="bar adv-pace"><i class=${done === 100 ? 'hi' : ''} style=${'width:' + done + '%'}></i></span><small>${done === 100 ? 'Finished' : done + '% of the run'}</small></td></tr>`)}</tbody></table>
      </div>
      <div class="card sera-card"><h3><span class="sera-dot"></span>Sera's Read <small>From the last 90 days</small></h3>
        <p>BizSpoke is sold out to mid-December and gets the best click rate, at 3.1%. Raise its rate by 10% from January.</p>
        <p>Directory listings are a third sold. Offer one free with every BizSpoke booking to fill them and lift renewals.</p>
      </div>
    </div>
    <div class="adv-stack">
      <div class="card">
        <h3>Monthly Ad Revenue <small>$ thousands · November booked so far</small></h3>
        <div class="trend adv-trend">${months.map(([m, v], i) => html`<div class="tcol"><b>${v}</b><span class="tbar" style=${'height:' + (v / max * 100) + '%'}><i class=${i === months.length - 1 ? 'hi' : 'mid'} style="flex:1"></i></span><small>${m}</small></div>`)}</div>
      </div>
      <div class="card">
        <h3>Revenue by Placement <small>This year · $ thousands</small></h3>
        ${AD_BY_SLOT.map(([id, v]) => html`<div class="bar-row"><span>${slotOf(id).name}</span><span class="bar"><i style=${'width:' + (v / top * 100) + '%'}></i></span><b>${v}K</b></div>`)}
      </div>
    </div>
  </div>`;
}

// New booking: Carolina books a placement for an advertiser. Member discounts apply automatically.
export function NewBooking({ s, slot = 'hero', week = 0 }) {
  const [f, setF] = useState({ who: '', tier: 'member', slot, week, units: 1 });
  const sl = slotOf(f.slot), weeks = sl.unit === 'month' ? 4 * f.units : f.units;
  const clash = Array.from({ length: weeks }, (_, i) => f.week + i).some(w => w >= AD_WEEKS.length || holder(s.adBookings, f.slot, w));
  const p = adPrice(f.slot, f.units, f.tier), ok = f.who.trim() && !clash;
  const set = k => e => setF({ ...f, [k]: k === 'week' || k === 'units' ? +e.target.value : e.target.value });
  return html`<${Modal} title="New Booking" footer=${html`<button class="btn btn-g" onClick=${actions.close}>Cancel</button>
      <${Button} disabled=${!ok} onClick=${async () => { await actions.adBook({ who: f.who.trim(), tier: f.tier, slot: f.slot, week: f.week, weeks, units: f.units, value: p.total }); }}>Book it<//>`}>
    <div class="form">
      <label class="field full"><span>Advertiser</span><input value=${f.who} onInput=${set('who')} placeholder="Company name"/></label>
      <div class="field full"><span>Membership</span><div class="seg full">${AD_TIERS.map(([k, l, d]) => html`<button type="button" class=${f.tier === k ? 'on' : ''} onClick=${() => setF({ ...f, tier: k })}>${l}${d ? html` <small>${d * 100}% off</small>` : ''}</button>`)}</div></div>
      <label class="field"><span>Placement</span><select value=${f.slot} onChange=${set('slot')}>${AD_SLOTS.map(x => html`<option value=${x.id}>${x.name}</option>`)}</select></label>
      <label class="field"><span>Starts</span><select value=${f.week} onChange=${set('week')}>${AD_WEEKS.map((w, i) => html`<option value=${i}>Week of ${w}</option>`)}</select></label>
      <label class="field"><span>How many ${sl.unit}s</span><select value=${f.units} onChange=${set('units')}>${[1, 2, 3, 4].map(n => html`<option value=${n}>${n}</option>`)}</select></label>
      <div class="field"><span>Runs</span><p class="adv-runs">${weeks} week${weeks > 1 ? 's' : ''}</p></div>
    </div>
    ${clash && html`<div class="lock"><${Icon} name="alert"/>That placement is already taken in those weeks. Choose another start week.</div>`}
    <div class="adv-total"><div class="kv"><span>${adMoney(sl.rate)} × ${f.units} ${sl.unit}${f.units > 1 ? 's' : ''}</span><b>${adMoney(p.list)}</b></div>
      ${p.off > 0 && html`<div class="kv"><span>${tierName(f.tier)} discount</span><b class="pos">−${adMoney(p.off)}</b></div>`}
      <div class="kv adv-sum"><span>Total</span><b>${adMoney(p.total)}</b></div></div>
    <p class="note"><${Icon} name="shield"/>The ad is labelled "Partner". The advertiser sees results for this ad only.</p>
  <//>`;
}

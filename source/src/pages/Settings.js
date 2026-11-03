import { html, useState } from '../lib/html.js';
import { Icon } from '../lib/icons.js';
import { actions } from '../lib/store.js';
import { SCORE_WEIGHTS } from '../data/members.js';
import { Button, Chip } from '../components/ui.js';

const INTEGRATIONS = [
  ['Nexus CRM', 'Member records, contacts, event attendance', 'ok', 'Connected · syncs every 15 min'],
  ['Microsoft 365', 'Sign-in and Outlook calendars', 'ok', 'Connected'],
  ['eDM platform', 'Sends invitations and BizSpoke; returns opens and clicks', 'ok', 'Connected'],
  ['Members portal', 'Portal visits, event tags, RSVPs', 'ok', 'Connected'],
  ['Events portal', 'Registrations and attendance', 'warn', 'Planned for Phase 2'],
  ['WhatsApp Business API', 'Messages to opted-in members', 'warn', 'Waiting for opt-in records'],
  ['LinkedIn company page', 'Posts and engagement', 'ok', 'Connected'],
  ['Company websites and socials', 'Public signals found by Sera', 'ok', 'Weekly scan · sources kept']
];

export function Settings({ s }) {
  const [w, setW] = useState(Object.fromEntries(SCORE_WEIGHTS.map(([k, , v]) => [k, v])));
  const [rules, setRules] = useState({ fast: true, escalate: true, quiet: true, dnc: true });
  const total = Object.values(w).reduce((a, b) => a + b, 0), light = s.theme === 'light';
  const rule = (k, t, d) => html`<label class="rule"><span class="grow"><b>${t}</b><small>${d}</small></span>
    <input type="checkbox" class="switch" checked=${rules[k]} onChange=${() => setRules({ ...rules, [k]: !rules[k] })}/></label>`;

  return html`<div class="settings">
    <div class="card">
      <h3>Activity Score <small>Shown to everyone who sees a score</small></h3>
      ${SCORE_WEIGHTS.map(([k, label]) => html`<label class="weight"><span>${label}</span>
        <input type="range" min="0" max="40" step="5" value=${w[k]} onInput=${e => setW({ ...w, [k]: +e.target.value })}/><b>${w[k]}</b></label>`)}
      <div class=${'w-total ' + (total === 100 ? 'ok' : 'warn')}><${Icon} name=${total === 100 ? 'check' : 'alert'}/>Total ${total} of 100${total !== 100 ? ' · weights must add up to 100' : ''}</div>
      <p class="note">Active is 70 and above, steady 40 to 69, needs attention under 40.</p>
      <${Button} disabled=${total !== 100} onClick=${async () => { await new Promise(r => setTimeout(r, 700)); actions.toast('Weights saved. Scores recalculate overnight.'); }}>Save weights<//>
    </div>
    <div class="card">
      <h3>Sign-Off Rules <small>Only these two people sign off</small></h3>
      <div class="roles"><span><b>Audience</b>Cheryl Kong · Membership Department</span><span><b>Tone, Visuals, Channel and Ad Bookings</b>Carolina Ng · Marketing & Communications Department</span></div>
      ${rule('fast', 'Fast track approved templates', 'Sends that use an approved template with no changes skip creative sign-off.')}
      ${rule('escalate', 'Remind after 2 working days', 'Cheryl Kong or Carolina Ng gets a reminder for anything still waiting.')}
      ${rule('quiet', 'Cap messages per member', 'No more than 3 messages a week per member. Sera delays the rest.')}
    </div>
    <div class="card">
      <h3>Consent and Data <small>PDPA</small></h3>
      ${rule('dnc', 'Check the Do Not Call registry', 'Before every WhatsApp and phone campaign.')}
      <div class="kv"><span>Purposes collected</span><b>Membership Services, Events, Newsletters</b></div>
      <div class="kv"><span>Interaction data kept for</span><b>24 months</b></div>
      <div class="kv"><span>Public signals</span><b>Stored with source and date, never personal social accounts</b></div>
    </div>
    <div class="card span2">
      <h3>Connected Systems</h3>
      <div class="integ">${INTEGRATIONS.map(([n, d, st, t]) => html`<div><span class="grow"><b>${n}</b><small>${d}</small></span><${Chip} tone=${st}>${t}<//></div>`)}</div>
    </div>
    <div class="card">
      <h3>Display and About</h3>
      <div class="set-row"><span class="set-ic"><${Icon} name=${light ? 'sun' : 'moon'}/></span><span class="grow"><b>Theme</b><small>Applies on this device</small></span>
        <div class="seg">${[['dark', 'Dark'], ['light', 'Light']].map(([k, l]) => html`<button class=${s.theme === k ? 'on' : ''} aria-pressed=${s.theme === k} onClick=${() => s.theme !== k && actions.toggleTheme()}>${l}</button>`)}</div></div>
      <button class="set-row link" onClick=${() => actions.open('about')}><span class="set-ic"><${Icon} name="info"/></span><span class="grow"><b>About This Prototype</b><small>What each step does, and the sample data</small></span><${Icon} name="chevR"/></button>
      <button class="set-row link" onClick=${() => actions.open('account')}><span class="set-ic"><${Icon} name="users"/></span><span class="grow"><b>Account</b><small>${s.user.name} · ${s.user.dept}</small></span><${Icon} name="chevR"/></button>
    </div>
  </div>`;
}

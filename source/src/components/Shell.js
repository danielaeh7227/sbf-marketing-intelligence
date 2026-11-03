import { html } from '../lib/html.js';
import { Icon } from '../lib/icons.js';
import { actions } from '../lib/store.js';
import { navigate } from '../lib/router.js';
import { NOTIFS } from '../data/people.js';
import { SbfLogo, MiWordmark } from './brand.js';

export const NAV = [
  ['overview', 'Overview', 'overview'], ['know', 'Know', 'know', 'Every member, one view'], ['plan', 'Plan', 'plan', 'The shared calendar'],
  ['create', 'Create', 'create', 'AI drafts for every channel'], ['approve', 'Approve', 'approve', 'Sign-off'], ['learn', 'Learn', 'learn', 'Analytics and post-mortems'],
  ['ads', 'Ads', 'coin', 'Partner ads: purchase, placement and tracking', 'mcd']
];
export const TITLES = { overview: 'Overview', know: 'Know · Members', plan: 'Plan · Shared Calendar', create: 'Create · Channels and Drafts', approve: 'Approve · Sign-Off', learn: 'Learn · Analytics', ads: 'Ads · Placements', settings: 'Settings' };

// What is waiting on this user: Membership approves audiences, Marketing & Communications approves creative
export const myQueue = (s) => s.entries.filter(e => e.stage === s.user.approves);

export function Shell({ s, route, children }) {
  const queue = myQueue(s).length, light = s.theme === 'light', adWaiting = s.adBookings.filter(b => b.st === 'pending').length;
  const go = p => () => navigate(p);
  return html`<div class=${'shell' + (s.navOpen ? '' : ' nav-min')}>
    <aside class="side">
      <div class="side-hd">
        <span class="brand"><${SbfLogo} white=${!light} h=${22}/><${MiWordmark}/></span>
        <button class="icon-btn ring" aria-label=${s.navOpen ? 'Collapse menu' : 'Expand menu'} onClick=${actions.toggleNav}><${Icon} name="panel"/></button>
      </div>
      <nav class="nav">
        ${NAV.filter(n => !n[4] || n[4] === s.user.role).map(([p, label, icon]) => html`<a href=${'#/' + p} class=${(route.page === p ? 'on' : '') + (p === 'create' || (p === 'know' && s.user.role === 'mcd') ? ' desk-only' : '')} title=${label}>
          <${Icon} name=${icon}/><span>${label}</span>${p === 'approve' && queue > 0 && html`<b class="badge">${queue}</b>`}
          ${p === 'ads' && adWaiting > 0 && html`<b class="badge">${adWaiting}</b>`}
          ${p === 'plan' && s.warnings.length > 0 && html`<b class="badge warn">${s.warnings.length}</b>`}</a>`)}
      </nav>
    </aside>
    <div class="main">
      <header class="top"><h2>${TITLES[route.page]}</h2><span class="role-chip">${s.user.dept}</span>
        <div class="top-tools">
          <button class="icon-btn" aria-label="Notifications" onClick=${() => actions.open('notifs')}><${Icon} name="bell"/><b class="dot-badge">${NOTIFS.length}</b></button>
          <button class=${'icon-btn' + (route.page === 'settings' ? ' on' : '')} aria-label="Settings" onClick=${go('settings')}><${Icon} name="settings"/></button>
          <button class="me" onClick=${() => actions.open('account')} title="Account">
            <span class="me-tx"><b>${s.user.name}</b></span>
            <span class=${'av av-' + s.user.role}>${s.user.ab}</span>
          </button>
        </div>
      </header>
      <div class="page" key=${route.page}>${children}</div>
    </div>
  </div>`;
}

const NOTIF_GO = { approve: 'approve', alert: 'know', spark: 'learn', plan: 'plan', up: 'know' };
export function Notifs() {
  return html`<div class="pop-head"><b>Notifications</b><small>${NOTIFS.length} new</small></div>
    <div class="notifs">${NOTIFS.map(([ic, text, when]) => html`<button class="notif" onClick=${() => { actions.close(); navigate(NOTIF_GO[ic]); }}>
      <span class=${'n-ic ' + ic}><${Icon} name=${ic === 'up' ? 'up' : ic}/></span><span>${text}</span><small>${when}</small></button>`)}</div>`;
}

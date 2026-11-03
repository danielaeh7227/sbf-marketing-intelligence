import { html, useEffect } from './lib/html.js';
import { Icon } from './lib/icons.js';
import { useStore, actions, EMBED } from './lib/store.js';
import { useRoute, navigate } from './lib/router.js';
import { Shell, Notifs } from './components/Shell.js';
import { Drawer, Modal, Toasts } from './components/ui.js';
import { Sera } from './components/Sera.js';
import { BandPanel } from './components/BandPanel.js';
import { Login } from './pages/Login.js';
import { Overview } from './pages/Overview.js';
import { Know } from './pages/Know.js';
import { Plan, EntryDrawer, NewEntry, BulkImport } from './pages/Plan.js';
import { Create } from './pages/Create.js';
import { Approve } from './pages/Approve.js';
import { Learn } from './pages/Learn.js';
import { Settings } from './pages/Settings.js';
import { Ads, NewBooking } from './pages/Ads.js';

const PAGE = { overview: Overview, know: Know, plan: Plan, create: Create, approve: Approve, learn: Learn, ads: Ads, settings: Settings };

export function App() {
  const s = useStore(), route = useRoute();
  useEffect(() => { actions.close(); scrollTo(0, 0); }, [route.page]);
  useEffect(() => { if (s.user && !location.hash) navigate('overview'); }, [s.user]);
  useEffect(() => { // deck frames can open a panel: open=band:lo, open=sera (with ask=...), open=bulk
    const o = EMBED?.get('open'); if (!o) return;
    const [kind, band] = o.split(':'), t = setTimeout(() => actions.open(kind, kind === 'band' ? { band } : kind === 'sera' ? { ask: EMBED.get('ask') || undefined } : {}), 600);
    return () => clearTimeout(t);
  }, []);
  if (!s.user) return html`<${Login}/><${Toasts} toasts=${s.toasts}/>`;
  const Page = PAGE[route.page], o = s.overlay;
  return html`
    <${Shell} s=${s} route=${route}><${Page} s=${s} route=${route}/><//>
    ${o?.kind === 'sera' && html`<${Drawer} label="Sera"><${Sera} s=${s} ...${o}/><//>`}
    ${o?.kind === 'band' && html`<${Drawer} label="Members" modal=${false}><${BandPanel} s=${s} key=${o.band} band=${o.band} id=${o.id}/><//>`}
    ${o?.kind === 'entry' && html`<${Drawer} label="Calendar entry"><${EntryDrawer} s=${s} id=${o.id}/><//>`}
    ${o?.kind === 'notifs' && html`<${Drawer} label="Notifications"><${Notifs}/><//>`}
    ${o?.kind === 'new' && html`<${NewEntry} s=${s}/>`}
    ${o?.kind === 'bulk' && html`<${BulkImport} s=${s}/>`}
    ${o?.kind === 'book' && html`<${NewBooking} s=${s} ...${o}/>`}
    ${o?.kind === 'account' && html`<${Modal} title="Account" footer=${html`<button class="btn btn-o" onClick=${() => { actions.signOut(); }}><${Icon} name="logout"/>Sign out</button>`}>
      <p><b>${s.user.name}</b><br/><span class="muted">${s.user.dept}</span></p>
      <p class="muted">Signing out takes you back to the account picker, where you can try the other role.</p><//>`}
    ${o?.kind === 'about' && html`<${Modal} title="About This Prototype">
      <p>SBF Marketing Intelligence: one workflow for Membership and Marketing & Communications.</p>
      <ul class="about"><li><b>Know</b>: a single view of every member from the CRM, events, email, web and public sources.</li>
        <li><b>Plan</b>: the shared calendar of MICE and promotional entries, one at a time or in bulk.</li>
        <li><b>Create</b>: Sera suggests channels and drafts the copy and visuals for each member group.</li>
        <li><b>Approve</b>: the Membership Department signs off the audience, then the Marketing & Communications Department signs off tone, visuals and channel.</li>
        <li><b>Learn</b>: activity scores, campaign results and a post-mortem with next actions.</li>
        <li><b>Ads</b>: the Marketing & Communications Department books, places and tracks partner ads, a second income line beside membership dues.</li></ul>
      <p class="muted">All companies, people, scores and results are sample data. Sign in as Cheryl Kong to see the Membership Department view and as Carolina Ng for the Marketing & Communications Department view.</p><//>`}
    <${Toasts} toasts=${s.toasts}/>`;
}

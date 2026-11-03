import { html } from '../lib/html.js';
import { Icon } from '../lib/icons.js';
import { CHANNELS, fmtDate, pageTitle } from '../data/channels.js';
import { SbfLogo } from './brand.js';

// Merge fields are filled with a sample recipient and highlighted, so reviewers see both the copy and the personalisation
const SAMPLE = { 'first name': 'Rachel', 'last name': 'Koh', salutation: 'Ms', company: 'Harbourline Logistics', 'account manager': 'Joanne Lee' };
export function Merge({ text = '' }) {
  const parts = String(text).split(/(\{[^}]+\})/g);
  return parts.map(p => { const k = p.match(/^\{([^}]+)\}$/); return k ? html`<mark class="merge" title=${'Merge field: ' + k[1]}>${SAMPLE[k[1]] || k[1]}</mark>` : p; });
}

export function Preview({ ch, c, entry }) {
  const kind = CHANNELS[ch].kind;
  if (kind === 'wa') return html`<div class="pv-phone"><div class="wa-top"><span class="av av-sm">S</span><b>SBF</b><small>Business account</small></div>
    <div class="wa-chat"><div class="wa-bubble">
      <div class="wa-card"><div class="wa-img"><${SbfLogo} white h=${22}/></div><b>${entry.title}</b><small>${c.link}</small></div>
      ${c.body.map(p => html`<p><${Merge} text=${p}/></p>`)}<a>${'https://' + c.link}</a><time>9:02 am</time></div>
      ${CHANNELS[ch].rsvp !== false && entry.rsvpBy && html`<div class="wa-quick"><span>Confirm</span><span>Can't make it</span></div>`}</div></div>`;
  if (kind === 'li') return html`<div class="pv-li"><div class="li-hd"><span class="li-av"><${SbfLogo} h=${14}/></span><span><b>Singapore Business Federation</b><small>48,213 followers · Promoted by SBF</small></span></div>
    ${c.body.map(p => html`<p><${Merge} text=${p}/></p>`)}
    <div class="li-img"><span class="li-kicker">${entry.type === 'mice' ? 'Event' : 'SBF'}</span><b>${entry.title}</b></div>
    ${c.link && html`<div class="li-link"><b>${entry.title}</b><small>${c.link}</small></div>`}
    <div class="li-acts"><span>Like</span><span>Comment</span><span>Repost</span><span>Send</span></div></div>`;
  if (kind === 'letter') return html`<div class="pv-letter"><${SbfLogo} h=${34}/><small class="lt-date">3 November 2026</small>
    <h4><${Merge} text=${c.headline}/></h4>${c.body.map(p => html`<p><${Merge} text=${p}/></p>`)}
    ${c.cta && html`<span class="lt-cta">${c.cta}: ${c.link || 'sbf.org.sg/rsvp'}</span>`}
    <div class="sig"><i></i><small>${c.sign}</small></div></div>`;
  return html`<div class="pv-mail">
    <div class="pv-meta"><small>Subject</small><b><${Merge} text=${c.subject}/></b><small class="pre">${c.pre}</small></div>
    <div class="mail-hd"><${SbfLogo} h=${26}/></div>
    <div class="mail-hero"><span>${CHANNELS[ch].name}</span><b><${Merge} text=${c.headline}/></b></div>
    <div class="mail-bd">${c.body.map(p => html`<p><${Merge} text=${p}/></p>`)}
      <div class="mail-ctas"><span class="m-btn">${c.cta}</span>${c.cta2 && html`<span class="m-btn o">${c.cta2}</span>`}</div>
      ${c.link && html`<small class="m-link"><${Icon} name="link"/>${c.link}</small>`}</div>
    <div class="mail-ft">Singapore Business Federation · 160 Robinson Road · You are receiving this as an SBF member. <u>Update preferences</u></div></div>`;
}

// The page a message links to: an existing SBF page, or the custom page Sera drafts
export function LandingPreview({ lp, entry }) {
  const custom = lp.mode === 'custom';
  return html`<div class="pv-lp">
    <div class="lp-bar"><i></i><i></i><i></i><span>${lp.url || 'sbf.org.sg'}</span></div>
    <div class="lp-nav"><${SbfLogo} h=${20}/><span>Membership</span><span>Events</span><span>BizSpoke</span><span>Contact</span></div>
    <div class="lp-hero"><small>${custom ? (entry.type === 'mice' ? 'Event' : 'SBF') : 'Existing Page'}</small><b>${custom ? lp.headline : pageTitle(lp.url)}</b>
      ${custom ? html`<p>${lp.summary}</p>` : html`<p>${entry.title}: members land on this page as it is today on sbf.org.sg.</p>`}</div>
    <div class="lp-body">
      ${entry.type === 'mice' && html`<div class="lp-facts"><span><small>Date</small>${fmtDate(entry.date, { weekday: 'short', day: 'numeric', month: 'long' })}</span><span><small>Time</small>${entry.time || 'TBC'}</span><span><small>Venue</small>${entry.venue || 'Online'}</span></div>`}
      ${custom && lp.form ? html`<div class="lp-formbox"><b>Register</b><i></i><i></i><i></i><span class="m-btn">${lp.cta || 'Register Now'}</span></div>`
        : html`<span class="m-btn">${custom ? lp.cta || 'Find Out More' : 'View Page'}</span>`}
    </div></div>`;
}

export const ChannelIcon = ({ ch }) => html`<${Icon} name=${CHANNELS[ch].icon}/>`;

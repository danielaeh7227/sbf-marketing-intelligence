import { html, useState, useEffect } from '../lib/html.js';
import { Icon } from '../lib/icons.js';
import { actions, wait } from '../lib/store.js';
import { navigate } from '../lib/router.js';
import { TYPES, STAGES } from '../data/calendar.js';
import { CHANNELS, GROUPS, LANDING_PAGES, TONES, REWRITES, suggestChannels, copyFor, fmtDate, landingFor, customLanding, landingOk, chName } from '../data/channels.js';
import { Button, Chip } from '../components/ui.js';
import { Preview, LandingPreview } from '../components/Preview.js';
import { StageTrack } from './Plan.js';

const LEADS = [null, 'Harbourline Logistics opened a Batam hub after our last market briefing. Hear how they did it.', '104 members came to the Vietnam briefing, and 22 followed up with our market advisors.'];

export function Create({ s, route }) {
  const open = s.entries.filter(e => e.stage !== 'review' && e.stage !== 'sent');
  const e = open.find(x => x.id === route.id) || open.find(x => x.id === 'e1') || open[0];
  const sugg = suggestChannels(e);
  const [chosen, setChosen] = useState([]), [active, setActive] = useState(''), [tone, setTone] = useState('warm'), [seg, setSeg] = useState('');
  const [edits, setEdits] = useState({}), [thinking, setThinking] = useState(false), [pv, setPv] = useState('msg');

  // a fresh draft with no channels yet: Sera "thinks", then proposes
  useEffect(() => {
    const init = e.channels.length ? e.channels : sugg.filter(c => c.rec).map(c => c.key);
    setChosen(init); setActive(init[0] || ''); setSeg(e.audience.segments[0]?.[0] || ''); setEdits({});
    if (!e.channels.length) { setThinking(true); wait(1200).then(() => setThinking(false)); }
  }, [e.id]);

  const canEdit = e.stage === 'draft' || (e.stage === 'creative' && s.user.role === 'mcd');
  const key = `${active}|${seg}|${tone}`;
  const base = active ? copyFor(e, active, tone, seg) : null;
  const lp = active ? landingFor(e, active) : null;
  const c = base && { ...base, ...(edits[key] || {}), link: lp.url };
  const setLp = patch => actions.setLanding(e.id, active, { ...lp, ...patch });
  const lpMissing = chosen.filter(k => !landingOk(landingFor(e, k)));
  const groupOf = k => CHANNELS[k].group, activeGroup = active && groupOf(active);
  const pick = k => { setActive(k); setPv('msg'); };
  const setField = (f, v) => setEdits(x => ({ ...x, [key]: { ...(x[key] || {}), [f]: v } }));
  const toggle = k => { const on = chosen.includes(k); const next = on ? chosen.filter(x => x !== k) : [...chosen, k]; setChosen(next); if (!on) pick(k); else if (active === k) setActive(next[0] || ''); };
  async function rewrite(i) {
    await wait(700);
    const b = c.body.filter(Boolean);
    const body = i === 0 ? b.slice(0, 2).map(p => p.split('. ')[0].replace(/\.?$/, '.')) : [b[0], LEADS[i], ...b.slice(1)];
    setField('body', body); actions.toast('Sera rewrote it: ' + REWRITES[i].toLowerCase(), 'info');
  }
  const waOk = Math.round(e.audience.count * .45), excluded = active === 'wa' ? e.audience.count - waOk : Math.round(e.audience.count * .015);
  const busyWeek = s.warnings.some(w => w.id === 'w1') && e.date >= '2026-11-16' && e.date <= '2026-11-22';

  return html`<div class="create">
    <div class="toolbar">
      <label class="entry-pick"><small>Calendar Entry</small>
        <select class="select" value=${e.id} onChange=${x => navigate('create/' + x.target.value)}>${open.map(x => html`<option value=${x.id}>${fmtDate(x.date, { day: 'numeric', month: 'short' })} · ${x.title}</option>`)}</select></label>
      <span class="muted">${TYPES[e.type][0]} · ${e.dept} · ${e.audience.count ? e.audience.count.toLocaleString('en-SG') + ' members' : 'Public'}</span>
      <span class="grow"></span>
      <${StageTrack} stage=${e.stage}/>
    </div>

    <div class="create-grid">
      <aside class="card sugg">
        <h3><span class="sera-dot"></span>Sera Suggests <small>${thinking ? 'Thinking…' : chosen.length + ' of ' + sugg.length + ' chosen'}</small></h3>
        ${thinking ? [0, 1, 2].map(() => html`<div class="sk-card"><i></i><i></i><i></i></div>`) : GROUPS.map(([g, gl, gi]) => {
          const items = sugg.filter(x => groupOf(x.key) === g); if (!items.length) return null;
          return html`<div class="sg-group"><b class="sg-gh"><${Icon} name=${gi}/>${gl}</b>${items.map(x => html`
          <div class=${'sg ' + (chosen.includes(x.key) ? 'on ' : '') + (active === x.key ? 'act' : '')}>
            <label class="sg-check"><input type="checkbox" checked=${chosen.includes(x.key)} disabled=${!canEdit} onChange=${() => toggle(x.key)}/><span></span></label>
            <button class="sg-main" onClick=${() => chosen.includes(x.key) ? pick(x.key) : canEdit && toggle(x.key)}>
              <span class="sg-top"><b>${CHANNELS[x.key].name}</b></span>
              <span class="sg-meta"><small class="sg-when">${fmtDate(x.date)}${CHANNELS[x.key].rsvp ? ' · Tracks RSVPs' : ''}</small>${x.rec && html`<${Chip} tone="c">Recommended<//>`}</span>
              <small>${x.why}</small></button>
          </div>`)}</div>`; })}
      </aside>

      ${!active ? html`<div class="card empty-pane"><${Icon} name="spark"/><b>Pick a Channel to Start</b><p>Tick a suggestion on the left. Sera drafts the copy, the visual and a landing page for each one.</p></div>` : html`
      <section class="card editor">
        <div class="ed-tabs">${GROUPS.filter(([g]) => chosen.some(k => groupOf(k) === g)).map(([g, gl, gi]) => { const n = chosen.filter(k => groupOf(k) === g).length;
          return html`<button class=${g === activeGroup ? 'on' : ''} onClick=${() => pick(chosen.find(k => groupOf(k) === g))}><${Icon} name=${gi}/>${gl}${g === 'email' && html`<small>${n}</small>`}</button>`; })}</div>
        <div class="ed-sub">${chosen.filter(k => groupOf(k) === activeGroup).map(k => html`<button class=${k === active ? 'on' : ''} onClick=${() => pick(k)}>${CHANNELS[k].name}${!landingOk(landingFor(e, k)) && html`<i class="dot-warn" title="Needs a landing page"></i>`}</button>`)}</div>
        ${!canEdit && html`<div class="lock"><${Icon} name="shield"/>${e.stage === 'audience' ? 'With Membership for audience sign-off. Copy is locked until it reaches creative sign-off.'
          : e.stage === 'creative' ? 'With the Marketing & Communications Department for creative sign-off. Only they can change the copy now.' : 'Scheduled. Copy is locked.'}</div>`}
        <div class="ed-row">
          <div class="ed-ctl"><small>Tone</small><div class="seg">${TONES.map(([k, l]) => html`<button class=${tone === k ? 'on' : ''} disabled=${!canEdit} onClick=${() => setTone(k)}>${l}</button>`)}</div></div>
          ${e.audience.segments.length > 1 && html`<div class="ed-ctl"><small>Version For</small><div class="seg">${e.audience.segments.map(([n, count]) => html`<button class=${seg === n ? 'on' : ''} onClick=${() => setSeg(n)}>${n} <small>${count.toLocaleString('en-SG')}</small></button>`)}</div></div>`}
        </div>
        <div class="ed-split">
          <div class="ed-fields">
            ${CHANNELS[active].kind !== 'wa' && CHANNELS[active].kind !== 'li' && html`<label class="field"><span>Subject</span><input value=${c.subject} disabled=${!canEdit} onInput=${x => setField('subject', x.target.value)}/></label>`}
            ${c.headline !== undefined && html`<label class="field"><span>Headline</span><input value=${c.headline} disabled=${!canEdit} onInput=${x => setField('headline', x.target.value)}/></label>`}
            <label class="field"><span>Message</span><textarea rows="7" disabled=${!canEdit} value=${c.body.join('\n\n')} onInput=${x => setField('body', x.target.value.split(/\n\n+/))}></textarea>
              <small>Words in braces, like {first name}, are filled in for each member.</small></label>
            <label class="field"><span>Button</span><input value=${c.cta} disabled=${!canEdit} onInput=${x => setField('cta', x.target.value)}/></label>
            <fieldset class="lp-box"><legend>Landing Page <small>Required</small></legend>
              <div class="seg">${[['existing', 'Link Existing Page'], ['custom', 'Custom Page']].map(([m, l]) => html`<button class=${lp.mode === m ? 'on' : ''} disabled=${!canEdit}
                onClick=${() => { setLp(m === 'existing' ? { mode: m, url: LANDING_PAGES.some(p => p[0] === lp.url) ? lp.url : LANDING_PAGES[1][0] } : (lp.mode === 'custom' ? lp : customLanding(e))); setPv('lp'); }}>${l}</button>`)}</div>
              ${lp.mode === 'existing' ? html`
                <label class="field"><span>SBF Page</span><select value=${LANDING_PAGES.some(p => p[0] === lp.url) ? lp.url : ''} disabled=${!canEdit} onChange=${x => x.target.value && setLp({ url: x.target.value })}>
                  ${LANDING_PAGES.map(([u, n]) => html`<option value=${u}>${n}</option>`)}<option value="">Another page (paste the address below)</option></select></label>
                <label class="field"><span>Address</span><input value=${lp.url} disabled=${!canEdit} onInput=${x => setLp({ url: x.target.value.replace(/^https?:\/\//, '') })} placeholder="sbf.org.sg/…" aria-invalid=${!landingOk(lp)}/></label>`
              : html`
                <label class="field"><span>Page Headline</span><input value=${lp.headline} disabled=${!canEdit} onInput=${x => setLp({ headline: x.target.value })} aria-invalid=${!landingOk(lp)}/></label>
                <label class="field"><span>Summary</span><textarea rows="3" disabled=${!canEdit} value=${lp.summary} onInput=${x => setLp({ summary: x.target.value })}></textarea></label>
                <div class="lp-row"><label class="field"><span>Page Button</span><input value=${lp.cta} disabled=${!canEdit} onInput=${x => setLp({ cta: x.target.value })}/></label>
                  <label class="lp-form"><input type="checkbox" checked=${lp.form} disabled=${!canEdit} onChange=${x => setLp({ form: x.target.checked })}/><span>Registration form</span></label></div>
                <small class="muted lp-url">Publishes at <b>${lp.url}</b></small>`}
            </fieldset>
            <div class="rewrite"><small><${Icon} name="spark"/>Ask Sera to Rewrite</small>${REWRITES.map((r, i) => html`<${Button} variant="g" size="sm" disabled=${!canEdit} onClick=${() => rewrite(i)}>${r}<//>`)}</div>
          </div>
          <div class="ed-preview">
            <div class="pv-switch seg"><button class=${pv === 'msg' ? 'on' : ''} onClick=${() => setPv('msg')}>${chName(active)}</button><button class=${pv === 'lp' ? 'on' : ''} onClick=${() => setPv('lp')}>Landing Page</button></div>
            <small class="pv-label">${pv === 'msg' ? CHANNELS[active].desc : (lp.mode === 'existing' ? 'Existing page · ' : 'Custom page · ') + lp.url}</small>
            ${pv === 'msg' ? html`<${Preview} ch=${active} c=${c} entry=${e}/>` : html`<${LandingPreview} lp=${lp} entry=${e}/>`}</div>
        </div>
      </section>`}

      <aside class="card checks">
        <h3>Checks</h3>
        <div class="ck ok"><${Icon} name="check"/><span><b>Brand</b><small>SBF template, colours and logo locked. Sera only changes words.</small></span></div>
        <div class="ck ok"><${Icon} name="shield"/><span><b>Consent (PDPA)</b><small>${excluded.toLocaleString('en-SG')} members left out: ${active === 'wa' ? 'no WhatsApp opt-in' : 'unsubscribed or on the Do Not Call registry'}.</small></span></div>
        <div class=${'ck ' + (busyWeek ? 'warn' : 'ok')}><${Icon} name=${busyWeek ? 'alert' : 'check'}/><span><b>Message Load</b><small>${busyWeek ? '312 members already get 3 or more messages that week. Fix it in Plan.' : 'No member gets more than 2 messages that week.'}</small></span></div>
        <div class=${'ck ' + (lpMissing.length ? 'warn' : 'ok')}><${Icon} name=${lpMissing.length ? 'alert' : 'link'}/><span><b>Landing Pages</b><small>${lpMissing.length ? lpMissing.map(chName).join(', ') + ' still ' + (lpMissing.length === 1 ? 'needs' : 'need') + ' a landing page.' : 'Every message links to a landing page (' + chosen.length + ' of ' + chosen.length + ').'}</small></span></div>
        ${e.rsvpBy && html`<div class="ck ok"><${Icon} name="check"/><span><b>Attendance Tracking</b><small>Confirm and decline buttons feed RSVPs back to the entry and the CRM.</small></span></div>`}
        <div class="who-signs"><small>Sign-Off</small>
          <span><b>Audience</b> · Membership Department (Cheryl Kong)</span><span><b>Tone and Channel</b> · Marketing & Communications Department (Carolina Ng)</span></div>
        <div class="ck-actions">
          ${e.stage === 'draft' && html`<button class="btn btn-g btn-block" onClick=${() => actions.toast('Draft saved.')}>Save draft</button>
            <${Button} block disabled=${!chosen.length || lpMissing.length > 0} onClick=${() => actions.submit(e.id, chosen, s.user.name)}>Send for sign-off<//>`}
          ${(e.stage === 'audience' || e.stage === 'creative') && html`<button class="btn btn-p btn-block" onClick=${() => navigate('approve/' + e.id)}>${s.user.approves === e.stage ? 'Review and sign off' : 'See sign-off status'}</button>`}
          ${e.stage === 'scheduled' && html`<p class="muted">Approved and scheduled.</p>`}
        </div>
      </aside>
    </div>
  </div>`;
}

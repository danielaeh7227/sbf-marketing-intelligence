import { html, useState } from '../lib/html.js';
import { Icon } from '../lib/icons.js';
import { actions, EMBED } from '../lib/store.js';
import { USERS } from '../data/people.js';
import { SbfLogo, MiWordmark, MsLogo } from '../components/brand.js';
import { DotCanvas } from '../components/DotCanvas.js';

const SEA = Array.from({ length: 3400 }, () => ({ size: 0, tone: 'wave' }));
// A wide sea seen from close up, so it runs off the left, right and bottom edges
const SEA_VIEW = { span: 9, near: .5, depth: 4.6, height: .6, horizon: .36, curve: 1.7 };

export function Login() {
  const [step, setStep] = useState('start'); // start | pick | sent
  const [email, setEmail] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState('');

  function sendLink(e) {
    e.preventDefault();
    if (!/^[^@\s]+@sbf\.org\.sg$/i.test(email.trim())) { setErr('Use your SBF work email, ending in @sbf.org.sg.'); return; }
    setErr(''); setStep('sent');
  }
  async function pick(id) { setBusy(id); await actions.signIn(id); }

  return html`<main class=${'login' + (EMBED?.has('bare') ? ' bare' : '')}>
    <section class="login-art">
      <${DotCanvas} points=${SEA} shape="wave" sea=${SEA_VIEW}/>
      <div class="login-top"><${SbfLogo} white h=${40}/></div>
      <div class="login-foot"><${MiWordmark}/></div>
    </section>
    <section class="login-side">
      <div class="login-card" key=${step}>
        ${step === 'start' && html`
          <h1>Sign In</h1><p class="lead">Use your SBF work account.</p>
          <button class="btn btn-ms btn-block" onClick=${() => setStep('pick')}><${MsLogo}/>Sign in with Microsoft</button>
          <div class="or"><span>or</span></div>
          <form onSubmit=${sendLink} novalidate>
            <label class="field"><span>Work email</span>
              <input type="email" placeholder="name@sbf.org.sg" value=${email} aria-invalid=${!!err} onInput=${e => { setEmail(e.target.value); setErr(''); }}/>
              <small class=${err ? 'err' : ''}>${err || 'We will send you a sign-in link.'}</small></label>
            <button class="btn btn-o btn-block" type="submit">Email me a link</button>
          </form>
          <p class="help">Problems signing in? Contact <a href="#" onClick=${e => { e.preventDefault(); actions.toast('IT support: ext. 8800 or it@sbf.org.sg (sample)', 'info'); }}>IT support</a>.</p>`}
        ${step === 'pick' && html`
          <${MsLogo} size=${40}/>
          <h1 class="pick-h">Pick an Account</h1><p class="lead">to continue to Marketing Intelligence</p>
          <div class="accounts">${Object.values(USERS).map(u => html`
            <button class="account" disabled=${!!busy} data-busy=${busy === u.id} onClick=${() => pick(u.id)}>
              <span class=${'av av-' + u.role}>${u.ab}</span>
              <span class="acc-tx"><b>${u.name}</b><small>${u.dept}</small></span>
              ${busy === u.id ? html`<span class="spin"></span>` : html`<${Icon} name="chevR"/>`}
            </button>`)}</div>
          <button class="link-back" onClick=${() => setStep('start')}><${Icon} name="back"/>Back</button>`}
        ${step === 'sent' && html`
          <span class="sent-ic"><${Icon} name="mail"/></span>
          <h1 class="pick-h">Check Your Inbox</h1>
          <p class="lead">We sent a sign-in link to <b>${email}</b>. It expires in 15 minutes.</p>
          <p class="note">This is a prototype, so no email is sent. Pick an Account to continue.</p>
          <button class="btn btn-ms btn-block" onClick=${() => setStep('pick')}>Continue to accounts</button>
          <button class="link-back" onClick=${() => setStep('start')}><${Icon} name="back"/>Back</button>`}
      </div>
    </section>
  </main>`;
}

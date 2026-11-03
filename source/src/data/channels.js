import { TODAY } from './calendar.js';

// Channel catalogue and the copy the agent drafts. In production the copy comes from the model,
// constrained by these templates and SBF's brand rules; here it is assembled from fixed phrases.
// Three tabs: Email (five templates), LinkedIn and WhatsApp. Every message links to a landing page.
export const GROUPS = [['email', 'Email', 'mail'], ['li', 'LinkedIn', 'linkedin'], ['wa', 'WhatsApp', 'wa']];
export const CHANNELS = {
  bizspoke: { group: 'email', name: 'BizSpoke Newsletter', icon: 'news', kind: 'email', desc: 'A feature in the periodical member newsletter' },
  pre: { group: 'email', name: 'Upcoming Events (Monthly)', icon: 'plan', kind: 'email', desc: 'The monthly round-up of what is on, with this entry featured' },
  invite: { group: 'email', name: 'Guest Invitation', icon: 'mail', kind: 'email', rsvp: true, desc: 'Email invitation with confirm or decline buttons' },
  letter: { group: 'email', name: 'VIP Invitation', icon: 'letter', kind: 'letter', rsvp: true, desc: 'Signed letter for C-suite and VIP guests, with an RSVP link' },
  welcome: { group: 'email', name: 'Welcome Letter', icon: 'hand', kind: 'letter', desc: 'Onboarding letter with first steps and a named contact' },
  recap: { group: 'email', name: 'Event Recap', icon: 'refresh', kind: 'email', desc: 'Thank-you, takeaways, slides and the next step' },
  li: { group: 'li', name: 'Post', icon: 'linkedin', kind: 'li', desc: 'Public post on the SBF company page, for reach' },
  wa: { group: 'wa', name: 'Message', icon: 'wa', kind: 'wa', desc: 'Short message with a link preview, opted-in members only' }
};
// Name shown outside the Email / LinkedIn / WhatsApp tabs
export const chName = k => CHANNELS[k].group === 'email' ? CHANNELS[k].name : GROUPS.find(g => g[0] === CHANNELS[k].group)[1] + ' ' + CHANNELS[k].name;

// Landing pages: link an existing SBF page, or Sera drafts a custom one
export const LANDING_PAGES = [
  ['sbf.org.sg/events/go-global-indonesia', 'Go Global: Indonesia Market Briefing'],
  ['sbf.org.sg/events', 'Events Calendar'],
  ['sbf.org.sg/bizspoke', 'BizSpoke Newsletter Archive'],
  ['sbf.org.sg/membership/welcome', 'New Member Hub'],
  ['sbf.org.sg/membership/associates', 'Associate Membership'],
  ['sbf.org.sg/pw-mark/renew', 'PW Mark Renewal'],
  ['sbf.org.sg/budget-2027', 'Budget 2027 Survey'],
  ['sbf.org.sg/networks/sg-wen', 'SG-WEN Network']
];
const PAGE_FOR = { e1: 0, e3: 2, e4: 3, e5: 5, e6: 6, e9: 2, p1: 1, p2: 2, p3: 3 };
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export function landingFor(e, ch) {
  const saved = e.landing?.[ch]; if (saved) return saved;
  if (ch === 'bizspoke') return { mode: 'existing', url: LANDING_PAGES[2][0] };
  if (ch === 'welcome') return { mode: 'existing', url: LANDING_PAGES[3][0] };
  if (PAGE_FOR[e.id] !== undefined) return { mode: 'existing', url: LANDING_PAGES[PAGE_FOR[e.id]][0] };
  return customLanding(e);
}
// The page Sera drafts when there is no existing page to link
export const customLanding = e => ({ mode: 'custom', url: 'sbf.org.sg/lp/' + slug(e.title), headline: e.title, summary: HOOK[e.id] || 'Everything you need to know, and how to take part.',
  cta: e.type === 'mice' ? 'Register Now' : e.type === 'promo' ? 'Renew Now' : 'Find Out More', form: e.type === 'mice' || e.type === 'promo' });
export const landingOk = l => l && (l.mode === 'existing' ? /\S+\.\S+/.test(l.url || '') : !!(l.headline || '').trim());
export const pageTitle = url => LANDING_PAGES.find(p => p[0] === url)?.[1] || 'Linked Page';

export const TONES = [['warm', 'Warm'], ['formal', 'Formal'], ['bold', 'Bold']];

export const fmtDate = (iso, o = { weekday: 'short', day: 'numeric', month: 'short' }) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-SG', { ...o, timeZone: 'UTC' });
export const shift = (iso, d) => { const x = new Date(iso + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + d); return x.toISOString().slice(0, 10); }; // dates are plain days: work in UTC so time zones never shift them

// What the agent suggests for each kind of entry, with when and why
export function suggestChannels(e) {
  const soonest = e.stage === 'review' ? '' : shift(TODAY, 1); // never plan a send in the past
  const at = (d, k, why, rec = true) => { const date = shift(e.date, d); return { key: k, date: date < soonest ? soonest : date, why, rec }; };
  if (e.type === 'mice') return [
    at(-21, 'invite', 'Email is how most members prefer to hear from SBF; the RSVP buttons feed attendance straight back.'),
    at(-3, 'wa', 'Reminders on WhatsApp lifted RSVPs by 31 at the Vietnam briefing. Opted-in members only.'),
    at(-12, 'pre', 'Featured in the monthly Upcoming Events email, which 41% of members open.'),
    at(-14, 'li', 'Public reach for non-members and partners. Weak for sign-ups, so it supports the invite.'),
    at(2, 'recap', 'Recaps produced 9 story leads after the Sustainability roundtable.'),
    at(-20, 'letter', 'Only for C-suite and VIP guests, where a signed letter outperforms the Guest Invitation.', false),
    at(-8, 'bizspoke', 'A feature in the next issue reaches members who skip event emails.', false)
  ];
  if (e.type === 'onboard') return [
    at(0, 'welcome', 'Welcome Letters are opened by almost every new member (89% last month).'),
    at(3, 'pre', 'This month\'s Upcoming Events with a welcome note, so new members pick a first event.', false),
    at(1, 'wa', 'A short hello on WhatsApp was read by 97% of opted-in new members.'),
    at(7, 'bizspoke', 'Introduce the cohort in BizSpoke to start member-to-member connections.', false),
    at(0, 'invite', 'A Guest Invitation to the next welcome session, for members who prefer to meet in person.', false)
  ];
  if (e.type === 'news') return [at(0, 'bizspoke', 'The scheduled issue.'), at(0, 'li', 'Share the lead story for public reach.')];
  if (e.type === 'promo') return [
    at(0, 'invite', 'Email carries the detail and the renewal link.'),
    at(5, 'wa', 'A nudge for those who opened but did not act.'),
    at(0, 'li', 'Public reach is not needed for a member-only offer.', false)
  ];
  return [at(0, 'invite', 'Email reaches every member with a clear call to action.'), at(0, 'li', 'Public reach for a public message.'), at(2, 'wa', 'A reminder for opted-in members who have not responded.', false)];
}

const HOOK = {
  e1: "Indonesia's new free-trade zones and the Nusantara build-out, explained by people already doing business there.",
  e2: "An evening for SBF's Associate members to meet each other, our partners and the Membership team.",
  e4: 'Welcome to the Singapore Business Federation. Here is how to get the most from your first 90 days.',
  e5: 'Your Progressive Wage Mark is due for renewal. Renewing early keeps your accreditation for tenders uninterrupted.',
  e6: "Tell the Government what your business needs from Budget 2027. SBF takes members' views straight into its recommendations.",
  e3: "This month: grants that pay for themselves, the ASEAN logistics corridor, and three members who went regional.",
  e7: 'A breakfast for women business leaders on scaling across ASEAN.',
  e8: 'A thank-you evening for the members who make SBF what it is.',
  e10: "SBF is at the APEC CEO Summit representing Singapore's business community."
};

const SEG_LINE = {
  'Logistics & trade': ["Indonesia's ports are opening new corridors for Singapore logistics firms, and you'll hear how to use them.", 'Indonesian port and free-trade-zone reforms present new corridors for Singapore logistics firms.', 'New corridors are opening in Indonesia. Logistics firms that move first will own them.'],
  Manufacturing: ['Hear how Singapore manufacturers are setting up plants in Batam and Bintan, and what it cost them.', 'Manufacturers will hear first-hand accounts of establishing operations in Batam and Bintan.', 'Batam and Bintan are where Singapore manufacturing is growing next. Find out how.'],
  'Lapsing members': ["It's been a while since we saw you, and this one is worth coming back for.", 'We would value your participation, and believe this session is particularly relevant to you.', 'This is the session to come back for.'],
  'Associates needing attention': ["We've missed you. Come and meet the members who joined this year.", 'We would be glad to welcome you back to an SBF event.', 'Come back and see what has changed.'],
  'Active Associates': ['Thank you for being one of our most active Associates. Bring a business friend.', 'As one of our most engaged Associates, you are welcome to bring a guest.', 'You are one of our most active Associates. Bring someone along.']
};
const TI = { warm: 0, formal: 1, bold: 2 };
const monthOf = iso => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-SG', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export function copyFor(e, ch, tone = 'warm', seg = '') {
  const t = TI[tone] ?? 0, hook = HOOK[e.id] || e.title + '.', when = fmtDate(e.date) + (e.time ? ', ' + e.time : ''), where = e.venue || 'Online';
  const segLine = SEG_LINE[seg]?.[t];
  const greet = ['Dear {first name},', 'Dear {salutation} {last name},', 'Hi {first name},'][t];
  const rsvp = e.rsvpBy ? (t === 1 ? 'Kindly confirm your attendance by ' : 'Please confirm by ') + fmtDate(e.rsvpBy) + '.' : '';
  switch (ch) {
    case 'invite': return {
      subject: [`You're invited: ${e.title}`, `Invitation: ${e.title}`, `${e.title}: save your seat`][t],
      pre: hook, headline: e.type === 'mice' ? e.title : hook.split('.')[0],
      body: [greet, segLine || hook, ...(e.type === 'mice' ? [`${when} · ${where}`, rsvp] : [hook === segLine ? '' : 'Find out more and act by ' + fmtDate(shift(e.date, 30)) + '.'])].filter(Boolean),
      cta: e.type === 'mice' ? 'Confirm Attendance' : e.type === 'promo' ? 'Renew Now' : 'Take Part', cta2: e.type === 'mice' ? "Can't Make It" : null };
    case 'letter': return {
      subject: `VIP Invitation: ${e.title}`, pre: 'A personal invitation · RSVP link',
      headline: e.type === 'onboard' ? 'Welcome to SBF' : e.title,
      body: [greet, 'On behalf of the Singapore Business Federation, it is my pleasure to invite you to ' + e.title + '.', segLine || hook, `${when} · ${where}`, rsvp].filter(Boolean),
      cta: 'Confirm Attendance', sign: 'Chief Executive Officer, Singapore Business Federation' };
    case 'welcome': return {
      subject: ['Welcome to SBF, {company}', 'Welcome to the Singapore Business Federation', "You're in. Here's what to do first"][t], pre: 'Your first 90 days',
      headline: 'Welcome to SBF',
      body: [greet, hook, '1. Join a network that fits your sector. 2. Book your free welcome call. 3. Pick your first event.', 'Your Membership contact is {account manager}, who will call you this month.'],
      cta: 'Book My Welcome Call', sign: 'Chief Membership Officer, Singapore Business Federation' };
    case 'wa': return {
      subject: 'WhatsApp', pre: '',
      body: [[`Hi {first name}, ${e.title} is on ${when}. ${segLine || hook}`, `Dear {first name}, a reminder that ${e.title} takes place on ${when}.`, `{first name}, ${e.title}, ${when}. Seats are going.`][t], e.rsvpBy ? 'Tap to confirm:' : 'Details:'],
      link: 'sbf.org.sg/e/' + e.id, cta: 'Open' };
    case 'pre': return {
      subject: [e.type === 'onboard' ? 'Welcome to SBF: what is on this month' : 'Upcoming events this month, starting with ' + e.title, 'Upcoming Events: ' + monthOf(e.date), "This month's must-attend events"][t], pre: e.type === 'onboard' ? 'Your first events as a member' : hook,
      headline: e.type === 'onboard' ? 'Welcome. Here is what is on.' : 'Upcoming Events · ' + monthOf(e.date),
      body: [greet, e.type === 'onboard' ? hook + ' Pick one event below to start.' : segLine || hook, `Featured: ${e.title} · ${when} · ${where}`, 'Also this month: BizSpoke Live, the SME Digital Clinic and the Associates Networking Night.',
        ...(e.type === 'onboard' ? ['Your Membership contact is {account manager}, who will call you this month.'] : [])],
      cta: e.type === 'onboard' ? 'Pick My First Event' : 'See All Events' };
    case 'recap': return {
      subject: ['Thank you for joining ' + e.title, e.title + ': summary and materials', 'What you missed (or want again)'][t], pre: 'Slides, takeaways and what comes next',
      headline: 'Thank You for Coming', body: [greet, 'Three takeaways, the slides, and the next step if you want to go further.', 'Next: a 1-to-1 market consultation with our Indonesia team.'],
      cta: 'Book a Consultation' };
    case 'bizspoke': return {
      subject: ['BizSpoke · ' + e.title, 'BizSpoke: ' + e.title, 'BizSpoke: read this first'][t], pre: hook,
      headline: e.title, body: [hook, segLine || '', 'Read the full story and see upcoming events.'].filter(Boolean), cta: 'Read in BizSpoke' };
    case 'li': return {
      subject: 'LinkedIn', pre: '',
      body: [[`${hook} Join us on ${fmtDate(e.date)}.`, `SBF invites businesses to ${e.title} on ${fmtDate(e.date)}. ${hook}`, `${hook} ${fmtDate(e.date)}. Be there.`][t], '#SBF #SingaporeBusiness' + (e.id === 'e1' ? ' #GoGlobal #Indonesia' : '')],
      cta: 'Learn More' };
  }
  return { subject: e.title, body: [hook], cta: 'Learn More' };
}

// Alternative copy the agent offers on "Rewrite"
export const REWRITES = [
  'Shorter, with the date and the main benefit first.',
  'Lead with a member who has already done it.',
  'Lead with the number: what members gained last time.'
];

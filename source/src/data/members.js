// Sample member companies. Shape mirrors what the CRM + enrichment pipeline would return per member.
// A handful are written by hand for the demo; the rest are generated from a fixed seed so every load is identical.

// Activity score: the weights are shown to users in Settings, so the score is never a black box.
export const SCORE_WEIGHTS = [
  ['events', 'Events attended', 30], ['email', 'Opens and clicks', 20], ['web', 'Website and portal visits', 15],
  ['social', 'Social interactions with SBF', 10], ['prog', 'Programmes and networks', 15], ['standing', 'Good standing (dues, renewals)', 10]
];
export const bandOf = score => score >= 70 ? 'hi' : score >= 40 ? 'mid' : 'lo';
export const BAND = { hi: ['Active', 'ok'], mid: ['Steady', 'c'], lo: ['Needs Attention', 'warn'] };

export const SECTORS = {
  log: ['Transport & logistics', ['Logistics', 'Freight', 'Shipping']],
  mfg: ['Manufacturing', ['Precision', 'Engineering', 'Industries']],
  fnb: ['Food & beverage', ['Foods', 'Kitchen', 'Bakery']],
  tech: ['Technology', ['Analytics', 'Digital', 'Systems']],
  build: ['Construction & real estate', ['Builders', 'Green Build', 'Development']],
  fin: ['Financial services', ['Capital', 'Advisory', 'Wealth']],
  edu: ['Education & training', ['Learning', 'Academy', 'Skills']],
  health: ['Healthcare', ['Medical', 'Health', 'Biotech']],
  trade: ['Wholesale & retail', ['Trading', 'Retail', 'Supplies']],
  pro: ['Professional services', ['Consulting', 'Partners', 'Legal']]
};
const SECTOR_KEYS = Object.keys(SECTORS);
const PREFIX = ['Lion', 'Straits', 'Orchid', 'Raffles', 'Keppel', 'Tanjong', 'Jurong', 'Marina', 'Bukit', 'Changi', 'Kallang', 'Novena', 'Tampines', 'Serangoon', 'Clementi', 'Pioneer', 'Equator', 'Monsoon', 'Banyan', 'Junction', 'Vantage', 'Summit', 'Northstar', 'Bluewater', 'Redhill', 'Greenfield', 'Silverline', 'Ironbridge', 'Lantern', 'Compass', 'Anchor', 'Tidewater', 'Crescent', 'Harbourfront', 'Meranti', 'Saga', 'Cendana', 'Seletar', 'Halcyon', 'Kingfisher'];
const FIRST = ['Rachel', 'Daniel', 'Priya', 'Melvin', 'Joyce', 'Aisha', 'Kenneth', 'Wei Ling', 'Arjun', 'Grace', 'Marcus', 'Nur', 'Benjamin', 'Hui Min', 'Farhan', 'Stephanie', 'Jonathan', 'Siti', 'Vincent', 'Mei Xin'];
const LAST = ['Koh', 'Wee', 'Nair', 'Tan', 'Lim', 'Rahman', 'Ong', 'Chua', 'Menon', 'Teo', 'Goh', 'Ismail', 'Ng', 'Lee', 'Ho', 'Yeo', 'Pillai', 'Chong', 'Seah', 'Low'];
const PAST = [
  ['22 Oct', 'Go Global: Vietnam Market Briefing'], ['16 Oct', 'BizSpoke · October Issue'], ['7 Oct', 'Welcome to SBF · October Cohort'],
  ['30 Sep', 'Sustainability Leaders Roundtable'], ['18 Sep', 'SME Digital Clinic'], ['4 Sep', 'Budget 2027 focus group'], ['21 Aug', 'Go Global: Thailand Business Mission']
];

function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }

// Hand-written profiles used in the demo flows
const NAMED = [
  { id: 'harbourline', name: 'Harbourline Logistics Pte Ltd', sec: 'log', tier: 'Ordinary', since: 2009, staff: '200–499', score: 82, delta: 6,
    contact: ['Rachel Koh', 'Managing Director'], wa: true,
    parts: { events: 28, email: 16, web: 12, social: 8, prog: 12, standing: 6 },
    tl: [['22 Oct', 'ev', 'Attended Go Global: Vietnam Market Briefing'], ['17 Oct', 'em', 'Clicked BizSpoke: ASEAN logistics corridor'], ['9 Oct', 'web', 'Read the Indonesia market guide 3 times'], ['30 Sep', 'ev', 'Attended Sustainability Leaders Roundtable'], ['12 Sep', 'ac', 'Paid 2026 subscription on time']],
    ext: [['Company website', 'Published a 2025 sustainability report: electric prime movers cut fleet emissions by 18%.', 'harbourline.com.sg/sustainability'], ['LinkedIn', 'Managing Director posted about the new Batam cold-chain hub (1,200 reactions).', 'linkedin.com/company/harbourline'], ['News', 'Named in a Business Times logistics feature, October 2026.', 'businesstimes.com.sg']],
    nba: [['event', 'Ask Rachel Koh to speak at Go Global: Indonesia', 'Expanding to Batam and attends most market briefings'], ['story', 'Invite them to share their sustainability story', 'Fresh report and 3 of the last 4 events attended'], ['promo', 'Offer a BizSpoke sponsor slot', 'Launching the Batam hub and recruiting partners']] },
  { id: 'pinewood', name: 'Pinewood Learning Hub', sec: 'edu', tier: 'Associate', since: 2024, staff: '10–49', score: 22, delta: -18,
    contact: ['Melvin Tan', 'Owner'], wa: false, billing: 'Renewal invoice due January 2027',
    parts: { events: 4, email: 5, web: 4, social: 0, prog: 0, standing: 9 },
    tl: [['14 Sep', 'em', 'Opened BizSpoke, no click'], ['2 Jul', 'web', 'Visited the Membership benefits page'], ['18 May', 'ev', 'Attended SME Digital Clinic'], ['10 Jan', 'ac', 'Renewed Associate membership']],
    ext: [['Company website', 'Launched a corporate training arm for SMEs, August 2026.', 'pinewood.edu.sg'], ['Facebook', 'Hiring 2 trainers; posts weekly about WSQ courses.', 'facebook.com/pinewoodlearning']],
    nba: [['call', 'Personal call from the Membership team', 'Score down 18 points in 60 days; renewal due in January'], ['event', 'Offer a free seat at the Career Conversion briefing', 'They are hiring trainers'], ['welcome', 'Send the "getting more from SBF" letter', 'Has not used member benefits since May']] },
  { id: 'sutera', name: 'Sutera Green Build Pte Ltd', sec: 'build', tier: 'Ordinary', since: 2012, staff: '50–199', score: 74, delta: 4,
    contact: ['Aisha Rahman', 'CEO'], wa: true,
    parts: { events: 24, email: 15, web: 11, social: 9, prog: 10, standing: 5 },
    tl: [['25 Oct', 'so', 'Shared an SBF LinkedIn post on Green Mark incentives'], ['3 Oct', 'ev', 'Attended Built Environment dialogue'], ['20 Sep', 'ac', 'Member story published with consent']],
    ext: [['Company website', 'Two shophouse retrofits certified Green Mark Platinum.', 'suteragreen.sg'], ['LinkedIn', 'CEO op-ed on retrofit financing.', 'linkedin.com/company/sutera']],
    nba: [['event', 'Invite to the Year-End Member Appreciation as a host table', 'Consistently active and visible on LinkedIn'], ['story', 'Feature in BizSpoke December', 'Green Mark Platinum news is fresh']] },
  { id: 'kopilane', name: 'Kopi Lane F&B Pte Ltd', sec: 'fnb', tier: 'Associate', since: 2023, staff: '50–199', score: 31, delta: -9,
    contact: ['Nur Ismail', 'Director'], wa: true, billing: 'Renewal invoice overdue by 21 days',
    parts: { events: 6, email: 8, web: 6, social: 3, prog: 2, standing: 6 },
    tl: [['16 Oct', 'em', 'Opened BizSpoke, clicked the grants article'], ['4 Sep', 'ev', 'Registered for Budget 2027 focus group, did not attend'], ['12 Jun', 'ac', 'Joined the F&B WhatsApp community']],
    ext: [['Company website', 'Opening a third outlet in Punggol, December 2026.', 'kopilane.sg'], ['Instagram', 'Hiring service crew across 3 outlets.', 'instagram.com/kopilane']],
    nba: [['call', 'Call about the overdue renewal before it lapses', 'Invoice overdue by 21 days; still opening emails'], ['wa', 'Send the F&B grants round-up on WhatsApp', 'Opted in to WhatsApp and clicks on grants content']] },
  { id: 'lumen', name: 'Lumen Analytics Pte Ltd', sec: 'tech', tier: 'Ordinary', since: 2018, staff: '50–199', score: 58, delta: 11,
    contact: ['Arjun Menon', 'Co-founder'], wa: false,
    parts: { events: 14, email: 13, web: 12, social: 6, prog: 8, standing: 5 },
    tl: [['22 Oct', 'ev', 'Attended Go Global: Vietnam Market Briefing'], ['10 Oct', 'web', 'Downloaded the SME AI adoption report'], ['18 Sep', 'ev', 'Spoke at SME Digital Clinic']],
    ext: [['LinkedIn', 'Announced a Series A round and a Jakarta office.', 'linkedin.com/company/lumen-analytics']],
    nba: [['event', 'Invite to Go Global: Indonesia with a speaker slot', 'Opening a Jakarta office; rising score'], ['story', 'Ask to share their founding story', 'Series A milestone']] },
  { id: 'meridian', name: 'Meridian Precision Engineering', sec: 'mfg', tier: 'Ordinary', since: 2001, staff: '500+', score: 46, delta: -3,
    contact: ['Vincent Chong', 'Head of Corporate Affairs'], wa: false,
    parts: { events: 12, email: 9, web: 8, social: 2, prog: 9, standing: 6 },
    tl: [['30 Sep', 'em', 'Opened BizSpoke'], ['21 Aug', 'ev', 'Joined Go Global: Thailand Business Mission']],
    ext: [['News', 'Expanding its Johor plant; 200 new roles.', 'straitstimes.com']],
    nba: [['event', 'Invite to Go Global: Indonesia', 'Regional expansion; joined the Thailand mission'], ['call', 'Check in on the Johor expansion', 'Score slipping slowly']] }
];

function generate(n) {
  const r = rng(20261103), out = [];
  const used = new Set(NAMED.map(m => m.name));
  for (let i = 0; out.length < n; i++) {
    const sec = SECTOR_KEYS[Math.floor(r() * SECTOR_KEYS.length)];
    const name = PREFIX[Math.floor(r() * PREFIX.length)] + ' ' + SECTORS[sec][1][Math.floor(r() * 3)] + ' Pte Ltd';
    if (used.has(name)) continue; used.add(name);
    const x = r(), score = Math.round(x < .24 ? 70 + r() * 28 : x < .76 ? 40 + r() * 29 : 6 + r() * 33);
    const k = score / 100, jitter = () => .7 + r() * .6;
    const parts = Object.fromEntries(SCORE_WEIGHTS.map(([key, , w]) => [key, Math.min(w, Math.round(w * k * jitter()))]));
    const fn = FIRST[Math.floor(r() * FIRST.length)], ln = LAST[Math.floor(r() * LAST.length)];
    const tl = PAST.filter(() => r() < k * .7).slice(0, 4).map(([d, t]) => [d, t.startsWith('BizSpoke') ? 'em' : 'ev', (t.startsWith('BizSpoke') ? 'Opened ' : t.startsWith('Welcome') ? 'Received ' : 'Attended ') + t]);
    if (!tl.length) tl.push(['3 Aug', 'em', 'Received BizSpoke, not opened']);
    out.push({ id: 'm' + i, name, sec, tier: r() < .78 ? 'Ordinary' : 'Associate', since: 1995 + Math.floor(r() * 31), staff: ['10–49', '50–199', '200–499', '500+'][Math.floor(r() * 4)],
      score, delta: Math.round((r() - .45) * 20), contact: [fn + ' ' + ln, ['Managing Director', 'Director', 'Head of Marketing', 'CEO', 'Business Development Manager'][Math.floor(r() * 5)]],
      wa: r() < .45, billing: score < 30 && r() < .35 ? 'Renewal invoice overdue by ' + (7 + Math.floor(r() * 40)) + ' days' : null, parts, tl, ext: [], nba: [] });
  }
  return out;
}

// Next best actions when nobody has written them by hand: simple rules, each with its reason
function nbaFor(m) {
  if (m.nba.length) return m.nba;
  const band = bandOf(m.score), sector = SECTORS[m.sec][0];
  if (m.billing) return [['call', 'Call about the renewal before it lapses', m.billing], ['welcome', 'Send a "what you get from SBF" recap', 'Low use of benefits this year']];
  if (band === 'lo') return [['call', 'Personal check-in from the Membership team', 'No events in 3 months; score ' + m.score], ['event', 'Invite to an upcoming ' + sector + ' session', 'Matches their sector']];
  if (band === 'mid') return [['event', 'Invite to Go Global: Indonesia', 'Opens market content; ' + sector], ['wa', m.wa ? 'Send event reminders on WhatsApp' : 'Ask for WhatsApp opt-in at the next event', m.wa ? 'Opted in; email opens are falling' : 'Prefers short messages']];
  return [['story', 'Invite them to share their story', 'Among the most active members'], ['promo', 'Offer a BizSpoke sponsor slot', 'High engagement and visibility']];
}

export const MEMBERS = [...NAMED, ...generate(640 - NAMED.length)].map(m => ({
  ...m, ab: m.name.replace(/ Pte Ltd$/, '').split(' ').map(w => w[0]).join('').slice(0, 2), band: bandOf(m.score),
  sector: SECTORS[m.sec][0], email: true, ext: m.ext, nba: nbaFor(m)
}));

export const BAND_COUNTS = MEMBERS.reduce((a, m) => (a[m.band]++, a), { hi: 0, mid: 0, lo: 0 });

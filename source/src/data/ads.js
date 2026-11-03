// Partner ads: SBF's marketing spaces sold to members and partners. Rates, bookings and results are sample figures.
export const AD_SLOTS = [
  { id: 'hero', name: 'Homepage Hero Banner', where: 'sbf.org.sg', unit: 'week', reach: 42000, ctr: .9, rate: 1800 },
  { id: 'edm', name: 'BizSpoke Sponsor', where: 'Member Newsletter', unit: 'issue', reach: 13000, ctr: 3.1, rate: 2400 },
  { id: 'frb', name: 'Future Ready Spotlight', where: 'Feature Article', unit: 'month', reach: 26000, ctr: 1.4, rate: 3200 },
  { id: 'li', name: 'LinkedIn Partner Post', where: 'SBF LinkedIn', unit: 'post', reach: 18000, ctr: 1.2, rate: 1500 },
  { id: 'ev', name: 'Event Sponsorship', where: 'SBF Centre events', unit: 'event', reach: 600, ctr: 12, rate: 5000 },
  { id: 'dir', name: 'Directory Featured Listing', where: 'Members Directory', unit: 'month', reach: 9000, ctr: 4, rate: 600 }
];

// Members pay less, and active members (score 70+) less again
export const AD_TIERS = [['non', 'Non-member', 0], ['member', 'Member', .15], ['active', 'Active Member', .25]];
export const AD_WEEKS = ['2 Nov', '9 Nov', '16 Nov', '23 Nov', '30 Nov', '7 Dec', '14 Dec', '21 Dec'];

export const adPrice = (slot, units, tier) => {
  const s = AD_SLOTS.find(x => x.id === slot), d = AD_TIERS.find(t => t[0] === tier)[2];
  return { list: s.rate * units, off: Math.round(s.rate * units * d), total: Math.round(s.rate * units * (1 - d)) };
};
export const adMoney = v => '$' + Math.round(v).toLocaleString('en-SG');

// week: first week index on the placement grid; weeks: how many grid weeks it holds; units: what is billed
const bk = (id, who, tier, slot, week, weeks, units, st, when) => ({ id, who, tier, slot, week, weeks, units, st, when, value: adPrice(slot, units, tier).total });
export const AD_BOOKINGS = [
  bk('b1', 'Harbourline Logistics', 'active', 'hero', 0, 2, 2, 'booked', '21 Oct'),
  bk('b2', 'Lumen Analytics', 'active', 'edm', 0, 1, 1, 'booked', '19 Oct'),
  bk('b3', 'Pinnacle HR Partners', 'member', 'dir', 0, 4, 1, 'booked', '24 Oct'),
  bk('b4', 'GreenPort Solar', 'non', 'frb', 1, 4, 1, 'pending', '30 Oct'),
  bk('b5', 'Bluewave Fintech', 'member', 'li', 1, 1, 2, 'pending', '31 Oct'),
  bk('b6', 'Straits Capital Advisory', 'member', 'edm', 2, 1, 1, 'booked', '22 Oct'),
  bk('b7', 'Orchid Hospitality Group', 'member', 'li', 2, 1, 1, 'booked', '27 Oct'),
  bk('b8', 'Kestrel Precision Engineering', 'member', 'hero', 3, 2, 2, 'pending', '2 Nov'),
  bk('b9', 'Nexa Robotics', 'non', 'ev', 4, 1, 1, 'booked', '15 Oct'),
  bk('b10', 'Tanjong Freight', 'member', 'edm', 4, 1, 1, 'booked', '28 Oct'),
  bk('b11', 'Lumen Analytics', 'active', 'hero', 5, 1, 1, 'changes', '29 Oct'),
  bk('b12', 'Harbourline Logistics', 'active', 'edm', 6, 1, 1, 'booked', '1 Nov')
];

// Tracking for ads that are running or finished: [advertiser, slot, impressions, clicks, leads, % of the run delivered]
export const AD_RESULTS = [
  ['Harbourline Logistics', 'hero', 21400, 196, 14, 60],
  ['Lumen Analytics', 'edm', 12860, 412, 23, 100],
  ['Pinnacle HR Partners', 'dir', 2150, 88, 9, 25],
  ['Straits Capital Advisory', 'edm', 13100, 377, 19, 100],
  ['Orchid Hospitality Group', 'li', 17900, 210, 6, 100]
];
export const AD_MONTHS = [['May', 14], ['Jun', 18], ['Jul', 16], ['Aug', 22], ['Sep', 27], ['Oct', 31]]; // November comes from the bookings
export const AD_BY_SLOT = [['edm', 62], ['hero', 48], ['frb', 26], ['li', 21], ['ev', 20], ['dir', 9]]; // $ thousands this year

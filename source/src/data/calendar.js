// The shared marketing communications calendar. Sample entries for Sep to Dec 2026; "today" is 3 Nov 2026.
export const TODAY = '2026-11-03';

export const TYPES = {
  mice: ['MICE', 'Meetings, events and missions'],
  promo: ['Promotion', 'Offers, renewals and partner placements'],
  news: ['Newsletter', 'BizSpoke issues'],
  onboard: ['Onboarding', 'Welcome and getting started'],
  announce: ['Announcement', 'Surveys, statements and news']
};

// Each entry moves through the same stages. The Membership Department owns the audience; Marketing & Communications owns the creative.
export const STAGES = [
  ['draft', 'Draft', 'Membership'], ['audience', 'Audience Sign-Off', 'Cheryl Kong'], ['creative', 'Creative Sign-Off', 'Carolina Ng'],
  ['scheduled', 'Scheduled', 'Carolina Ng'], ['sent', 'Sent', ''], ['review', 'Reviewed', 'Sera']
];
export const stageIndex = s => STAGES.findIndex(x => x[0] === s);


export const ENTRIES = [
  { id: 'e1', title: 'Go Global: Indonesia Market Briefing', type: 'mice', dept: 'Membership Department', owner: 'Membership', date: '2026-11-19', time: '9:00 am', venue: 'SBF Centre, Level 10', rsvpBy: '2026-11-14',
    goal: '120 confirmed seats', eligibility: 'All members', audience: { label: 'Trade, logistics and manufacturing members with ASEAN interest', count: 1240, segments: [['Logistics & trade', 620], ['Manufacturing', 380], ['Lapsing members', 240]] },
    stage: 'creative', channels: ['invite', 'wa', 'pre', 'li', 'recap'], fresh: true,
    history: [['28 Oct', 'Membership', 'Created the entry'], ['29 Oct', 'Sera', 'Suggested 5 channels and drafted copy'], ['31 Oct', 'Cheryl Kong', 'Approved the audience (1,240 members, 18 excluded for consent)']] },
  { id: 'e2', title: 'Associates Networking Night', type: 'mice', dept: 'Membership Department', owner: 'Membership', date: '2026-11-27', time: '6:30 pm', venue: 'SBF Centre, Level 1 Atrium', rsvpBy: '2026-11-20',
    goal: '150 attendees, 20 lapsing Associates re-engaged', eligibility: 'Associate members', audience: { label: 'Associate members', count: 736, segments: [['Active Associates', 210], ['Steady Associates', 330], ['Associates needing attention', 196]] },
    stage: 'audience', channels: ['invite', 'letter', 'wa', 'recap'], fresh: true,
    history: [['30 Oct', 'Membership', 'Created the entry'], ['30 Oct', 'Sera', 'Suggested 4 channels and drafted copy']] },
  { id: 'e3', title: 'BizSpoke · November Issue', type: 'news', dept: 'Membership Department', owner: 'Membership', date: '2026-11-13', time: '8:00 am', rsvpBy: null,
    goal: '40% open rate', eligibility: 'All members', audience: { label: 'All members', count: 34160, segments: [['All members', 34160]] },
    stage: 'scheduled', channels: ['bizspoke', 'li'], history: [['27 Oct', 'Membership', 'Created the entry'], ['1 Nov', 'Cheryl Kong', 'Approved the audience'], ['2 Nov', 'Carolina Ng', 'Approved the creative']] },
  { id: 'e4', title: 'Welcome to SBF · November Cohort', type: 'onboard', dept: 'Membership Department', owner: 'Membership', date: '2026-11-06', time: '10:00 am', rsvpBy: null,
    goal: 'Every new member opens their welcome pack', eligibility: 'New members', audience: { label: 'Members who joined in October', count: 86, segments: [['Ordinary members', 61], ['Associate members', 25]] },
    stage: 'creative', channels: ['welcome', 'wa'], fresh: true,
    history: [['2 Nov', 'Membership', 'Created the entry'], ['2 Nov', 'Cheryl Kong', 'Approved the audience (86 new members)']] },
  { id: 'e5', title: 'PW Mark Renewal Window', type: 'promo', dept: 'Membership Department', owner: 'Membership', date: '2026-11-10', time: '9:00 am', rsvpBy: null,
    goal: '300 renewals by 31 Dec', eligibility: 'PW Mark holders', audience: { label: 'PW Mark holders due to renew', count: 412, segments: [['Due in 60 days', 268], ['Already overdue', 144]] },
    stage: 'audience', channels: ['invite', 'wa'], history: [['1 Nov', 'Membership', 'Created the entry'], ['1 Nov', 'Sera', 'Suggested 2 channels']] },
  { id: 'e6', title: 'Budget 2027 Recommendations Survey', type: 'announce', dept: 'Membership Department', owner: 'Membership', date: '2026-11-05', time: '9:00 am', rsvpBy: null,
    goal: '1,000 responses', eligibility: 'All members', audience: { label: 'All members', count: 34160, segments: [['All members', 34160]] },
    stage: 'scheduled', channels: ['invite', 'li'], history: [['26 Oct', 'Membership', 'Created the entry'], ['29 Oct', 'Cheryl Kong', 'Approved the audience'], ['30 Oct', 'Carolina Ng', 'Approved the creative']] },
  { id: 'e7', title: 'SG-WEN Leadership Breakfast', type: 'mice', dept: 'Membership Department', owner: 'Membership', date: '2026-11-25', time: '8:00 am', venue: 'Raffles City Convention Centre', rsvpBy: '2026-11-18',
    goal: '60 attendees', eligibility: 'SG-WEN members only', audience: { label: 'SG-WEN members', count: 310, segments: [['SG-WEN members', 310]] },
    stage: 'draft', channels: [], history: [['3 Nov', 'Membership', 'Created the entry']] },
  { id: 'e8', title: 'Year-End Member Appreciation', type: 'mice', dept: 'Membership Department', owner: 'Membership', date: '2026-12-04', time: '6:30 pm', venue: 'Marina Bay Sands', rsvpBy: '2026-11-27',
    goal: '400 attendees', eligibility: 'All members', audience: { label: 'Active and steady members', count: 2600, segments: [['Active', 1100], ['Steady', 1500]] },
    stage: 'draft', channels: [], history: [['3 Nov', 'Membership', 'Created the entry']] },
  { id: 'e9', title: 'BizSpoke · December Issue', type: 'news', dept: 'Membership Department', owner: 'Membership', date: '2026-12-11', time: '8:00 am', rsvpBy: null,
    goal: '40% open rate', eligibility: 'All members', audience: { label: 'All members', count: 34160, segments: [['All members', 34160]] }, stage: 'draft', channels: [], history: [] },
  { id: 'e10', title: 'SBF at the APEC CEO Summit', type: 'announce', dept: 'Membership Department', owner: 'Membership', date: '2026-11-12', time: '12:00 pm', rsvpBy: null,
    goal: '25,000 LinkedIn impressions', eligibility: 'Public', audience: { label: 'LinkedIn followers (public)', count: 0, segments: [] }, stage: 'scheduled', channels: ['li'], history: [] },
  // past, reviewed by the agent
  { id: 'p1', title: 'Go Global: Vietnam Market Briefing', type: 'mice', dept: 'Membership Department', owner: 'Membership', date: '2026-10-22', time: '9:00 am', rsvpBy: '2026-10-17',
    goal: '100 confirmed seats', eligibility: 'All members', audience: { label: 'Trade and logistics members', count: 1080, segments: [['Logistics & trade', 640], ['Manufacturing', 440]] }, stage: 'review', channels: ['invite', 'wa', 'pre', 'li', 'recap'], history: [] },
  { id: 'p2', title: 'BizSpoke · October Issue', type: 'news', dept: 'Membership Department', owner: 'Membership', date: '2026-10-16', time: '8:00 am', rsvpBy: null,
    goal: '40% open rate', eligibility: 'All members', audience: { label: 'All members', count: 34160, segments: [] }, stage: 'review', channels: ['bizspoke', 'li'], history: [] },
  { id: 'p3', title: 'Welcome to SBF · October Cohort', type: 'onboard', dept: 'Membership Department', owner: 'Membership', date: '2026-10-07', time: '10:00 am', rsvpBy: null,
    goal: 'Every new member opens their welcome pack', eligibility: 'New members', audience: { label: 'Members who joined in September', count: 74, segments: [] }, stage: 'review', channels: ['welcome', 'wa'], history: [] },
  { id: 'p4', title: 'Sustainability Leaders Roundtable', type: 'mice', dept: 'Membership Department', owner: 'Membership', date: '2026-09-30', time: '3:00 pm', rsvpBy: '2026-09-25',
    goal: '40 attendees', eligibility: 'Invite only', audience: { label: 'Sustainability Leaders network', count: 180, segments: [] }, stage: 'review', channels: ['letter', 'pre', 'recap', 'li'], history: [] }
];

// Clash and send-fatigue warnings the agent raises on the calendar
export const WARNINGS = [
  { id: 'w1', week: '2026-11-16', tone: 'warn', text: '312 members would get 4 or more messages in the week of 16 Nov (Indonesia briefing, BizSpoke sponsor slot, PW Mark reminder).', fix: 'Move the PW Mark reminder to 24 Nov' },
  { id: 'w2', week: '2026-11-23', tone: 'info', text: 'SG-WEN breakfast (25 Nov) and Associates Night (27 Nov) both want the homepage banner.', fix: 'Give the banner to Associates Night; feature SG-WEN in BizSpoke' }
];

export const RESULTS = {
  p1: { sent: 1080, opened: 486, clicked: 198, rsvp: 131, attended: 104, goalMet: true,
    channels: [['invite', 'Sent 1,080 · opened 45% · clicked 18%'], ['wa', 'Sent 420 · read 88% · tapped 34%'], ['pre', 'Sent 9,400 · opened 41% · 63 clicks to the event'], ['li', '18,400 impressions · 2.9% engagement'], ['recap', 'Sent 104 · opened 62% · 22 follow-up enquiries']],
    segments: [['Logistics & trade', 64, 12.8], ['Manufacturing', 40, 9.1]],
    worked: ['WhatsApp reminders 3 days out lifted RSVPs by 31 against email alone.', 'Featuring it in the monthly Upcoming Events email brought 63 extra visits to the event page.', 'Members tagged "ASEAN interest" clicked at 2.4 times the rate of everyone else.'],
    change: ['Manufacturing members opened but rarely clicked: lead with plant-expansion case studies, not market statistics.', 'LinkedIn drove reach but only 6 sign-ups: use it for the recap, not the invite.'],
    next: [['Invite the 104 attendees to Go Global: Indonesia first', 'mice'], ['Call the 27 who confirmed but did not attend', 'call'], ['Feature Harbourline in the November BizSpoke', 'news']] },
  p2: { sent: 34160, opened: 13322, clicked: 2050, rsvp: 0, attended: 0, goalMet: false,
    channels: [['bizspoke', 'Sent 34,160 · opened 39% · clicked 6%'], ['li', '24,100 impressions · 2.1% engagement']],
    segments: [['Active', 71, 14.2], ['Steady', 41, 5.9], ['Needs attention', 12, 1.4]],
    worked: ['Grant stories were the most-clicked items (41% of all clicks).', 'Members with a named contact person opened at 46%.'],
    change: ['Open rate missed the 40% goal by a point; subject lines over 60 characters did worst.', 'Members needing attention barely opened (12%): a separate, shorter version for them.'],
    next: [['Split the December issue into two versions by activity', 'news'], ['Lead with grants in the subject line', 'news']] },
  p3: { sent: 74, opened: 66, clicked: 41, rsvp: 0, attended: 0, goalMet: false,
    channels: [['welcome', 'Sent 74 · opened 89% · clicked 55%'], ['wa', 'Sent 30 · read 97%']],
    segments: [['Ordinary', 92, 60], ['Associate', 81, 44]],
    worked: ['WhatsApp welcome was read by almost everyone who opted in.'],
    change: ['8 new members never opened: follow up by phone within a week.', 'Associates clicked less: add a "first 30 days" checklist for them.'],
    next: [['Call the 8 who did not open', 'call'], ['Add the checklist to the November welcome', 'onboard']] },
  p4: { sent: 180, opened: 142, clicked: 77, rsvp: 52, attended: 46, goalMet: true,
    channels: [['letter', 'Sent 180 · opened 79%'], ['pre', 'Sent 2,100 · opened 38% · 14 clicks to the event'], ['recap', 'Sent 46 · 9 story leads'], ['li', '9,800 impressions · 4.2% engagement']],
    segments: [['Invited', 79, 43]],
    worked: ['VIP Invitations from the chair beat the standard Guest Invitation (79% against 52% opens).', 'The recap produced 9 story leads for the Hall of Fame.'],
    change: ['Half the seats went to the same 20 companies: widen the invite list next time.'],
    next: [['Invite Harbourline and Sutera to share their stories', 'story'], ['Add 30 steady members to the next invite list', 'mice']] }
};

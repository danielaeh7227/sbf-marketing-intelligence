// Accounts on the sign-in screen. Each role sees its own home, approvals and Sera prompts.
export const USERS = {
  carolina: { id: 'carolina', name: 'Carolina Ng', first: 'Carolina', ab: 'CN', role: 'mcd', dept: 'Marketing & Communications Department', approves: 'creative' },
  cheryl: { id: 'cheryl', name: 'Cheryl Kong', first: 'Cheryl', ab: 'CK', role: 'md', dept: 'Membership Department', approves: 'audience' }
};

export const ROLE_COPY = {
  mcd: { approve: 'creative', noun: 'creative', owns: 'You decide tone and manner: visuals, copy and channel.' },
  md: { approve: 'audience', noun: 'audience', owns: 'You decide who receives each message.' }
};

export const NOTIFS = [
  ['approve', 'Go Global: Indonesia is waiting for creative sign-off', '2h'],
  ['approve', 'Associates Networking Night is waiting for audience sign-off', '1d'],
  ['alert', '14 Associates are forecast to lapse at the January renewal', '1d'],
  ['alert', 'Kopi Lane F&B: renewal invoice overdue by 21 days', '2d'],
  ['spark', 'Post-mortem ready: Go Global: Vietnam Market Briefing', '3d'],
  ['spark', 'Post-mortem ready: BizSpoke October Issue', '5d'],
  ['plan', 'Membership added SG-WEN Leadership Breakfast to the calendar', '6h'],
  ['plan', 'Membership added Year-End Member Appreciation to the calendar', '6h'],
  ['alert', '312 members would get 4+ messages in the week of 16 Nov', '1d'],
  ['up', 'Harbourline Logistics moved up to Active (score 82)', '4d'],
  ['up', 'Lumen Analytics score rose 11 points this month', '5d']
];

// Sera's prepared answers. In production these come from the model with the member and campaign data as context.
export const SERA = {
  mcd: {
    prompts: ['Show me what needs my sign-off', 'Which channels worked best this quarter?', 'What should we post on LinkedIn this week?'],
    answers: {
      'Show me what needs my sign-off': ['Two entries need your creative sign-off:', '• Go Global: Indonesia Market Briefing, 5 channels for 1,240 members. Cheryl approved the audience on 31 Oct.', '• Welcome to SBF · November Cohort: a Welcome Letter and a WhatsApp Message for 86 new members.', 'Both use approved templates. The Indonesia Guest Invitation has one change from the template: a new segment line for manufacturers.', { go: 'approve', label: 'Open Approvals' }],
      'Which channels worked best this quarter?': ['For events, email plus a WhatsApp reminder 3 days out works best: it lifted RSVPs by 31 at the Vietnam briefing.', 'VIP Invitations beat Guest Invitations for C-suite guests (79% against 52% opens).', 'LinkedIn builds reach (18,400 impressions) but brings few sign-ups. Use it for recaps, not invitations.', { go: 'learn', label: 'See Analytics' }],
      'What should we post on LinkedIn this week?': ['Two suggestions:', '1. The Vietnam briefing recap with Harbourline Logistics. Recaps get 2.9% engagement, above our 2.1% average.', '2. A countdown to the APEC CEO Summit on 12 Nov, already scheduled.', { go: 'create', label: 'Draft the Recap Post' }]
    }
  },
  md: {
    prompts: ['Show me what needs my sign-off', 'Which members need attention this week?', 'How did the October welcome perform?'],
    answers: {
      'Show me what needs my sign-off': ['Two entries need your audience sign-off:', '• Associates Networking Night: all 736 Associates in 3 groups. 196 need attention, and the agent suggests a VIP Invitation for them.', '• PW Mark Renewal Window: 412 holders, 144 already overdue.', { go: 'approve', label: 'Open Approvals' }],
      'Which members need attention this week?': ['{lo} members are in orange on the sphere. Three to act on first:', '• Kopi Lane F&B: renewal invoice overdue by 21 days, but still opening emails.', '• Pinewood Learning Hub: score down 18 points in 60 days, renewal due in January.', '• Meridian Precision: slipping slowly, expanding in Johor.', { go: 'know', label: 'Open Members' }],
      'How did the October welcome perform?': ['89% of the 74 new members opened their Welcome Letter and 55% clicked. WhatsApp was read by 97% of those who opted in.', '8 members never opened. The agent suggests a call within the week, and a "first 30 days" checklist for Associates.', { go: 'learn', label: 'See the Post-Mortem' }]
    }
  }
};

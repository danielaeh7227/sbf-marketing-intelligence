# SBF Marketing Intelligence — prototype

A clickable prototype of the shared marketing workflow between Membership (MD) and Marketing & Communications (MCD). All data is made up. Nothing is sent anywhere.

## Run it

- Quickest: open `sbf-marketing-intelligence.html` (the single-file build) in a browser.
- From source: serve this folder over HTTP (ES modules don't load from `file://`), e.g. `ruby -run -e httpd . -p 8766` or `python3 -m http.server 8766`, then open http://localhost:8766.

Sign in with any `@sbf.org.sg` email and pick an account:

| Account | Role | Signs off |
|---|---|---|
| Cheryl Kong | Membership Department | Audience: who receives each message |
| Carolina Ng | Marketing & Communications Department | Creative: tone, visuals, channel; ad bookings |

Only these two people sign off.

## The workflow

1. **Plan**: shared marketing calendar. Every entry is requested by the Membership Department. Add entries one at a time or in bulk (CSV); clash and send-fatigue warnings. A new entry takes a custom audience: pick any number of member groups and add specific member companies by name, contact or sector.
2. **Create**: Sera suggests channels per entry in three tabs. **Email** has six templates: BizSpoke Newsletter, Upcoming Events (Monthly), Guest Invitation, VIP Invitation, Welcome Letter and Event Recap. **LinkedIn** has a Post and **WhatsApp** a Message. Copy changes per member group and tone, with a live preview. Every message needs a landing page: link an existing SBF page or have Sera draft a custom one (headline, summary, button, optional registration form), previewed beside the message. An entry cannot go for sign-off until every channel has one.
3. **Approve**: two-stage sign-off, showing each message with its landing page. The Membership Department approves the audience, then the Marketing & Communications Department approves the creative. Unchanged approved templates can take the fast track.
4. **Learn**: funnel, channel and segment results per campaign, a Sera post-mortem, and suggestions that go back into the calendar.
5. **Ads** (Marketing & Communications Department only): partner ad bookings with sign-off, an 8-week placement grid where any open week can be booked, and tracking of impressions, clicks, leads and revenue. Member discounts apply automatically. Amounts are in dollars ($).

The title bar holds notifications, Settings and your account, on every screen size. The theme and About this prototype are in Settings. On a phone the floating tab bar has five tabs: Overview, Know, Plan, Approve and Learn for the Membership Department, and Overview, Plan, Approve, Learn and Ads for the Marketing & Communications Department. Create opens from a Plan entry or a member's "Draft a message".

On the home screen, the greeting links straight to the items waiting for your sign-off. Pick Active, Steady or Needs Attention to open that group in a side panel (hovering a dot highlights its row, and hovering a row turns the sphere to that dot), and type to Ask Sera (suggestions appear as you type; Tab accepts the faded completion, / jumps to the box).

**Know** is the single member view: CRM, events, eDM and WhatsApp, website, socials and outside signals, the activity score and next best actions. The home sphere shows every member: bigger and greener means more active, smaller and orange needs attention.

## Pitch deck

`index.html` is the pitch deck, named so it can be served as is from GitHub Pages or any static host. It is a 19-slide dark deck that runs the prototype live inside its slides: four problems, the step that solves each, rollout and next steps, a full-size live prototype, then four appendices. Each slide plays its content in and out in steps on its own. Open it in Chrome or Edge, full screen with F. Use the arrow keys or click the slide edges to move. The deck controls are hidden while presenting; press H to show them. Press N for speaker notes on the slide, or P for a speaker window with a timer. Click inside a live frame to use the app. Move the pointer off the frame and the arrow keys move the deck again. The same notes are in `sbf-marketing-intelligence-speaker-notes.md`.

The deck is one self-contained file. The build packs the app bundle, the two template samples, the logo and the notes into it: `python3 deck-source/build_deck.py <folder>`, run after `bundle.pl`. The folder must hold the bundle and both template files.

Frames pass settings in the frame name, `mi:<query>`. Embedded frames never read or write the saved session and never take keyboard focus. The settings are:
- `as=cheryl|carolina` signs in as that role.
- `theme=light|dark` sets the theme.
- `open=band:lo|band:mid|band:hi|sera` opens a panel.
- `ask=<question>` sends a question to Sera.
- `morph` plays the wave-to-sphere sign-in transition.
- `bare` hides the sign-in page's own logo and footer.

## Code map

- `src/lib/dotfield.js`: canvas wave-to-sphere engine. Framework-free, so it ports to React as is.
- `src/lib/constellation.js`: the linked dots behind the home screen. They orbit the sphere and now and then link into a member dot on its near face.
- `src/lib/store.js`, `router.js`: state, actions and hash routes.
- `src/data/`: mock members, calendar, channels and copy, users and Sera answers, and partner ads.
- `src/pages/`, `src/components/`: one file per screen, plus shared UI.
- `styles/`: tokens (dark default, light theme), base, login, shell, pages, and spacing (one 4px scale for page gutters, gaps between cards, card padding, tabs and separators, loaded last).
- `bundle.pl`: builds the single file, `perl bundle.pl . out.html`. It needs single-line relative imports and unique top-level names across modules.

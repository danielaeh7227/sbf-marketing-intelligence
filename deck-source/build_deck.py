#!/usr/bin/env python3
"""Build the standalone pitch deck and the speaker script.

usage: build_deck.py <out_dir>
Expects in out_dir: sbf-marketing-intelligence.html (app bundle), sbf-edm-go-global.html, sbf-bizspoke-newsletter.html.
Writes: index.html, sbf-marketing-intelligence-speaker-notes.md
"""
import base64, json, os, sys

here = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[1]
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()

embed = {name: b64(os.path.join(out, name)) for name in
         ['sbf-marketing-intelligence.html', 'sbf-edm-go-global.html', 'sbf-bizspoke-newsletter.html']}
# the app source sits beside this folder as mi/ while building, or as source/ in the package
logo = next(p for p in (os.path.join(here, '..', d, 'assets', 'sbf-logo-white.png') for d in ('mi', 'source')) if os.path.exists(p))
embed['logo-white'] = b64(logo)
notes = json.load(open(os.path.join(here, 'notes.json')))

deck = open(os.path.join(here, 'deck.html')).read()
n_slides = deck.count('<section class="s')
assert n_slides == len(notes), f'{n_slides} slides but {len(notes)} notes'
inject = '<script>window.__EMBED=' + json.dumps(embed) + ';window.__NOTES=' + json.dumps(notes, ensure_ascii=False).replace('</', '<\\/') + ';</script>\n'
marker = '<script>\n/* Icons'
assert marker in deck
deck = deck.replace(marker, inject + marker, 1)
open(os.path.join(out, 'index.html'), 'w').write(deck)

total = sum(n.get('min', 0) for n in notes)
md = ['# Marketing Intelligence pitch: speaker notes', '',
      f'About {total:g} minutes across {len(notes)} slides. In the deck, press N to show these notes on the slide, or P to open a speaker window with a timer.', '']
for i, n in enumerate(notes, 1):
    md += [f'## {i}. {n["t"]} (about {n["min"]:g} min)', ''] + [p + '\n' for p in n['say']]
    if n.get('do'):
        md += [f'*{n["do"]}*', '']
open(os.path.join(out, 'sbf-marketing-intelligence-speaker-notes.md'), 'w').write('\n'.join(md))
print(f'{n_slides} slides, {total:g} min, deck {os.path.getsize(os.path.join(out, "index.html")) // 1024} KB')

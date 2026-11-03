import { html } from '../lib/html.js';

// SBF logo (white on dark, colour on light) and the Marketing Intelligence wordmark
export const SbfLogo = ({ white, h = 36 }) =>
  html`<img class="sbf-logo" src=${white ? 'assets/sbf-logo-white.png' : 'assets/sbf-logo.png'} alt="SBF" style=${'height:' + h + 'px'}/>`;

// Product name set as a wordmark beside the SBF logo, as in the earlier Member Intelligence prototype
// The product wordmark sits beside the SBF logo on two lines, with nothing beneath it
export const MiWordmark = () => html`<span class="mi-word"><b>Marketing</b><b>Intelligence</b></span>`;

export const MsLogo = ({ size = 18 }) => html`<svg width=${size} height=${size} viewBox="0 0 21 21" aria-hidden="true">
  <rect width="10" height="10" fill="#F25022"/><rect x="11" width="10" height="10" fill="#7FBA00"/><rect y="11" width="10" height="10" fill="#00A4EF"/><rect x="11" y="11" width="10" height="10" fill="#FFB900"/></svg>`;

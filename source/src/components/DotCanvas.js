import { html, useRef, useEffect } from '../lib/html.js';
import { DotField } from '../lib/dotfield.js';

// Preact wrapper for DotField. `field` hands the instance to the parent (for morph and focus).
export function DotCanvas({ points, shape, scale, sea, onHover, onPick, field, cls = '' }) {
  const ref = useRef(), cb = useRef({});
  cb.current = { onHover, onPick };
  useEffect(() => {
    const f = new DotField(ref.current, { points, shape, scale, sea, onHover: h => cb.current.onHover?.(h), onPick: d => cb.current.onPick?.(d) });
    field && field(f);
    return () => f.destroy();
  }, []);
  return html`<canvas ref=${ref} class=${'dots ' + cls} aria-hidden="true"></canvas>`;
}

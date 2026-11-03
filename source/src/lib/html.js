// The only third-party import. Preact + hooks + htm (JSX-like tagged templates, no build step).
// The import map in index.html resolves 'preact-htm'. Porting to React: replace html`` with JSX and these hooks with React's.
export { html, render, useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from 'preact-htm';

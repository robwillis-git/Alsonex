/**
 * MoleculeViewer — interactive 3D molecular viewer (3Dmol.js).
 *
 * Renders a ball-and-stick model from an SDF file with gentle auto-spin,
 * drag-to-rotate and scroll/pinch zoom (3Dmol's default controls).
 *
 * 3Dmol.js is a sizeable library, so it is NOT bundled site-wide: this island
 * injects the CDN build on demand. Mount it with `client:visible` so neither the
 * script nor the SDF is fetched until the viewer scrolls into view, keeping it
 * scoped to the Technology page.
 *
 * Fallback: a 2D structural diagram (PNG) is shown by default — this is what SSR
 * emits and what renders pre-hydration, with JS disabled, or if 3Dmol fails to
 * load / the SDF fetch fails / WebGL is unavailable. Only once the interactive
 * viewer is confirmed running do we reveal the canvas and the caption, hiding the
 * fallback image. So the slot always holds exactly one thing, in the same place.
 */
import { useEffect, useRef, useState } from 'react';

// Pinned CDN build — keep page-scoped (loaded on demand, not in the global bundle).
const DMOL_SRC = 'https://cdn.jsdelivr.net/npm/3dmol@2.5.5/build/3Dmol-min.js';

interface Props {
  /** SDF/MOL file with 3D coordinates */
  src?: string;
  /** 2D PNG shown if the 3D viewer cannot load */
  fallbackSrc?: string;
  /** accessible label / fallback alt text */
  label?: string;
  /** short hint shown beneath the viewer */
  caption?: string;
}

// Load the 3Dmol CDN script once; resolve with the global $3Dmol.
let dmolPromise: Promise<unknown> | null = null;
function loadDmol(): Promise<unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (w.$3Dmol) return Promise.resolve(w.$3Dmol);
  if (dmolPromise) return dmolPromise;
  dmolPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = DMOL_SRC;
    s.async = true;
    s.onload = () => (w.$3Dmol ? resolve(w.$3Dmol) : reject(new Error('3Dmol global missing')));
    s.onerror = () => reject(new Error('Failed to load 3Dmol'));
    document.head.appendChild(s);
  });
  return dmolPromise;
}

export default function MoleculeViewer({
  src = '/assets/als-205-3d.sdf',
  fallbackSrc = '/assets/als-205-2d.png',
  label = 'Interactive 3D model of the ALS-205 molecule',
  caption = 'click to rotate, scroll to zoom',
}: Props) {
  // The element 3Dmol owns. React renders NO children into it, so 3Dmol's
  // canvas can never collide with React reconciliation.
  const hostRef = useRef<HTMLDivElement>(null);
  // `ready` flips true only once the interactive viewer is confirmed running.
  // Until then (SSR, pre-hydration, JS off, or load failure) we show the
  // fallback image overlay and no caption.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let viewer: any = null;

    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [$3Dmol, sdf] = await Promise.all([
          loadDmol() as Promise<any>,
          fetch(src).then((r) => {
            if (!r.ok) throw new Error(`SDF fetch failed: ${r.status}`);
            return r.text();
          }),
        ]);
        if (cancelled || !hostRef.current) return;

        viewer = $3Dmol.createViewer(hostRef.current, { backgroundColor: 'white' });
        viewer.addModel(sdf, 'sdf');
        // Ball-and-stick, standard CPK colours.
        viewer.setStyle({}, { stick: { radius: 0.12 }, sphere: { scale: 0.25 } });
        viewer.zoomTo();
        viewer.render();
        viewer.spin('y', 0.5); // gentle continuous rotation
        if (!cancelled) setReady(true); // reveal canvas + caption, hide fallback
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[MoleculeViewer] keeping 2D fallback diagram:', err);
        // Leave `ready` false → fallback image stays visible, no caption.
      }
    })();

    return () => {
      cancelled = true;
      try {
        viewer?.spin?.(false);
        viewer?.clear?.();
      } catch {
        /* noop */
      }
    };
  }, [src]);

  // One slot, one thing at a time:
  //  - `molviewer__host` is the 3Dmol-owned canvas host (always mounted so
  //    its ref is stable; empty until the viewer renders into it).
  //  - The fallback <img> is an absolutely-positioned overlay covering the box.
  //    It is the only visible content until `ready`, then it is hidden.
  //  - The caption renders only when `ready` (interactive viewer running).
  return (
    <div className="molviewer">
      <div className="molviewer__box" role="img" aria-label={label}>
        <div
          ref={hostRef}
          className="molviewer__host"
          aria-hidden="true"
          // 3Dmol positions its canvas absolutely within this host.
          style={{ position: 'relative', width: '100%', height: '100%' }}
        />
        {!ready && (
          <img className="molviewer__fallback" src={fallbackSrc} alt={label} aria-hidden="true" />
        )}
      </div>
      {ready && <p className="molviewer__hint">{caption}</p>}
    </div>
  );
}

import { useEffect, useRef } from "react";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import countriesTopo from "world-atlas/countries-110m.json";
import { useIsDark } from "./harness";

export interface GlobePoint {
  lat: number;
  lon: number;
  color: string;
  /** Workers get a larger, pulsing marker; watchers a smaller steady dot. */
  kind: "worker" | "watcher";
}

const TILT = (-18 * Math.PI) / 180; // axial tilt so it reads as a globe, not a disc
const DEG = Math.PI / 180;

// Low-res country borders (world-atlas 110m), flattened once into rings of
// [lon, lat] pairs. Drawn as faint outlines on the sphere so continents read.
const COUNTRY_RINGS: [number, number][][] = (() => {
  const topo = countriesTopo as unknown as Topology;
  const fc = feature(topo, topo.objects.countries) as unknown as {
    features: Feature<Geometry, GeoJsonProperties>[];
  };
  const rings: [number, number][][] = [];
  for (const f of fc.features) {
    const g = f.geometry;
    if (!g) continue;
    const polys =
      g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
    for (const poly of polys) for (const ring of poly) rings.push(ring as [number, number][]);
  }
  return rings;
})();

/** Project a lat/lon (with a spin offset) to screen space + a visibility flag. */
function project(lat: number, lon: number, spin: number, cx: number, cy: number, r: number) {
  const phi = lat * DEG;
  const lambda = (lon + spin) * DEG;
  const x = Math.cos(phi) * Math.sin(lambda);
  let y = Math.sin(phi);
  let z = Math.cos(phi) * Math.cos(lambda);
  // Tilt around the X axis.
  const ct = Math.cos(TILT);
  const st = Math.sin(TILT);
  const y2 = y * ct - z * st;
  const z2 = y * st + z * ct;
  y = y2;
  z = z2;
  return { x: cx + x * r, y: cy - y * r, z, front: z > 0 };
}

/**
 * A lightweight, dependency-free rotating globe (canvas 2D, orthographic).
 * Draws a faint graticule sphere with an atmosphere glow and plots glowing
 * markers for connected workers and watchers — the fleet, worldwide. Drag to
 * spin; releases back to a slow auto-rotate.
 */
export function FleetGlobe({ points }: { points: GlobePoint[] }) {
  const dark = useIsDark();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pointsRef = useRef(points);
  pointsRef.current = points;
  const darkRef = useRef(dark);
  darkRef.current = dark;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let spin = 20; // degrees; auto-advances
    let autoSpin = true;
    let dragging = false;
    let lastX = 0;
    let size = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      size = Math.max(120, Math.min(w, h));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const draw = (t: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const r = (size * dpr) / 2 - 10 * dpr;
      const isDark = darkRef.current;

      const sphereFill = isDark ? "rgba(14,165,233,0.06)" : "rgba(2,132,199,0.05)";
      const grat = isDark ? "rgba(148,163,184,0.10)" : "rgba(71,85,105,0.08)";
      const land = isDark ? "rgba(148,197,224,0.42)" : "rgba(51,90,120,0.42)";
      const rim = isDark ? "rgba(14,165,233,0.5)" : "rgba(2,132,199,0.35)";

      // Atmosphere glow.
      const glow = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r * 1.25);
      glow.addColorStop(0, isDark ? "rgba(14,165,233,0.18)" : "rgba(2,132,199,0.12)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Sphere body + rim.
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = sphereFill;
      ctx.fill();
      ctx.lineWidth = 1 * dpr;
      ctx.strokeStyle = rim;
      ctx.stroke();

      if (autoSpin) spin = (spin + 0.12) % 360;

      // Faint graticule for depth (equator + a few meridians), front hemisphere.
      ctx.strokeStyle = grat;
      ctx.lineWidth = 1 * dpr;
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -85; lat <= 85; lat += 6) {
          const p = project(lat, lon, spin, cx, cy, r);
          if (!p.front) { started = false; continue; }
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 6) {
          const p = project(lat, lon, spin, cx, cy, r);
          if (!p.front) { started = false; continue; }
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Country outlines — the continents, front hemisphere only.
      ctx.strokeStyle = land;
      ctx.lineWidth = 1 * dpr;
      ctx.lineJoin = "round";
      for (const ring of COUNTRY_RINGS) {
        ctx.beginPath();
        let started = false;
        for (let k = 0; k < ring.length; k++) {
          const p = project(ring[k][1], ring[k][0], spin, cx, cy, r);
          if (!p.front) { started = false; continue; }
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Markers.
      const pulse = 0.5 + 0.5 * Math.sin(t / 500);
      for (const pt of pointsRef.current) {
        const p = project(pt.lat, pt.lon, spin, cx, cy, r);
        if (!p.front) continue;
        const base = (pt.kind === "worker" ? 3.2 : 2.2) * dpr;
        // Soft halo.
        ctx.beginPath();
        ctx.arc(p.x, p.y, base * (pt.kind === "worker" ? 3.2 : 2.4), 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = 0.14 * p.z;
        ctx.fill();
        // Pulsing ring for workers.
        if (pt.kind === "worker") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, base * (1.6 + pulse * 1.4), 0, Math.PI * 2);
          ctx.strokeStyle = pt.color;
          ctx.globalAlpha = (0.5 - pulse * 0.4) * p.z;
          ctx.lineWidth = 1 * dpr;
          ctx.stroke();
        }
        // Core dot.
        ctx.beginPath();
        ctx.arc(p.x, p.y, base, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.min(1, 0.55 + p.z * 0.45);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onDown = (e: PointerEvent) => {
      dragging = true;
      autoSpin = false;
      lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      spin = (spin + (e.clientX - lastX) * 0.4) % 360;
      lastX = e.clientX;
    };
    const onUp = () => {
      dragging = false;
      // Resume auto-spin shortly after release.
      window.setTimeout(() => { if (!dragging) autoSpin = true; }, 1500);
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full cursor-grab touch-none active:cursor-grabbing" />
    </div>
  );
}

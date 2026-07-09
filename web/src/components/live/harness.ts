/**
 * Chart colors for the live fleet views. Harness identity is categorical:
 * fixed slot order (claude -> codex -> hermes -> other), never cycled.
 * Both palettes were validated with the dataviz six-checks script against the
 * card surfaces (#FFFFFF light, #1f1c1a dark): lightness band, chroma floor,
 * adjacent-pair CVD separation, and >=3:1 contrast all pass.
 */
import { useEffect, useState } from "react";

const LIGHT: Record<string, string> = {
  claude: "#0284C7",
  codex: "#C2410C",
  hermes: "#7C3AED",
};
const DARK: Record<string, string> = {
  claude: "#0294D8",
  codex: "#EA580C",
  hermes: "#8B5CF6",
};
// Anything beyond the three known harnesses folds into neutral, per the
// fixed-order rule (a 4th series is never a generated hue).
const OTHER_LIGHT = "#57534E";
const OTHER_DARK = "#A8A29E";

export function harnessColor(harness: string, dark: boolean): string {
  const palette = dark ? DARK : LIGHT;
  return palette[harness] ?? (dark ? OTHER_DARK : OTHER_LIGHT);
}

/** Known harnesses in the fixed display order; unknown ones append after. */
export function harnessOrder(present: string[]): string[] {
  const known = ["claude", "codex", "hermes"].filter((h) => present.includes(h));
  const unknown = present.filter((h) => !["claude", "codex", "hermes"].includes(h)).sort();
  return [...known, ...unknown];
}

/** Tracks the site theme (the `dark` class on <html>) so SVG charts re-color
 *  when the user toggles it. */
export function useIsDark(): boolean {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

// WCAG 2.x contrast check for the Shimu Atlas design tokens.
// Reads the same token file the app uses, so docs and code cannot drift.
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8");

function block(selector) {
  const m = css.match(new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{([^}]*)\\}"));
  if (!m) throw new Error("missing block " + selector);
  return Object.fromEntries([...m[1].matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((x) => [x[1], x[2]]));
}

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground, background, minimum ratio, what it is]
const pairs = [
  ["text", "bg", 4.5, "body text on page"],
  ["text", "surface", 4.5, "body text on card"],
  ["text-muted", "bg", 4.5, "secondary text on page"],
  ["text-muted", "surface", 4.5, "secondary text on card"],
  ["text-muted", "surface-2", 4.5, "secondary text on raised surface"],
  ["text-muted", "sidebar", 4.5, "secondary text on sidebar"],
  ["accent-text", "bg", 4.5, "links / accent text on page"],
  ["accent-text", "surface", 4.5, "links / accent text on card"],
  ["on-accent", "accent", 4.5, "label on primary button"],
  ["text", "sidebar", 4.5, "body text on sidebar"],
  ["accent-text", "sidebar", 4.5, "active nav text on sidebar"],
  ["accent-text", "surface-2", 4.5, "accent text on raised surface"],
  ["heading", "bg", 3, "page heading (large text)"],
  ["heading", "sidebar", 3, "heading on sidebar (large text)"],
  ["danger", "bg", 4.5, "error text on page"],
  ["danger", "surface", 4.5, "error text on card"],
  ["reading-text", "reading-bg", 7, "book reading surface"],
  ["focus", "bg", 3, "focus ring on page"],
  ["focus", "surface", 3, "focus ring on card"],
  ["border-strong", "bg", 3, "input / control boundary"],
];

let failed = 0;
for (const theme of [":root", '[data-theme="dark"]']) {
  const t = block(theme);
  console.log(`\n${theme}`);
  for (const [fg, bg, min, label] of pairs) {
    const r = ratio(t[fg], t[bg]);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(5)} (min ${min})  ${label}  [${fg} ${t[fg]} on ${bg} ${t[bg]}]`);
  }
}
if (failed) { console.error(`\n${failed} contrast check(s) failed`); process.exit(1); }
console.log("\nAll contrast checks passed");

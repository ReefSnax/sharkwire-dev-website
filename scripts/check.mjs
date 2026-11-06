#!/usr/bin/env node
// Dependency-free structural validation for the static site.
// Uses only Node built-ins: no HTML/CSS parser dependency.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

let failures = 0;
let passes = 0;

function fail(message) {
  failures += 1;
  console.error(`✗ ${message}`);
}

function pass(message) {
  passes += 1;
  console.log(`✓ ${message}`);
}

function check(condition, message) {
  if (condition) {
    pass(message);
  } else {
    fail(message);
  }
}

function read(file) {
  return readFileSync(path.join(rootDir, file), "utf8");
}

// ---------- required files exist ----------

const requiredFiles = [
  "index.html",
  "styles.css",
  "favicon.svg",
  "robots.txt",
  "_headers",
  "README.md",
  "LICENSE",
  ".gitignore",
  "package.json",
];

for (const file of requiredFiles) {
  check(existsSync(path.join(rootDir, file)), `root file exists: ${file}`);
}

// ---------- HTML structural checks ----------

const html = read("index.html");

check(/^<!doctype html>/i.test(html.trim()), "index.html starts with <!doctype html>");
check(/<html[^>]*\blang="en"/i.test(html), "index.html <html> has lang attribute");
check(/<link[^>]*rel="canonical"[^>]*href="https:\/\/sharkwire\.dev\/"/.test(html), "canonical URL is https://sharkwire.dev/");
check(/<title>[^<]*SharkWire[^<]*<\/title>/.test(html), "title mentions SharkWire");
check(/<meta name="description" content="[^"]+"/.test(html), "meta description present");
check(/<meta property="og:title"/.test(html), "Open Graph title present");
check(/<meta property="og:description"/.test(html), "Open Graph description present");
check(/<meta property="og:url" content="https:\/\/sharkwire\.dev\/"/.test(html), "Open Graph url present");
check(/<link rel="icon" href="\/favicon\.svg"/.test(html), "favicon link present");
check(/<link rel="stylesheet" href="\/styles\.css">/.test(html), "styles.css linked");

check(
  html.includes("<h1 class=\"hero__headline\">Tools and Projects by Snaxine Reefica</h1>"),
  "hero headline matches approved copy exactly"
);
check(
  html.includes("SharkWire is the technical home for projects, services, releases, and experiments."),
  "supporting line matches approved copy exactly"
);
check(html.includes("Built by Snaxine Reefica."), "footer credits Snaxine Reefica");
check(html.includes(">SharkWire</span>"), "header wordmark renders as SharkWire");
check(/<svg[^>]*class="brand__mark"/.test(html), "inline Cable Shark mark present in header");

// balanced-tag structural check (naive stack matcher, not a full parser)
function checkBalancedTags(source, label) {
  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?(\/?)>/g;
  const voidTags = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "circle", "path",
  ]);
  const stack = [];
  let match;
  while ((match = tagPattern.exec(source)) !== null) {
    const [full, name, selfClose] = match;
    const lower = name.toLowerCase();
    if (voidTags.has(lower) || selfClose === "/") continue;
    if (full.startsWith("</")) {
      const top = stack.pop();
      if (top !== lower) {
        fail(`${label}: tag mismatch, expected </${top}> but found </${lower}>`);
        return;
      }
    } else {
      stack.push(lower);
    }
  }
  check(stack.length === 0, `${label}: all tags balanced`);
}

checkBalancedTags(html, "index.html");

// ---------- CSS structural checks ----------

const css = read("styles.css");
const openBraces = (css.match(/{/g) || []).length;
const closeBraces = (css.match(/}/g) || []).length;
check(openBraces === closeBraces && openBraces > 0, "styles.css braces are balanced");

const requiredColors = ["#07131D", "#0B2230", "#164052", "#E6F7FA", "#9FC0C9", "#21D4FD", "#67E8F9"];
for (const color of requiredColors) {
  check(css.includes(color), `styles.css defines palette color ${color}`);
}

check(css.includes("prefers-reduced-motion"), "styles.css respects prefers-reduced-motion");
check(css.includes("focus-visible"), "styles.css defines keyboard focus styles");
check(/Space Grotesk/.test(css) && /Inter/.test(css), "styles.css references Space Grotesk and Inter");

// ---------- SVG structural checks ----------

const favicon = read("favicon.svg");
check(/^<svg/.test(favicon.trim()), "favicon.svg root element is <svg>");
check(/viewBox="[^"]+"/.test(favicon), "favicon.svg has a viewBox");
checkBalancedTags(favicon, "favicon.svg");

// ---------- brand-brief guardrails ----------

const combinedLower = (html + css).toLowerCase();
const bannedPhrases = [
  "coming soon",
  "testimonial",
  "lorem ipsum",
  "cartoon",
  "mascot",
];
for (const phrase of bannedPhrases) {
  check(!combinedLower.includes(phrase), `no banned phrase "${phrase}" present`);
}

// SHARKWIRE all-caps reserved for small technical labels, not the primary wordmark usage
check(!/<h1[^>]*>\s*SHARKWIRE/.test(html), "SHARKWIRE all-caps not used as the primary hero wordmark");

// ---------- robots / headers sanity ----------

const robots = read("robots.txt");
check(/User-agent:\s*\*/.test(robots), "robots.txt defines a user-agent rule");
check(/Allow:\s*\//.test(robots), "robots.txt allows crawling");

const headers = read("_headers");
check(headers.trim().length > 0, "_headers is non-empty");
check(/Content-Security-Policy/.test(headers), "_headers sets a Content-Security-Policy");

// ---------- package.json sanity ----------

const pkg = JSON.parse(read("package.json"));
check(pkg.scripts && pkg.scripts.check === "node scripts/check.mjs", "package.json defines check script");
check(pkg.scripts && pkg.scripts.build === "node scripts/build.mjs", "package.json defines build script");

console.log(`\n${passes} passed, ${failures} failed`);
if (failures > 0) {
  process.exit(1);
}

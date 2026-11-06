#!/usr/bin/env node
// Dependency-free static build: copies the public site files into dist/.
import { cpSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(rootDir, "dist");

const SITE_FILES = [
  "index.html",
  "styles.css",
  "favicon.svg",
  "robots.txt",
  "_headers",
];

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

for (const file of SITE_FILES) {
  const src = path.join(rootDir, file);
  if (!existsSync(src)) {
    throw new Error(`Missing expected site file: ${file}`);
  }
  cpSync(src, path.join(distDir, file));
  console.log(`copied ${file}`);
}

console.log(`\nbuild complete -> ${path.relative(rootDir, distDir)}/`);

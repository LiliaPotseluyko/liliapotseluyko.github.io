/**
 * Portfolio Health & Asset Integrity Checker
 * Run with: node scripts/audit_assets.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT_DIR, 'images');

console.log("=========================================");
console.log("   PORTFOLIO HEALTH & ASSET AUDITOR      ");
console.log("=========================================\n");

// 1. Scan images directory
const allImages = new Set();
if (fs.existsSync(IMAGES_DIR)) {
  fs.readdirSync(IMAGES_DIR).forEach(file => {
    allImages.add(file);
  });
}
console.log(`[Asset Curator] Found ${allImages.size} media assets in /images`);

// 2. Scan all HTML files
function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'nodeSync' && file !== 'node_modules' && file !== '.git') {
        results = results.concat(getHtmlFiles(fullPath));
      }
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  });
  return results;
}

const htmlFiles = getHtmlFiles(ROOT_DIR);
console.log(`[Information Architect] Found ${htmlFiles.length} HTML files across the portfolio\n`);

let brokenImageCount = 0;
const referencedImages = new Set();

htmlFiles.forEach(htmlPath => {
  const content = fs.readFileSync(htmlPath, 'utf8');
  const relPath = path.relative(ROOT_DIR, htmlPath);
  
  // Find all image references: src="images/..." or src="../images/..."
  const regex = /src=["'](?:\.\.\/)?images\/([^"']+)["']/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const imageName = match[1];
    referencedImages.add(imageName);
    
    if (!allImages.has(imageName)) {
      console.warn(`[!] MISSING ASSET in ${relPath}: "images/${imageName}" not found!`);
      brokenImageCount++;
    }
  }
});

if (brokenImageCount === 0) {
  console.log("✅ [Asset Integrity] All image references across all HTML files exist!");
} else {
  console.log(`⚠️ [Asset Integrity] Found ${brokenImageCount} missing image reference(s).`);
}

console.log(`[Asset Curator] ${referencedImages.size} of ${allImages.size} media files are actively referenced on live pages.`);
console.log("\n=========================================");
console.log("   AUDIT COMPLETE                        ");
console.log("=========================================");

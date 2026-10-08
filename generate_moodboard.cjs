const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse CLI args
const args = process.argv.slice(2);
function getArg(flag, defaultValue) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1];
  }
  return defaultValue;
}

const artifactsDir = path.resolve('projects/images/image_artefacts');
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

const inputFolder = path.resolve(getArg('--folder', './moodboard_input'));
const outputHtml = path.resolve(getArg('--html', path.join(artifactsDir, 'moodboard.html')));
const outputImage = path.resolve(getArg('--output', path.join(artifactsDir, 'ux_moodboard_screenshot.png')));
const title = getArg('--title', 'FIELD INFRASTRUCTURE & DISPATCH UX MOOD BOARD');
const subtitle = getArg('--subtitle', 'Subcontractor Workflow · Defect Inspection · Field Usability & Spatial Mapping');

console.log(`Scanning image directory: ${inputFolder}`);

if (!fs.existsSync(inputFolder)) {
  console.error(`Error: Folder not found: ${inputFolder}`);
  process.exit(1);
}

const validExts = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
const files = fs.readdirSync(inputFolder).filter(f => validExts.includes(path.extname(f).toLowerCase()));

if (files.length === 0) {
  console.error(`No images found in ${inputFolder}`);
  process.exit(1);
}

console.log(`Found ${files.length} images:`, files);

// Read images as base64 data URLs for standalone zero-dependency rendering
const imageDataList = files.map((file, idx) => {
  const filePath = path.join(inputFolder, file);
  const ext = path.extname(file).toLowerCase().replace('.', '');
  const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  const base64 = fs.readFileSync(filePath).toString('base64');
  
  // Infer nice human titles
  const cleanName = path.parse(file).name.replace(/^[0-9]+[_-]?/, '').replace(/[_-]/g, ' ');
  const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

  return {
    filename: file,
    title: formattedTitle,
    dataUrl: `data:${mime};base64,${base64}`,
    index: idx + 1
  };
});

// Color palette extracted from the UX designs
const palette = [
  { name: 'Primary Action', hex: '#0288D1', desc: 'Accept / Submit CTAs' },
  { name: 'Critical Severity', hex: '#E53935', desc: 'Urgent Crack / Pothole Alerts' },
  { name: 'Warning / High', hex: '#FB8C00', desc: 'High Priority Badges' },
  { name: 'Field Active', hex: '#43A047', desc: 'Availability & Ongoing Status' },
  { name: 'Navigation Slate', hex: '#37474F', desc: 'Tab Bar & Header Surfaces' },
  { name: 'Surface Pure', hex: '#FFFFFF', desc: 'Card Backgrounds & Floating Sheets' },
  { name: 'Canvas Mist', hex: '#F1F5F9', desc: 'App Base Background' }
];

// Heuristics & UX insights
const uxPillars = [
  {
    title: 'High-Visibility Field Legibility',
    desc: 'Contrasted tactile buttons (Submit / Revert) designed for outdoor daylight and gloved finger taps.',
    tag: 'Field Usability'
  },
  {
    title: 'Dual GIS & Visual Telemetry',
    desc: 'Split-view synchronizing GPS coordinates with road surface macro-imagery for indisputable repair verification.',
    tag: 'Telemetry'
  },
  {
    title: 'Subcontractor Autonomy Flow',
    desc: 'Linear day management: Instant to-do triage, hourly availability sliders, and transparent unit pricing.',
    tag: 'Workflow'
  },
  {
    title: 'Figma Iteration & Architecture',
    desc: 'Evolution from tactile notebook wireframes (Frame 132) to structured component tokens and design screens.',
    tag: 'Design System'
  }
];

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: #0b0f19;
      background-image: 
        radial-gradient(at 0% 0%, rgba(2, 136, 209, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(229, 57, 53, 0.12) 0px, transparent 50%),
        radial-gradient(at 50% 100%, rgba(67, 160, 71, 0.10) 0px, transparent 50%),
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 100% 100%, 48px 48px, 48px 48px;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #f8fafc;
      width: 2560px;
      min-height: 1600px;
      padding: 56px 64px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 36px;
    }

    /* HEADER */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-bottom: 28px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }

    .badge-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(2, 136, 209, 0.2);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.4);
    }

    .badge-sub {
      font-size: 13px;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .badge-sub::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4ade80;
      box-shadow: 0 0 10px #4ade80;
    }

    h1 {
      font-size: 42px;
      font-weight: 800;
      letter-spacing: -1px;
      background: linear-gradient(135deg, #ffffff 30%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.15;
    }

    p.subtitle {
      font-size: 19px;
      color: #94a3b8;
      margin-top: 8px;
      font-weight: 500;
    }

    .meta-box {
      display: flex;
      gap: 20px;
    }

    .meta-item {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 12px 20px;
      backdrop-filter: blur(8px);
      text-align: right;
    }

    .meta-item span {
      display: block;
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-family: 'JetBrains Mono', monospace;
    }

    .meta-item strong {
      font-size: 15px;
      color: #f1f5f9;
      font-weight: 600;
    }

    /* MAIN MOODBOARD CONTENT GRID */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: auto auto;
      gap: 32px;
      flex: 1;
    }

    /* CARD STYLES */
    .card {
      background: rgba(18, 24, 38, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 24px;
      backdrop-filter: blur(16px);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .card-header .tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.06);
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-weight: 600;
    }

    .card-title {
      font-size: 18px;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: -0.3px;
    }

    .image-container {
      flex: 1;
      background: #060911;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 10px;
    }

    .image-container img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
      filter: drop-shadow(0 12px 24px rgba(0,0,0,0.5));
      transition: transform 0.3s ease;
    }

    .card-desc {
      margin-top: 14px;
      font-size: 13.5px;
      color: #94a3b8;
      line-height: 1.5;
    }

    /* SPECIAL CARD SPANS */
    .card-large {
      grid-column: span 2;
    }

    .card-tall {
      grid-row: span 2;
    }

    /* PALETTE & DESIGN SYSTEM BAR */
    .bottom-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 32px;
      margin-top: 4px;
    }

    .palette-card {
      background: rgba(18, 24, 38, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 24px 28px;
      backdrop-filter: blur(16px);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .palette-title {
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94a3b8;
      font-family: 'JetBrains Mono', monospace;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .swatches {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 14px;
    }

    .swatch {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .swatch-color {
      height: 52px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: inset 0 2px 4px rgba(255,255,255,0.2), 0 4px 10px rgba(0,0,0,0.3);
    }

    .swatch-name {
      font-size: 12px;
      font-weight: 600;
      color: #f1f5f9;
    }

    .swatch-hex {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #64748b;
    }

    /* HEURISTICS / STICKY NOTES */
    .notes-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .sticky-note {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-left: 4px solid #0288D1;
      border-radius: 12px;
      padding: 14px 16px;
    }

    .sticky-note:nth-child(2) { border-left-color: #E53935; }
    .sticky-note:nth-child(3) { border-left-color: #43A047; }
    .sticky-note:nth-child(4) { border-left-color: #FB8C00; }

    .sticky-note h4 {
      font-size: 13.5px;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
    }

    .sticky-note p {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.45;
    }

    .sticky-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #64748b;
    }

    /* DIGITAL PIN BADGE */
    .pin {
      position: absolute;
      top: 18px;
      right: 18px;
      width: 12px;
      height: 12px;
      background: #e11d48;
      border-radius: 50%;
      box-shadow: 0 0 10px #e11d48, inset 0 2px 2px #fff;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <header class="header">
    <div>
      <div class="badge-row">
        <span class="badge">UX Design Mood Board</span>
        <span class="badge-sub">Highways & Infrastructure Operational Suite</span>
      </div>
      <h1>${title}</h1>
      <p class="subtitle">${subtitle}</p>
    </div>
    <div class="meta-box">
      <div class="meta-item">
        <span>Curated Assets</span>
        <strong>${files.length} High-Res Screens</strong>
      </div>
      <div class="meta-item">
        <span>Target User</span>
        <strong>Field Subcontractors</strong>
      </div>
      <div class="meta-item">
        <span>Primary Platform</span>
        <strong>iOS / Android Tactical UI</strong>
      </div>
    </div>
  </header>

  <!-- CONTENT GRID -->
  <main class="content-grid">

    <!-- Card 1: Perspective Hero (Tilted Mockup) -->
    <div class="card">
      <div class="pin"></div>
      <div class="card-header">
        <h3 class="card-title">01 · Tactical Overview & Dispatch</h3>
        <span class="tag">Hero Mockup</span>
      </div>
      <div class="image-container" style="max-height: 480px;">
        <img src="${imageDataList[0] ? imageDataList[0].dataUrl : ''}" alt="Perspective Mockup">
      </div>
      <p class="card-desc">Angled mobile perspective highlighting the primary dispatch card, GPS route navigation, calendar slot availability, and instant contractor bio sheet.</p>
    </div>

    <!-- Card 2: Split Telemetry Inspection -->
    <div class="card">
      <div class="pin"></div>
      <div class="card-header">
        <h3 class="card-title">02 · Split-View Defect Telemetry</h3>
        <span class="tag">GIS + Surface</span>
      </div>
      <div class="image-container" style="max-height: 480px;">
        <img src="${imageDataList[3] ? imageDataList[3].dataUrl : (imageDataList[1] ? imageDataList[1].dataUrl : '')}" alt="Split Inspection">
      </div>
      <p class="card-desc">Simultaneous split-screen alignment: Macro asphalt defect crack visualizer mapped directly against A14 road corridor coordinates.</p>
    </div>

    <!-- Card 3: Defect Make-Safe Action Flow -->
    <div class="card">
      <div class="pin"></div>
      <div class="card-header">
        <h3 class="card-title">03 · Make Safe Repair Work Order</h3>
        <span class="tag">Field Action Modal</span>
      </div>
      <div class="image-container" style="max-height: 480px;">
        <img src="${imageDataList[1] ? imageDataList[1].dataUrl : ''}" alt="Defect Detail">
      </div>
      <p class="card-desc">Clear priority header ("Urgent Crack Defect"), multi-satellite GPS verification pings, weather diagnostics, and high-contrast Revert / Submit buttons.</p>
    </div>

    <!-- Card 4: 3-Stage Flow & Heatmap Progression -->
    <div class="card">
      <div class="pin"></div>
      <div class="card-header">
        <h3 class="card-title">04 · Journey Architecture & Heatmap</h3>
        <span class="tag">Flow Progression</span>
      </div>
      <div class="image-container" style="max-height: 400px;">
        <img src="${imageDataList[2] ? imageDataList[2].dataUrl : ''}" alt="Flow Stages" style="object-fit: contain;">
      </div>
      <p class="card-desc">Progression across key touchpoints: Defect urgency feed (Alligator Cracking, Potholes), date/shift picker with operational windows, and thermal risk corridor heatmap.</p>
    </div>

    <!-- Card 5: Full Design System & Wireframe Blueprint (Wide Panoramic) -->
    <div class="card card-large">
      <div class="pin"></div>
      <div class="card-header">
        <h3 class="card-title">05 · End-to-End Contractor Dashboard Flow</h3>
        <span class="tag">Figma Canvas Blueprint</span>
      </div>
      <div class="image-container" style="max-height: 400px; padding: 18px 24px;">
        <img src="${imageDataList[4] ? imageDataList[4].dataUrl : ''}" alt="Contractor Dashboard" style="object-fit: contain; width: 100%;">
      </div>
      <p class="card-desc">Complete lifecycle: Pricing unit tables, revenue donut telemetry (££££), availability matrices, Frame 132 notebook concept sketches, and active task progress cards.</p>
    </div>

  </main>

  <!-- BOTTOM DESIGN SYSTEM & INSIGHTS BAR -->
  <section class="bottom-section">
    <!-- Color Palette -->
    <div class="palette-card">
      <div class="palette-title">
        <span>Core Color Token Palette</span>
        <span style="font-size: 11px; color: #64748b;">WCAG AAA / High Sunlight Tested</span>
      </div>
      <div class="swatches">
        ${palette.map(p => `
          <div class="swatch">
            <div class="swatch-color" style="background-color: ${p.hex};"></div>
            <span class="swatch-name">${p.name}</span>
            <span class="swatch-hex">${p.hex}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- UX Pillars & Heuristics -->
    <div class="notes-grid">
      ${uxPillars.map(pillar => `
        <div class="sticky-note">
          <h4>
            <span>${pillar.title}</span>
            <span class="sticky-tag">${pillar.tag}</span>
          </h4>
          <p>${pillar.desc}</p>
        </div>
      `).join('')}
    </div>
  </section>

</body>
</html>`;

fs.writeFileSync(outputHtml, htmlContent, 'utf-8');
console.log(`Mood board HTML generated at: ${outputHtml}`);

// Take screenshot using headless Chrome or Edge
const { execFileSync } = require('child_process');
const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

const browserExe = chromeCandidates.find(p => fs.existsSync(p));

if (!browserExe) {
  console.error('No supported browser executable (Chrome or Edge) found.');
  process.exit(1);
}

const fileUrl = `file:///${outputHtml.replace(/\\/g, '/')}`;

console.log(`Using browser: ${browserExe}`);
console.log(`Capturing high-resolution screenshot to: ${outputImage}...`);

try {
  const browserArgs = [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--window-size=2560,1600',
    `--screenshot=${outputImage}`,
    fileUrl
  ];
  
  execFileSync(browserExe, browserArgs, { stdio: 'inherit' });
  
  if (fs.existsSync(outputImage)) {
    const stats = fs.statSync(outputImage);
    console.log(`\n🎉 SUCCESS! Mood board screenshot created:\n-> ${outputImage} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.error('Screenshot file was not generated.');
  }
} catch (err) {
  console.error('Screenshot capture failed:', err.message);
}


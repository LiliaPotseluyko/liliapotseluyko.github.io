/**
 * scripts/canvas_sync.cjs
 * 
 * Agent Canvas: Bidirectional synchronizer between HTML portfolio pages and Text Canvases.
 * Extracts pure editorial copy (no HTML code, scripts, styles, or images) into an editable
 * Markdown Canvas, and applies user edits from Canvas back into the HTML source cleanly.
 */

const fs = require('fs');
const path = require('path');

function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&bull;/g, '•')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&pound;/g, '£')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rsquo;/g, '’');
}

function encodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/•/g, '&bull;')
    .replace(/—/g, '&mdash;')
    .replace(/–/g, '&ndash;')
    .replace(/“/g, '&ldquo;')
    .replace(/”/g, '&rdquo;')
    .replace(/‘/g, '&lsquo;')
    .replace(/’/g, '&rsquo;');
}

function stripTags(html) {
  if (!html) return '';
  return decodeHtml(html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();
}

/**
 * Definition of all content blocks for roadgp-interface.html
 */
const BLOCKS = [
  // --- PAGE & HERO ---
  {
    id: 'page-title',
    section: 'Header & Metadata',
    label: 'Browser Tab Title',
    re: /(<title>)([\s\S]*?)(<\/title>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => val
  },
  {
    id: 'hero-kicker',
    section: 'Header & Metadata',
    label: 'Hero Kicker',
    re: /(<p class="case-study-kicker">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'hero-title',
    section: 'Header & Metadata',
    label: 'Hero Main Title',
    re: /(<div class="hero-title-group">\s*<p[^>]*>[\s\S]*?<\/p>\s*<h1>)([\s\S]*?)(<\/h1>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'hero-meta-role',
    section: 'Header & Metadata',
    label: 'Hero Meta: My Role',
    re: /(<h4>My Role<\/h4>\s*<p>)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'hero-meta-collaborators',
    section: 'Header & Metadata',
    label: 'Hero Meta: Collaborators',
    re: /(<h4>Collaborators<\/h4>\s*<p>)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'hero-meta-methods',
    section: 'Header & Metadata',
    label: 'Hero Meta: Methods',
    re: /(<h4>Methods<\/h4>\s*<p>)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'hero-meta-primary-users',
    section: 'Header & Metadata',
    label: 'Hero Meta: Primary Users',
    re: /(<h4>Primary Users<\/h4>\s*<p>)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },

  // --- SUB-PAGE 1: PROBLEMS ---
  {
    id: 'sp1-title',
    section: 'Sub-Page 1: Problems',
    label: 'Sub-Page 1 Title',
    re: /(<article class="roadgp-subpage" id="subpage-1">[\s\S]*?<h2 class="roadgp-subpage-title">)([\s\S]*?)(<\/h2>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp1-team-heading',
    section: 'Sub-Page 1: Problems',
    label: 'Research Team Heading',
    re: /(<i class="fas fa-users"[^>]*><\/i>\s*)([\s\S]*?)(<\/h3>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp1-team-intro',
    section: 'Sub-Page 1: Problems',
    label: 'Research Team Intro',
    re: /(<p style="color: #888888; font-size: 0\.85rem; margin: 0 0 18px;">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp1-persona-lilia-role',
    section: 'Sub-Page 1: Problems',
    label: 'Lilia Role Badge',
    re: /(<div class="ds-persona-name">Lilia<\/div>\s*<div class="ds-persona-role">)([\s\S]*?)(<\/div>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp1-persona-alix-role',
    section: 'Sub-Page 1: Problems',
    label: 'Alix Role Badge',
    re: /(<div class="ds-persona-name">Alix<\/div>\s*<div class="ds-persona-role">)([\s\S]*?)(<\/div>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp1-persona-stephen-role',
    section: 'Sub-Page 1: Problems',
    label: 'Stephen Role Badge',
    re: /(<div class="ds-persona-name">Stephen<\/div>\s*<div class="ds-persona-role">)([\s\S]*?)(<\/div>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp1-persona-richard-role',
    section: 'Sub-Page 1: Problems',
    label: 'Richard Role Badge',
    re: /(<div class="ds-persona-name">Richard<\/div>\s*<div class="ds-persona-role">)([\s\S]*?)(<\/div>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp1-persona-jerry-role',
    section: 'Sub-Page 1: Problems',
    label: 'Jerry Role Badge',
    re: /(<div class="ds-persona-name">Jerry<\/div>\s*<div class="ds-persona-role">)([\s\S]*?)(<\/div>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp1-persona-damian-role',
    section: 'Sub-Page 1: Problems',
    label: 'Damian Role Badge',
    re: /(<div class="ds-persona-name">Damian<\/div>\s*<div class="ds-persona-role">)([\s\S]*?)(<\/div>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp1-discovery-heading',
    section: 'Sub-Page 1: Problems',
    label: 'Domain Mapping Heading',
    re: /(<i class="fas fa-diagram-project"[^>]*><\/i>\s*)([\s\S]*?)(<\/h3>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp1-discovery-intro',
    section: 'Sub-Page 1: Problems',
    label: 'Domain Mapping Intro',
    re: /(<p style="color: #888888; font-size: 0\.85rem; margin: 0 0 16px;">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp1-quadrant-dt-title',
    section: 'Sub-Page 1: Problems',
    label: 'Digital Twin Quadrant Title',
    re: /(<div class="diagram-quadrant digital-twin">[\s\S]*?<h4 class="quadrant-title">)([\s\S]*?)(<\/h4>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp1-quadrant-dt-tasks',
    section: 'Sub-Page 1: Problems',
    label: 'Digital Twin Quadrant Objectives',
    re: /(<div class="diagram-quadrant digital-twin">[\s\S]*?<div class="quadrant-tasks-list">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<!-- TOP-RIGHT)/,
    extract: (m) => {
      const items = m[2].match(/<span>([\s\S]*?)<\/span>/g) || [];
      return items.map(i => '- ' + decodeHtml(i.replace(/<\/?span>/g, '')).trim()).join('\n');
    },
    inject: (val) => {
      const lines = val.split('\n').map(l => l.replace(/^[-*•]\s*/, '').trim()).filter(Boolean);
      return '\n' + lines.map(l => `                <div class="quadrant-task-item">\n                  <i class="fas fa-arrow-right"></i>\n                  <span>${encodeHtml(l)}</span>\n                </div>`).join('\n') + '\n              ';
    }
  },
  {
    id: 'sp1-quadrant-ds-title',
    section: 'Sub-Page 1: Problems',
    label: 'Data Science Quadrant Title',
    re: /(<div class="diagram-quadrant data-science">[\s\S]*?<h4 class="quadrant-title">)([\s\S]*?)(<\/h4>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp1-quadrant-ds-tasks',
    section: 'Sub-Page 1: Problems',
    label: 'Data Science Quadrant Objectives',
    re: /(<div class="diagram-quadrant data-science">[\s\S]*?<div class="quadrant-tasks-list">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<!-- CENTER)/,
    extract: (m) => {
      const items = m[2].match(/<span>([\s\S]*?)<\/span>/g) || [];
      return items.map(i => '- ' + decodeHtml(i.replace(/<\/?span>/g, '')).trim()).join('\n');
    },
    inject: (val) => {
      const lines = val.split('\n').map(l => l.replace(/^[-*•]\s*/, '').trim()).filter(Boolean);
      return '\n' + lines.map(l => `                <div class="quadrant-task-item">\n                  <i class="fas fa-arrow-right"></i>\n                  <span>${encodeHtml(l)}</span>\n                </div>`).join('\n') + '\n\n              ';
    }
  },
  {
    id: 'sp1-hub-dilemma-title',
    section: 'Sub-Page 1: Problems',
    label: 'Core Maintenance Dilemma Title',
    re: /(<h5 class="hub-dilemma-title">)([\s\S]*?)(<\/h5>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp1-hub-dilemma-body',
    section: 'Sub-Page 1: Problems',
    label: 'Core Maintenance Dilemma Text',
    re: /(<div class="hub-dilemma-box">[\s\S]*?<p>)([\s\S]*?)(<\/p>\s*<\/div>)/,
    extract: (m) => stripTags(m[2]),
    inject: (val) => {
      const lines = val.split('\n').map(l => l.trim()).filter(Boolean);
      return '\n                <strong>' + encodeHtml(lines[0] || '') + '</strong><br>\n                ' + encodeHtml(lines.slice(1).join('\n') || '') + '\n              ';
    }
  },
  {
    id: 'sp1-hub-tradeoffs',
    section: 'Sub-Page 1: Problems',
    label: 'Operational Trade-Off Tags',
    re: /(<div class="hub-tradeoffs-list">)([\s\S]*?)(<\/div>\s*<\/div>\s*<!-- BOTTOM-LEFT)/,
    extract: (m) => {
      const tags = m[2].match(/<span class="hub-tradeoff-tag">([\s\S]*?)<\/span>/g) || [];
      return tags.map(t => decodeHtml(t.replace(/<[^>]+>/g, '')).trim()).join(' • ');
    },
    inject: (val) => {
      const tags = val.split(/[•,\n]/).map(t => t.trim()).filter(Boolean);
      return '\n' + tags.map(t => `              <span class="hub-tradeoff-tag">${encodeHtml(t)}</span>`).join('\n') + '\n            ';
    }
  },
  {
    id: 'sp1-quadrant-robotics-title',
    section: 'Sub-Page 1: Problems',
    label: 'Robotics Quadrant Title',
    re: /(<div class="diagram-quadrant robotics">[\s\S]*?<h4 class="quadrant-title">)([\s\S]*?)(<\/h4>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp1-quadrant-robotics-tasks',
    section: 'Sub-Page 1: Problems',
    label: 'Robotics Quadrant Objectives',
    re: /(<div class="diagram-quadrant robotics">[\s\S]*?<div class="quadrant-tasks-list">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<!-- BOTTOM-RIGHT)/,
    extract: (m) => {
      const items = m[2].match(/<span>([\s\S]*?)<\/span>/g) || [];
      return items.map(i => '- ' + decodeHtml(i.replace(/<\/?span>/g, '')).trim()).join('\n');
    },
    inject: (val) => {
      const lines = val.split('\n').map(l => l.replace(/^[-*•]\s*/, '').trim()).filter(Boolean);
      return '\n' + lines.map(l => `                <div class="quadrant-task-item">\n                  <i class="fas fa-arrow-right"></i>\n                  <span>${encodeHtml(l)}</span>\n                </div>`).join('\n') + '\n              ';
    }
  },
  {
    id: 'sp1-quadrant-materials-title',
    section: 'Sub-Page 1: Problems',
    label: 'Smart Materials Quadrant Title',
    re: /(<div class="diagram-quadrant smart-materials">[\s\S]*?<h4 class="quadrant-title">)([\s\S]*?)(<\/h4>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp1-quadrant-materials-tasks',
    section: 'Sub-Page 1: Problems',
    label: 'Smart Materials Quadrant Objectives',
    re: /(<div class="diagram-quadrant smart-materials">[\s\S]*?<div class="quadrant-tasks-list">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/section>)/,
    extract: (m) => {
      const items = m[2].match(/<span>([\s\S]*?)<\/span>/g) || [];
      return items.map(i => '- ' + decodeHtml(i.replace(/<\/?span>/g, '')).trim()).join('\n');
    },
    inject: (val) => {
      const lines = val.split('\n').map(l => l.replace(/^[-*•]\s*/, '').trim()).filter(Boolean);
      return '\n' + lines.map(l => `                <div class="quadrant-task-item">\n                  <i class="fas fa-arrow-right"></i>\n                  <span>${encodeHtml(l)}</span>\n                </div>`).join('\n') + '\n              ';
    }
  },
  {
    id: 'sp1-goal-content',
    section: 'Sub-Page 1: Problems',
    label: 'Project Goal',
    re: /(<div class="ds-long-desc-section">\s*<div class="ds-long-desc-title"[^>]*>Goal<\/div>\s*<p class="ds-long-desc-text"[^>]*>)([\s\S]*?)(<\/p>\s*<\/div>\s*<div class="ds-long-desc-divider")/i,
    extract: (m) => stripTags(m[2]),
    inject: (val) => `\n                ${encodeHtml(val)}\n              `
  },
  {
    id: 'sp1-hypothesis-content',
    section: 'Sub-Page 1: Problems',
    label: 'Project Hypothesis',
    re: /(<div class="ds-long-desc-section">\s*<div class="ds-long-desc-title"[^>]*>Hypothesis<\/div>\s*<p class="ds-long-desc-text"[^>]*>)([\s\S]*?)(<\/p>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/section>)/i,
    extract: (m) => stripTags(m[2]),
    inject: (val) => `\n               ${encodeHtml(val)}\n              `
  },

  // --- SUB-PAGE 2: USERS & WORKFLOWS ---
  {
    id: 'sp2-title',
    section: 'Sub-Page 2: Users & Workflows',
    label: 'Sub-Page 2 Title',
    re: /(<article class="roadgp-subpage" id="subpage-2">[\s\S]*?<h2 class="roadgp-subpage-title">)([\s\S]*?)(<\/h2>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp2-interviews-heading',
    section: 'Sub-Page 2: Users & Workflows',
    label: 'Staff Interviews Heading',
    re: /(<div class="interview-note-badge">[\s\S]*?<\/div>\s*<h3[^>]*>)([\s\S]*?)(<\/h3>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp2-interviews-p1',
    section: 'Sub-Page 2: Users & Workflows',
    label: 'Staff Interviews Overview (Paragraph 1)',
    re: /(Staff Interviews at National Highways[\s\S]*?<\/h3>\s*<p style="color: #cbd5e1; font-size: 0\.9rem; line-height: 1\.6; margin: 0 0 8px;">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp2-interviews-p2',
    section: 'Sub-Page 2: Users & Workflows',
    label: 'Staff Interviews MVP Scope (Paragraph 2)',
    re: /(Staff Interviews at National Highways[\s\S]*?margin: 0 0 8px;">[\s\S]*?<\/p>\s*<p style="color: #cbd5e1; font-size: 0\.9rem; line-height: 1\.6; margin: 0;">)([\s\S]*?)(<\/p>\s*<\/div>)/,
    extract: (m) => stripTags(m[2]),
    inject: (val) => {
      return val
        .replace(/Minimum Viable Product \(MVP\)/g, '<strong>Minimum Viable Product (MVP)</strong>')
        .replace(/Asset Manager/g, '<strong>Asset Manager</strong>')
        .replace(/Regional Service Provider/g, '<strong>Regional Service Provider</strong>');
    }
  },
  {
    id: 'sp2-scope-heading',
    section: 'Sub-Page 2: Users & Workflows',
    label: 'Scope Evolution Heading',
    re: /(<i class="fas fa-filter"[^>]*><\/i>\s*)([\s\S]*?)(<\/h3>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp2-stephen-quote',
    section: 'Sub-Page 2: Users & Workflows',
    label: 'Stephen Darwin Research Quote',
    re: /(<div class="persona-quote-callout"[^>]*>)([\s\S]*?)(<\/div>)/,
    extract: (m) => stripTags(m[2]),
    inject: (val) => `\n              &ldquo;${encodeHtml(val.replace(/[“”"]/g, ''))}&rdquo;\n            `
  },
  {
    id: 'sp2-stephen-systems',
    section: 'Sub-Page 2: Users & Workflows',
    label: 'Stephen Darwin Current Systems',
    re: /(<strong style="color: #e2e8f0;">Current Systems:<\/strong>\s*)([\s\S]*?)(<\/li>)/,
    extract: (m) => stripTags(m[2]),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp2-stephen-goals',
    section: 'Sub-Page 2: Users & Workflows',
    label: 'Stephen Darwin Core Goals',
    re: /(<strong style="color: #e2e8f0;">Core Goals:<\/strong>\s*)([\s\S]*?)(<\/li>)/,
    extract: (m) => stripTags(m[2]),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp2-stephen-pain',
    section: 'Sub-Page 2: Users & Workflows',
    label: 'Stephen Darwin Key Pain Point',
    re: /(<strong style="color: #e2e8f0;">Key Pain Point:<\/strong>\s*)([\s\S]*?)(<\/li>)/,
    extract: (m) => stripTags(m[2]),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp2-stephen-value',
    section: 'Sub-Page 2: Users & Workflows',
    label: 'Stephen Darwin RoadGP Value',
    re: /(<strong style="color: #e2e8f0;">RoadGP Value:<\/strong>\s*)([\s\S]*?)(<\/li>)/,
    extract: (m) => stripTags(m[2]),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp2-workflows-intro',
    section: 'Sub-Page 2: Users & Workflows',
    label: 'Process Mapping Intro',
    re: /(Process Mapping and User Journeys[\s\S]*?<\/h3>\s*<p style="color: #888888; font-size: 0\.85rem; margin: 0;">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp2-wf-nh-loop-desc',
    section: 'Sub-Page 2: Users & Workflows',
    label: 'National Highways Operational Loop Desc',
    re: /(<h4 class="workflow-card-title">National Highways Operational Loop<\/h4>\s*<p class="workflow-card-desc">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp2-wf-idm-desc',
    section: 'Sub-Page 2: Users & Workflows',
    label: 'Granular Process Mapping (IDM) Desc',
    re: /(<h4 class="workflow-card-title">Granular Process Mapping \(IDM\)<\/h4>\s*<p class="workflow-card-desc">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp2-wf-proposed-desc',
    section: 'Sub-Page 2: Users & Workflows',
    label: 'Proposed Multi-Stakeholder Loop Desc',
    re: /(<h4 class="workflow-card-title">Proposed Multi-Stakeholder Loop<\/h4>\s*<p class="workflow-card-desc">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp2-wf-swimlane-desc',
    section: 'Sub-Page 2: Users & Workflows',
    label: 'Automated Interaction Swimlane Desc',
    re: /(<h4 class="workflow-card-title">Automated Interaction Swimlane<\/h4>\s*<p class="workflow-card-desc">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp2-wf-pipeline-desc',
    section: 'Sub-Page 2: Users & Workflows',
    label: 'Operational Defect Status Pipeline Desc',
    re: /(<h4 class="workflow-card-title">Operational Defect Status Pipeline<\/h4>\s*<p class="workflow-card-desc">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },

  // --- SUB-PAGE 3: STORYBOARD & ASSUMPTIONS ---
  {
    id: 'sp3-title',
    section: 'Sub-Page 3: Storyboard & Assumptions',
    label: 'Sub-Page 3 Title',
    re: /(<article class="roadgp-subpage" id="subpage-3">[\s\S]*?<h2 class="roadgp-subpage-title">)([\s\S]*?)(<\/h2>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp3-assumptions-intro',
    section: 'Sub-Page 3: Storyboard & Assumptions',
    label: 'Assumptions Intro',
    re: /(<p class="assumptions-intro">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp3-assump1-statement',
    section: 'Sub-Page 3: Storyboard & Assumptions',
    label: 'Assumption 1 Statement',
    re: /(<h4 class="assumption-heading">Mobile-Friendly Interface &bull; Progressive Complexity<\/h4>\s*<\/div>\s*<p class="assumption-text">\s*<strong>Assumption:<\/strong>\s*)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp3-assump1-desc',
    section: 'Sub-Page 3: Storyboard & Assumptions',
    label: 'Assumption 1 Rationale',
    re: /(<h4 class="assumption-heading">Mobile-Friendly Interface &bull; Progressive Complexity<\/h4>[\s\S]*?<p class="assumption-desc">)([\s\S]*?)(<\/p>)/,
    extract: (m) => stripTags(m[2]),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp3-assump2-statement',
    section: 'Sub-Page 3: Storyboard & Assumptions',
    label: 'Assumption 2 Statement',
    re: /(<h4 class="assumption-heading">Industry Readiness for Unified Automation<\/h4>\s*<\/div>\s*<p class="assumption-text">\s*<strong>Assumption:<\/strong>\s*)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp3-assump2-desc',
    section: 'Sub-Page 3: Storyboard & Assumptions',
    label: 'Assumption 2 Rationale',
    re: /(<h4 class="assumption-heading">Industry Readiness for Unified Automation<\/h4>[\s\S]*?<p class="assumption-desc">)([\s\S]*?)(<\/p>)/,
    extract: (m) => stripTags(m[2]),
    inject: (val) => encodeHtml(val)
  },

  // --- SUB-PAGE 4: ARCHITECTURE ---
  {
    id: 'sp4-title',
    section: 'Sub-Page 4: Architecture',
    label: 'Sub-Page 4 Title',
    re: /(<article class="roadgp-subpage" id="subpage-4">[\s\S]*?<h2 class="roadgp-subpage-title">)([\s\S]*?)(<\/h2>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp4-intro',
    section: 'Sub-Page 4: Architecture',
    label: 'Sub-Page 4 Narrative Intro',
    re: /(<p class="roadgp-subpage-intro"[^>]*>)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp4-col1-desc',
    section: 'Sub-Page 4: Architecture',
    label: 'Previous Architecture Versions Desc',
    re: /(<h3 class="arch-col-title">Previous Architecture Versions<\/h3>\s*<p class="arch-col-desc">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp4-col2-desc',
    section: 'Sub-Page 4: Architecture',
    label: 'Data Science Treatment Engine Desc',
    re: /(<h3 class="arch-col-title">Data Science Treatment Engine<\/h3>\s*<p class="arch-col-desc">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp4-col3-desc',
    section: 'Sub-Page 4: Architecture',
    label: 'Unified Conceptual Architecture Desc',
    re: /(<h3 class="arch-col-title">Unified Conceptual Architecture<\/h3>\s*<p class="arch-col-desc">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },

  // --- SUB-PAGE 5: ITERATIVE DEV ---
  {
    id: 'sp5-title',
    section: 'Sub-Page 5: Iterative Development',
    label: 'Sub-Page 5 Title',
    re: /(<article class="roadgp-subpage" id="subpage-5">[\s\S]*?<h2 class="roadgp-subpage-title">)([\s\S]*?)(<\/h2>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp5-findings-intro',
    section: 'Sub-Page 5: Iterative Development',
    label: 'Research Findings Intro',
    re: /(<p class="findings-card-intro">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp5-finding1-desc',
    section: 'Sub-Page 5: Iterative Development',
    label: 'Finding 1: Testing Workflow Assumptions',
    re: /(<h4>Testing Workflow Assumptions<\/h4>\s*<p>)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp5-finding2-desc',
    section: 'Sub-Page 5: Iterative Development',
    label: 'Finding 2: Historical Defect Visualization',
    re: /(<h4>Historical Defect Visualization<\/h4>\s*<p>)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp5-finding3-desc',
    section: 'Sub-Page 5: Iterative Development',
    label: 'Finding 3: Invoice Monitoring System',
    re: /(<h4>Invoice Monitoring System<\/h4>\s*<p>)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp5-finding4-desc',
    section: 'Sub-Page 5: Iterative Development',
    label: 'Finding 4: Defining MVP Product Boundaries',
    re: /(<h4>Defining MVP Product Boundaries<\/h4>\s*<p>)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp5-finding5-desc',
    section: 'Sub-Page 5: Iterative Development',
    label: 'Finding 5: Interaction Benchmarking',
    re: /(<h4>Interaction Benchmarking<\/h4>\s*<p>)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },

  // --- SUB-PAGES 6 TO 11 ---
  {
    id: 'sp6-desc',
    section: 'Sub-Page 6: Interactive Prototypes',
    label: 'Sub-Page 6 Scope Description',
    re: /(<article class="roadgp-subpage" id="subpage-6">[\s\S]*?<p style="color: #888; font-size: 0\.85rem; max-width: 600px; margin: 0 auto;">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp7-desc',
    section: 'Sub-Page 7: Design System',
    label: 'Sub-Page 7 Scope Description',
    re: /(<article class="roadgp-subpage" id="subpage-7">[\s\S]*?<p style="color: #888; font-size: 0\.85rem; max-width: 600px; margin: 0 auto;">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp8-desc',
    section: 'Sub-Page 8: Usability Sessions',
    label: 'Sub-Page 8 Scope Description',
    re: /(<article class="roadgp-subpage" id="subpage-8">[\s\S]*?<p style="color: #888; font-size: 0\.85rem; max-width: 600px; margin: 0 auto;">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp9-desc',
    section: 'Sub-Page 9: Decision Matrix',
    label: 'Sub-Page 9 Scope Description',
    re: /(<article class="roadgp-subpage" id="subpage-9">[\s\S]*?<p style="color: #888; font-size: 0\.85rem; max-width: 600px; margin: 0 auto;">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp10-desc',
    section: 'Sub-Page 10: Measurable Outcomes',
    label: 'Sub-Page 10 Scope Description',
    re: /(<article class="roadgp-subpage" id="subpage-10">[\s\S]*?<p style="color: #888; font-size: 0\.85rem; max-width: 600px; margin: 0 auto;">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  },
  {
    id: 'sp11-desc',
    section: 'Sub-Page 11: Future Roadmap',
    label: 'Sub-Page 11 Scope Description',
    re: /(<article class="roadgp-subpage" id="subpage-11">[\s\S]*?<p style="color: #888; font-size: 0\.85rem; max-width: 600px; margin: 0 auto;">)([\s\S]*?)(<\/p>)/,
    extract: (m) => decodeHtml(m[2]).trim(),
    inject: (val) => encodeHtml(val)
  }
];

/**
 * Generate Markdown Canvas from HTML
 */
function extractCanvas(htmlContent) {
  let md = `# RoadGP Interface & Decision Support: Editorial Text Canvas\n\n`;
  md += `> **Agent Canvas Workspace Document**\n`;
  md += `> Source Page: \`projects/roadgp-interface.html\`\n`;
  md += `> Instructions: Edit any of the copy below freely. Keep the \`### [ID: ...]\` identifier lines intact so Agent Canvas can re-inject your changes directly back into the HTML.\n\n`;
  md += `---\n\n`;

  let currentSection = '';

  for (const block of BLOCKS) {
    if (block.section !== currentSection) {
      currentSection = block.section;
      md += `## ${currentSection}\n\n`;
    }

    const match = htmlContent.match(block.re);
    if (!match) {
      console.warn(`Warning: Could not match block [${block.id}] in HTML`);
      continue;
    }

    const text = block.extract(match);
    md += `### [ID: ${block.id}] — ${block.label}\n\n`;
    md += `${text}\n\n`;
  }

  return md;
}

/**
 * Update HTML from Markdown Canvas
 */
function updateHtmlFromCanvas(htmlContent, canvasMarkdown) {
  let updatedHtml = htmlContent;
  let updateCount = 0;

  // Normalize CRLF to LF
  const cleanMarkdown = canvasMarkdown.replace(/\r\n/g, '\n');

  // Parse markdown by block IDs (handling single or double newlines)
  const blockRegex = /### \[ID: ([a-zA-Z0-9_-]+)\][^\n]*\n+([\s\S]*?)(?=\n+### \[ID:|\n+## |\n+---|$)/g;
  let match;
  const canvasMap = new Map();

  while ((match = blockRegex.exec(cleanMarkdown)) !== null) {
    const id = match[1].trim();
    const text = match[2].trim();
    canvasMap.set(id, text);
  }

  for (const block of BLOCKS) {
    if (!canvasMap.has(block.id)) continue;
    const newText = canvasMap.get(block.id);
    const htmlMatch = updatedHtml.match(block.re);
    
    if (!htmlMatch) {
      console.warn(`Could not locate block [${block.id}] in HTML for injection`);
      continue;
    }

    const currentExtracted = block.extract(htmlMatch);
    if (currentExtracted !== newText) {
      const injectedPart = block.inject(newText);
      updatedHtml = updatedHtml.replace(block.re, `$1${injectedPart}$3`);
      updateCount++;
      console.log(`Updated [${block.id}]: "${currentExtracted.slice(0, 30)}..." -> "${newText.slice(0, 30)}..."`);
    }
  }

  return { updatedHtml, updateCount };
}

// CLI Execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'extract';
  const defaultHtmlPath = path.resolve(__dirname, '../projects/roadgp-interface.html');
  const defaultCanvasPath = path.resolve(__dirname, '../canvas/roadgp-interface-canvas.md');

  if (command === 'extract') {
    const htmlPath = args[1] || defaultHtmlPath;
    const canvasPath = args[2] || defaultCanvasPath;
    const html = fs.readFileSync(htmlPath, 'utf8');
    const md = extractCanvas(html);

    const dir = path.dirname(canvasPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(canvasPath, md, 'utf8');
    console.log(`Successfully extracted canvas to: ${canvasPath}`);
  } else if (command === 'update') {
    const canvasPath = args[1] || defaultCanvasPath;
    const htmlPath = args[2] || defaultHtmlPath;
    const html = fs.readFileSync(htmlPath, 'utf8');
    const canvasMd = fs.readFileSync(canvasPath, 'utf8');

    const { updatedHtml, updateCount } = updateHtmlFromCanvas(html, canvasMd);
    fs.writeFileSync(htmlPath, updatedHtml, 'utf8');
    console.log(`Successfully synchronized ${updateCount} edits from Canvas back to ${htmlPath}`);
  } else {
    console.log(`Usage: node scripts/canvas_sync.cjs [extract|update] [source] [target]`);
  }
}

module.exports = {
  extractCanvas,
  updateHtmlFromCanvas,
  BLOCKS
};

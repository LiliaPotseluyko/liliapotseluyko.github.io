import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { PortfolioData, ChatMode } from './src/types';
import { defaultPortfolioData } from './src/data/defaultPortfolio';

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // CORS & Body Parsers
  app.use(cors({ origin: '*' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Portfolio AI Assistant Backend',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // --- API ROUTE 1: Portfolio AI Chat ---
  app.post('/api/chat', async (req, res) => {
    try {
      const {
        message,
        conversationHistory = [],
        portfolioData,
        mode = 'general',
        targetRole = '',
      } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'A valid message string is required.' });
        return;
      }

      if (!process.env.GEMINI_API_KEY) {
        res.status(500).json({
          error:
            'GEMINI_API_KEY environment variable is not configured. Please add it in Settings > Secrets.',
        });
        return;
      }

      const incoming = portfolioData || {};
      const pData: PortfolioData = {
        developerName: incoming.developerName || defaultPortfolioData.developerName,
        title: incoming.title || defaultPortfolioData.title,
        bio: incoming.bio || defaultPortfolioData.bio,
        location: incoming.location || defaultPortfolioData.location,
        yearsOfExperience: incoming.yearsOfExperience || defaultPortfolioData.yearsOfExperience,
        contactEmail: incoming.contactEmail || defaultPortfolioData.contactEmail,
        githubUrl: incoming.githubUrl || defaultPortfolioData.githubUrl,
        linkedinUrl: incoming.linkedinUrl || defaultPortfolioData.linkedinUrl,
        keyAchievements: (incoming.keyAchievements && incoming.keyAchievements.length > 0)
          ? incoming.keyAchievements
          : defaultPortfolioData.keyAchievements,
        skills: (incoming.skills && incoming.skills.length > 0)
          ? incoming.skills
          : defaultPortfolioData.skills,
        projects: (incoming.projects && incoming.projects.length > 0)
          ? incoming.projects
          : defaultPortfolioData.projects,
        workExperience: (incoming.workExperience && incoming.workExperience.length > 0)
          ? incoming.workExperience
          : defaultPortfolioData.workExperience,
        rawUnstructuredText: incoming.rawUnstructuredText || defaultPortfolioData.rawUnstructuredText,
      };

      const devName = pData.developerName;

      // Build context summary string
      const skillsStr = pData.skills
        ? pData.skills
            .map((s) => `${s.category}: ${s.skills.join(', ')}`)
            .join('\n')
        : '';

      const projectsStr = pData.projects
        ? pData.projects
            .map(
              (p) =>
                `ID: ${p.id} | Title: ${p.title} | Role: ${p.role}\nDescription: ${p.description}\nTech Stack: ${p.techStack.join(', ')}\nMetrics/Impact: ${p.impactMetrics.join('; ')}\nChallenges Solved: ${p.challengesSolved}`
            )
            .join('\n\n')
        : '';

      const experienceStr = pData.workExperience
        ? pData.workExperience
            .map(
              (e) =>
                `${e.company} (${e.role}, ${e.period}): ${e.summary} [Highlights: ${e.highlights.join('; ')}]`
            )
            .join('\n')
        : '';

      const keyAchievements = pData.keyAchievements
        ? pData.keyAchievements.join('\n- ')
        : '';

      const rawKnowledgeBase = pData.rawUnstructuredText || '';

      let modePersonaPrompt = '';
      if (mode === 'recruiter') {
        modePersonaPrompt = `You are representing Dr Lilia Potseluyko in a Recruiter/Hiring Manager communication mode. Focus on concise impact, leadership in spatial data & digital twins, research fellowship achievements, stakeholder engagement, and key value propositions. Speak professionally, enthusiastically, and succinctly.`;
      } else if (mode === 'tech_deepdive') {
        modePersonaPrompt = `You are speaking as an AI Technical Co-Pilot for Dr Lilia Potseluyko's research & engineering portfolio. Provide granular deep dives into spatial coordinate transformations, 3D computer vision, Unreal Engine digital twin tile streaming, UX design systems (RoadGP), LiDAR/GPR processing, and microservice architectures.`;
      } else if (mode === 'job_match') {
        modePersonaPrompt = `You are analyzing Dr Lilia Potseluyko's portfolio against the target role requirement: "${targetRole || 'Spatial Data / AI / Digital Twin Specialist'}". Directly correlate candidate projects and technical skills with role expectations, highlighting exact alignment and how her research and engineering experience solves key job demands.`;
      } else {
        modePersonaPrompt = `You are a friendly, articulate AI Portfolio Assistant representing Dr Lilia Potseluyko (Cambridge-based Researcher & Digital Engineer). Answer questions accurately based strictly on her portfolio knowledge base context.`;
      }

      const systemInstruction = `
${modePersonaPrompt}

PORTFOLIO CANDIDATE KNOWLEDGE BASE CONTEXT (Dr Lilia Potseluyko):
- Name: ${devName}
- Title: ${pData.title || 'Cambridge-based Researcher & Digital Engineer'}
- Bio: ${pData.bio || ''}
- Location: ${pData.location || 'Cambridge, UK'}
- Experience: ${pData.yearsOfExperience || 8} years
- Contact Email: ${pData.contactEmail || 'lilia.potseluyko@gmail.com'}
- GitHub: ${pData.githubUrl || ''}
- LinkedIn: ${pData.linkedinUrl || ''}

KEY ACHIEVEMENTS & RESEARCH FELLOWSHIPS:
- ${keyAchievements}

TECHNICAL SKILLS & EXPERTISE:
${skillsStr}

PROJECT HISTORY & EVIDENCE:
${projectsStr}

WORK EXPERIENCE & LEADERSHIP:
${experienceStr}

RAW KNOWLEDGE BASE DOCUMENTS & CSV DATA:
${rawKnowledgeBase}

CRITICAL KNOWLEDGE BASE GROUNDING INSTRUCTIONS:
1. Ground ALL answers strictly in Dr Lilia Potseluyko's provided portfolio knowledge base documents, project evidence, publications, and experience history.
2. DO NOT ground answers in external web search or general assumptions.
3. IF supporting evidence or information is unavailable or not mentioned in her portfolio knowledge base, you MUST explicitly state:
   "I could not find supporting information in the current portfolio knowledge base." or "Based on Dr Lilia Potseluyko's current portfolio knowledge base, there is no evidence provided regarding [topic]."
4. Never fabricate unmentioned projects, companies, degrees, or metrics.
5. Format responses using clean Markdown (bolding, bullet points, code blocks where appropriate).
6. At the end of your response, ALWAYS append a JSON metadata block on a single line starting with "<!-- METADATA:" and ending with "-->".
The metadata JSON MUST adhere to this structure:
{"referencedProjects": ["p1", "p2"], "suggestedFollowups": ["Question 1?", "Question 2?", "Question 3?"]}
Include project IDs from the PORTFOLIO CANDIDATE CONTEXT (e.g. "p1", "p2", "p3", "p4") IF they are relevant to or mentioned in your response.
Provide 2 to 3 concise, highly context-relevant follow-up questions the visitor might want to ask next.
`;

      // Build turn history
      const formattedContents = [];
      if (conversationHistory && Array.isArray(conversationHistory)) {
        for (const msg of conversationHistory) {
          formattedContents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          });
        }
      }
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const rawText = response.text || '';

      // Extract METADATA comment if present
      let text = rawText;
      let referencedProjects: string[] = [];
      let suggestedFollowups: string[] = [];

      const metadataMatch = rawText.match(/<!--\s*METADATA:\s*(\{.*?\})\s*-->/s);
      if (metadataMatch && metadataMatch[1]) {
        try {
          const meta = JSON.parse(metadataMatch[1]);
          referencedProjects = meta.referencedProjects || [];
          suggestedFollowups = meta.suggestedFollowups || [];
          text = rawText.replace(/<!--\s*METADATA:\s*\{.*?\}\s*-->/s, '').trim();
        } catch {
          // ignore parsing error
        }
      }

      // Default followups fallback if none were generated
      if (suggestedFollowups.length === 0) {
        if (mode === 'recruiter') {
          suggestedFollowups = [
            `What is ${devName}'s current availability?`,
            `Can you summarize top 3 technical achievements?`,
            `Tell me about ${devName}'s lead engineering experience.`,
          ];
        } else if (mode === 'tech_deepdive') {
          suggestedFollowups = [
            `How was OmniSearch AI's vector index optimized?`,
            `What performance trade-offs were made in FlowState?`,
            `Can you show a code snippet from a recent project?`,
          ];
        } else {
          suggestedFollowups = [
            `What are ${devName}'s core technical strengths?`,
            `Tell me more about the OmniSearch AI project.`,
            `How can I contact ${devName}?`,
          ];
        }
      }

      res.json({
        text,
        referencedProjects,
        suggestedFollowups,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Error in /api/chat:', err);
      res.status(500).json({
        error: err.message || 'An error occurred processing the chat request.',
      });
    }
  });

  // --- API ROUTE 2: Parse Unstructured Text into Structured Portfolio Data ---
  app.post('/api/ingest', async (req, res) => {
    try {
      const { rawText } = req.body;
      if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
        res.status(400).json({ error: 'Please provide raw unstructured text.' });
        return;
      }

      const prompt = `You are a resume and portfolio parser. Analyze the following unstructured raw developer text, resume, or project list, and extract/structure it into valid Portfolio JSON.

RAW TEXT:
${rawText}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              developerName: { type: Type.STRING },
              title: { type: Type.STRING },
              bio: { type: Type.STRING },
              location: { type: Type.STRING },
              yearsOfExperience: { type: Type.NUMBER },
              contactEmail: { type: Type.STRING },
              githubUrl: { type: Type.STRING },
              linkedinUrl: { type: Type.STRING },
              keyAchievements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              skills: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    skills: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['category', 'skills'],
                },
              },
              projects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    role: { type: Type.STRING },
                    description: { type: Type.STRING },
                    techStack: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    impactMetrics: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    challengesSolved: { type: Type.STRING },
                    codeSnippet: { type: Type.STRING },
                    githubUrl: { type: Type.STRING },
                    liveUrl: { type: Type.STRING },
                    featured: { type: Type.BOOLEAN },
                  },
                  required: [
                    'id',
                    'title',
                    'role',
                    'description',
                    'techStack',
                    'impactMetrics',
                    'challengesSolved',
                  ],
                },
              },
              workExperience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    role: { type: Type.STRING },
                    period: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    highlights: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: [
                    'company',
                    'role',
                    'period',
                    'summary',
                    'highlights',
                  ],
                },
              },
            },
            required: [
              'developerName',
              'title',
              'bio',
              'skills',
              'projects',
              'workExperience',
              'keyAchievements',
            ],
          },
        },
      });

      const parsedData = JSON.parse(response.text || '{}');
      res.json({ success: true, parsedData });
    } catch (err: any) {
      console.error('Error in /api/ingest:', err);
      res
        .status(500)
        .json({ error: err.message || 'Failed to parse unstructured text.' });
    }
  });

  // --- API ROUTE 3: Synthesize AI Insights & Pitch Variants ---
  app.post('/api/insights', async (req, res) => {
    try {
      const pData = (req.body.portfolioData && req.body.portfolioData.skills?.length)
        ? req.body.portfolioData
        : defaultPortfolioData;

      const prompt = `Synthesize candidate insights, unique value proposition (UVP), elevator pitches, and behavioral interview Q&As based on this developer portfolio:

${JSON.stringify(pData, null, 2)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              personaSummary: { type: Type.STRING },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              growthAreas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              uniqueValueProp: { type: Type.STRING },
              pitchVariants: {
                type: Type.OBJECT,
                properties: {
                  linkedinBio: { type: Type.STRING },
                  elevatorPitch: { type: Type.STRING },
                  recruiterEmailIntro: { type: Type.STRING },
                  technicalLeadSummary: { type: Type.STRING },
                },
                required: [
                  'linkedinBio',
                  'elevatorPitch',
                  'recruiterEmailIntro',
                  'technicalLeadSummary',
                ],
              },
              interviewQA: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    suggestedAnswer: { type: Type.STRING },
                    keyProjectToMention: { type: Type.STRING },
                  },
                  required: [
                    'question',
                    'suggestedAnswer',
                    'keyProjectToMention',
                  ],
                },
              },
            },
            required: [
              'personaSummary',
              'strengths',
              'growthAreas',
              'uniqueValueProp',
              'pitchVariants',
              'interviewQA',
            ],
          },
        },
      });

      const insights = JSON.parse(response.text || '{}');
      res.json({ success: true, insights });
    } catch (err: any) {
      console.error('Error in /api/insights:', err);
      res.status(500).json({
        error: err.message || 'Failed to synthesize portfolio insights.',
      });
    }
  });

  // --- API ROUTE 4: Match Candidate with Job Description ---
  app.post('/api/match-job', async (req, res) => {
    try {
      const { portfolioData, jobDescription } = req.body;
      if (!jobDescription) {
        res.status(400).json({ error: 'Job description text is required.' });
        return;
      }

      const pData = (portfolioData && portfolioData.skills?.length) ? portfolioData : defaultPortfolioData;

      const prompt = `Evaluate the candidate match against the target Job Description.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE PORTFOLIO DATA:
${JSON.stringify(pData, null, 2)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchScore: {
                type: Type.NUMBER,
                description: 'Match score between 0 and 100',
              },
              overallVerdict: { type: Type.STRING },
              matchingSkills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              missingSkills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              topProjectsToHighlight: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    projectTitle: { type: Type.STRING },
                    relevanceReason: { type: Type.STRING },
                  },
                  required: ['projectTitle', 'relevanceReason'],
                },
              },
              customPitchBulletPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendedPreparation: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'matchScore',
              'overallVerdict',
              'matchingSkills',
              'missingSkills',
              'topProjectsToHighlight',
              'customPitchBulletPoints',
              'recommendedPreparation',
            ],
          },
        },
      });

      const matchResult = JSON.parse(response.text || '{}');
      res.json({ success: true, matchResult });
    } catch (err: any) {
      console.error('Error in /api/match-job:', err);
      res.status(500).json({
        error: err.message || 'Failed to analyze job description match.',
      });
    }
  });

  // --- API ROUTE 5: Serves Embeddable JS Widget Script for GitHub Pages ---
  app.get('/portfolio-ai-widget.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Self-contained embed script
    const widgetScript = `
(function() {
  if (window.__portfolioAiWidgetLoaded) return;
  window.__portfolioAiWidgetLoaded = true;

  // Find script element and attributes
  const currentScript = document.currentScript || Array.from(document.querySelectorAll('script')).pop();
  const backendUrl = (currentScript && currentScript.getAttribute('data-api-url')) || window.location.origin;
  const devName = (currentScript && currentScript.getAttribute('data-dev-name')) || 'Dr Lilia Potseluyko';
  const primaryColor = (currentScript && currentScript.getAttribute('data-color')) || '#1DCD9F';

  // Inject Widget CSS
  const style = document.createElement('style');
  style.textContent = \`
    .pai-widget-container { position: fixed; bottom: 24px; right: 24px; z-index: 99999; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .pai-widget-btn { width: 56px; height: 56px; border-radius: 50%; background: \${primaryColor}; color: white; border: none; cursor: pointer; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease; }
    .pai-widget-btn:hover { transform: scale(1.05); }
    .pai-widget-modal { display: none; width: 380px; height: 540px; background: #ffffff; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); position: absolute; bottom: 70px; right: 0; flex-direction: column; overflow: hidden; border: 1px solid #e5e7eb; }
    .pai-widget-modal.pai-open { display: flex; }
    .pai-widget-header { background: \${primaryColor}; color: white; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; }
    .pai-widget-title { font-weight: 600; font-size: 15px; margin: 0; }
    .pai-widget-subtitle { font-size: 11px; opacity: 0.85; margin: 2px 0 0 0; }
    .pai-widget-messages { flex: 1; padding: 14px; overflow-y: auto; background: #f9fafb; display: flex; flex-direction: column; gap: 10px; font-size: 13px; }
    .pai-msg { max-width: 85%; padding: 10px 14px; border-radius: 12px; line-height: 1.4; word-break: break-word; }
    .pai-msg-user { align-self: flex-end; background: \${primaryColor}; color: white; border-bottom-right-radius: 2px; }
    .pai-msg-bot { align-self: flex-start; background: #ffffff; color: #1f2937; border: 1px solid #e5e7eb; border-bottom-left-radius: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .pai-widget-input-row { padding: 10px; background: white; border-top: 1px solid #e5e7eb; display: flex; gap: 6px; }
    .pai-widget-input { flex: 1; border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 12px; font-size: 13px; outline: none; }
    .pai-widget-input:focus { border-color: \${primaryColor}; }
    .pai-widget-send { background: \${primaryColor}; color: white; border: none; border-radius: 8px; padding: 0 14px; font-weight: 600; cursor: pointer; }
  \`;
  document.head.appendChild(style);

  // Widget DOM
  const container = document.createElement('div');
  container.className = 'pai-widget-container';
  container.innerHTML = \`
    <div class="pai-widget-modal" id="paiModal">
      <div class="pai-widget-header">
        <div>
          <div class="pai-widget-title">\${devName} AI Assistant</div>
          <div class="pai-widget-subtitle">Ask about projects, skills, or experience</div>
        </div>
        <button id="paiCloseBtn" style="background:none;border:none;color:white;font-size:18px;cursor:pointer;">&times;</button>
      </div>
      <div class="pai-widget-messages" id="paiMessages">
        <div class="pai-msg pai-msg-bot">Hello! I am \${devName}'s interactive AI assistant. Ask me anything about project history, technical skills, or work background!</div>
      </div>
      <div class="pai-widget-input-row">
        <input type="text" id="paiInput" class="pai-widget-input" placeholder="Ask a question..." />
        <button id="paiSendBtn" class="pai-widget-send">Send</button>
      </div>
    </div>
    <button class="pai-widget-btn" id="paiToggleBtn" title="Chat with Portfolio AI">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    </button>
  \`;
  document.body.appendChild(container);

  // Event Handlers
  const toggleBtn = document.getElementById('paiToggleBtn');
  const closeBtn = document.getElementById('paiCloseBtn');
  const modal = document.getElementById('paiModal');
  const messagesDiv = document.getElementById('paiMessages');
  const inputEl = document.getElementById('paiInput');
  const sendBtn = document.getElementById('paiSendBtn');

  toggleBtn.onclick = function() { modal.classList.toggle('pai-open'); };
  closeBtn.onclick = function() { modal.classList.remove('pai-open'); };

  async function sendQuery() {
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';

    // Append user msg
    const userDiv = document.createElement('div');
    userDiv.className = 'pai-msg pai-msg-user';
    userDiv.textContent = text;
    messagesDiv.appendChild(userDiv);

    // Bot typing
    const botDiv = document.createElement('div');
    botDiv.className = 'pai-msg pai-msg-bot';
    botDiv.textContent = 'Thinking...';
    messagesDiv.appendChild(botDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
      const res = await fetch(backendUrl + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, mode: 'recruiter' })
      });
      const data = await res.json();
      botDiv.textContent = data.text || 'Sorry, I could not process your query.';
    } catch (err) {
      botDiv.textContent = 'Network error contacting backend AI server.';
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  sendBtn.onclick = sendQuery;
  inputEl.onkeypress = function(e) { if (e.key === 'Enter') sendQuery(); };
})();
    `;
    res.send(widgetScript);
  });

  // Serve Frontend Assets in Production or Dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

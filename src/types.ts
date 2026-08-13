export interface Project {
  id: string;
  title: string;
  role: string;
  description: string;
  techStack: string[];
  impactMetrics: string[];
  challengesSolved: string;
  codeSnippet?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface WorkExperience {
  company: string;
  role: string;
  period: string;
  summary: string;
  highlights: string[];
}

export interface PortfolioData {
  developerName: string;
  title: string;
  bio: string;
  location: string;
  yearsOfExperience: number;
  contactEmail: string;
  githubUrl: string;
  linkedinUrl: string;
  skills: SkillCategory[];
  projects: Project[];
  workExperience: WorkExperience[];
  rawUnstructuredText?: string;
  keyAchievements: string[];
}

export type ChatMode = 'recruiter' | 'tech_deepdive' | 'job_match' | 'general';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestedFollowups?: string[];
  referencedProjects?: string[];
  mode?: ChatMode;
}

export interface InsightsData {
  personaSummary: string;
  strengths: string[];
  growthAreas: string[];
  uniqueValueProp: string;
  pitchVariants: {
    linkedinBio: string;
    elevatorPitch: string;
    recruiterEmailIntro: string;
    technicalLeadSummary: string;
  };
  interviewQA: {
    question: string;
    suggestedAnswer: string;
    keyProjectToMention: string;
  }[];
}

export interface JobMatchResult {
  matchScore: number;
  overallVerdict: string;
  matchingSkills: string[];
  missingSkills: string[];
  topProjectsToHighlight: {
    projectTitle: string;
    relevanceReason: string;
  }[];
  customPitchBulletPoints: string[];
  recommendedPreparation: string[];
}

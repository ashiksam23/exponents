export interface Source {
  uri: string;
  title: string;
}

export type Theme = 'light' | 'dark';

export interface Concept {
  title: string;
  hook: string;
  rationale: string; // Now expected to be an HTML string
  organicLeads: number;
  paidLeads: number;
  leadsRationale: string;
  sources?: Source[];
}

export interface Question {
  id: number;
  text: string;
  type: 'scale_1_5' | 'multiple_choice' | 'text_short';
  options?: string[];
}

export interface Audit {
  questions: Question[];
  scoringLogic: string;
}

export interface Results {
  lowScore: string;
  midScore: string;
  highScore: string;
}

export interface Email {
  subject: string;
  body: string;
}

export interface Funnel {
  landingPageCopy: string;
  emailSequence: Email[];
}

export interface OrganicIdea {
  title: string;
  hook: string;
}

export interface PaidAd {
  platform: string;
  headline: string;
  body: string;
}

export interface PaidAdOptimization {
  platform: string;
  targeting: string;
  goals: string;
}

export interface GTM {
  organicIdeas: OrganicIdea[];
  paidAds: PaidAd[];
  paidAdOptimizations: PaidAdOptimization[];
}

export interface PackageData {
  audit: Audit;
  results: Results;
  funnel: Funnel;
  gtm: GTM;
}

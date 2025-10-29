

export type AspectRatio = '16:9' | '9:16';

export type Shot = {
  id: string;
  visuals: string;
  vo: string;
  storyboardImage?: string; // Base64
  url?: string; // URL for the generated video clip for this shot
};

export type Note = {
  id: string;
  time: number;
  text: string;
};

export type VideoAnalytics = {
  views: number;
  ctr: number; // Click-Through Rate as a percentage (e.g., 2.5)
  cpa: number; // Cost Per Acquisition in dollars (e.g., 15.75)
  retentionData: number[]; // Array of percentages [100, 95, 80, ...]
  aiAnalysis?: string; // Store for the AI-generated performance analysis
};

export type GeneratedVideoType = {
  id: string;
  shots: Shot[];
  imagePreview: string;
  voiceoverAudio?: string; // Base64
  projectId?: string;
  projectName?: string;
  clientName?: string;
  // Post-production settings
  musicTrack?: string;
  musicVolume?: number;
  voVolume?: number;
  textOverlay?: { content: string; position: string };
  showLogoOverlay?: boolean;
  notes?: Note[];
  analytics?: VideoAnalytics;
  // A/B Testing support
  isVariation?: boolean;
  variationOf?: string; // ID of the original video
};

export type ProjectType = {
  id: string;
  clientName: string;
  projectName: string;
  price: number;
  status: 'completed' | 'in-progress';
};

export type Language = 'en' | 'es';

export type User = {
  logo?: string; // Base64 data URL
};
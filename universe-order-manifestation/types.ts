export interface ManifestationInputs {
  name: string; // New field for user name
  date: string;
  time: string;
  healthGoal: string; // e.g., F1 nutrition, gym
  timeGoal: string; // e.g., 3 hours millionaire style
  contributionGoal: string; // e.g., livestream 60 people
  growthGoal: string; // e.g., transcribe 10 pages
  financialGoal: string; // e.g., create financial IQ app
  readingGoal: string; // e.g., subconscious mind book
}

export interface GeneratedContent {
  text: string;
  audioBuffer: AudioBuffer | null;
}
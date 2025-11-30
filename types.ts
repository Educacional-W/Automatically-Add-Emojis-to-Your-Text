export enum Tone {
  General = 'General',
  Animated = 'Animated',
  Formal = 'Formal',
  Witty = 'Witty',
  Romantic = 'Romantic',
}

export interface ToneOption {
  id: Tone;
  label: string;
  icon: string;
  description: string;
}

export interface ChatState {
  inputText: string;
  outputText: string;
  isLoading: boolean;
  selectedTone: Tone;
  error: string | null;
}

// Add global definition for AI Studio key selection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

import React from 'react';
import { Tone, ToneOption } from '../types';

interface ToneSelectorProps {
  selectedTone: Tone;
  onSelectTone: (tone: Tone) => void;
  disabled: boolean;
}

const tones: ToneOption[] = [
  { id: Tone.General, label: 'General', icon: 'fa-scale-balanced', description: 'Balanced & Natural' },
  { id: Tone.Animated, label: 'Animated', icon: 'fa-face-grin-stars', description: 'Fun & Energetic' },
  { id: Tone.Formal, label: 'Formal', icon: 'fa-user-tie', description: 'Professional & Subtle' },
  { id: Tone.Witty, label: 'Funny', icon: 'fa-masks-theater', description: 'Clever & Funny' },
  { id: Tone.Romantic, label: 'Romantic', icon: 'fa-heart', description: 'Warm & Loving' },
];

const ToneSelector: React.FC<ToneSelectorProps> = ({ selectedTone, onSelectTone, disabled }) => {
  return (
    <div className="space-y-3 text-center">
      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Choose Tone
      </label>
      {/* Changed to strictly justify-center to ensure orphan items (like Romantic) are always centered */}
      <div className="flex flex-wrap justify-center gap-3">
        {tones.map((tone) => {
          const isSelected = selectedTone === tone.id;
          return (
            <button
              key={tone.id}
              onClick={() => onSelectTone(tone.id)}
              disabled={disabled}
              className={`
                relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200
                flex-1 min-w-[130px] max-w-[160px]
                ${isSelected 
                  ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary-light shadow-lg shadow-primary/10 transform scale-105' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <i className={`fa-solid ${tone.icon} text-2xl mb-2 ${isSelected ? 'animate-bounce' : ''}`}></i>
              <span className="font-semibold text-sm">{tone.label}</span>
              <span className="text-[10px] opacity-70 mt-1">{tone.description}</span>
              
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ToneSelector;
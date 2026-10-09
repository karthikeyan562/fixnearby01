import React from 'react';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import { Mic, Sparkles } from 'lucide-react';

export const VoiceAssistantButton = () => {
  const { isOpen, setIsOpen, assistantState } = useVoiceAssistant();

  if (isOpen) return null; // Hide button when panel is open

  const isListening = assistantState === 'listening';

  return (
    <button
      onClick={() => setIsOpen(true)}
      className={`floating-voice-btn ${isListening ? 'mic-pulse' : ''}`}
      title="Open FixNearby Voice Helper"
      aria-label="Open Voice Assistant"
    >
      <div style={{ position: 'relative' }}>
        <Mic size={28} />
        <Sparkles size={14} style={{ position: 'absolute', top: '-4px', right: '-4px', color: '#fef08a' }} />
      </div>
    </button>
  );
};

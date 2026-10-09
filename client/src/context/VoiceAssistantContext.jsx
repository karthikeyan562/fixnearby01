import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

const VoiceAssistantContext = createContext();

export const VoiceAssistantProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [assistantState, setAssistantState] = useState('ready'); // 'ready', 'listening', 'processing', 'speaking', 'error'
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am your FixNearby Voice Helper. You can speak or type commands like "Find an electrician near me" or "My washing machine is not draining".',
      spokenText: 'Hello! I am your FixNearby Voice Helper. How can I help you today?',
    },
  ]);
  const [recognizedText, setRecognizedText] = useState('');
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [draftRequest, setDraftRequest] = useState({});
  const [confirmationCard, setConfirmationCard] = useState(null);
  const [dataResults, setDataResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef(null);

  // Initialize SpeechRecognition with feature detection
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setAssistantState('listening');
        setErrorMessage('');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setRecognizedText(transcript);
        setInputText(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('[Speech Recognition Error]', event.error);
        if (event.error !== 'no-speech') {
          setErrorMessage(`Speech recognition error (${event.error}). Please use text input fallback.`);
          setAssistantState('error');
        } else {
          setAssistantState('ready');
        }
      };

      recognition.onend = () => {
        setAssistantState((prev) => (prev === 'listening' ? 'ready' : prev));
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const speakText = (text) => {
    if (isMuted || !('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel(); // Stop ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setAssistantState('speaking');
    utterance.onend = () => setAssistantState('ready');
    utterance.onerror = () => setAssistantState('ready');

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setAssistantState('ready');
  };

  const toggleListening = () => {
    stopSpeaking();
    if (!recognitionRef.current) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use text input below.');
      return;
    }

    if (assistantState === 'listening') {
      recognitionRef.current.stop();
      setAssistantState('ready');
    } else {
      try {
        setRecognizedText('');
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  const sendMessage = async (textToSend) => {
    const finalMsg = textToSend || inputText || recognizedText;
    if (!finalMsg.trim()) return;

    stopSpeaking();
    setAssistantState('processing');
    setRecognizedText('');
    setInputText('');

    // Append user message to conversation transcript
    const userMsg = { sender: 'user', text: finalMsg };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await api.sendAssistantMessage({
        message: finalMsg,
        draftRequest,
      });

      if (res.success) {
        const assistantMsg = {
          sender: 'assistant',
          text: res.displayText,
          spokenText: res.spokenText,
          dataResults: res.dataResults || null,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setDraftRequest(res.draftRequest || {});
        setConfirmationCard(res.confirmationCard || null);
        setDataResults(res.dataResults || null);

        // Read out loud
        speakText(res.spokenText);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'assistant', text: res.error || 'Sorry, I had trouble processing your request.' },
        ]);
        setAssistantState('error');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: 'Network connection error. Please check backend server.' },
      ]);
      setAssistantState('error');
    } finally {
      if (assistantState !== 'speaking') {
        setAssistantState('ready');
      }
    }
  };

  const resetAssistantSession = () => {
    stopSpeaking();
    setDraftRequest({});
    setConfirmationCard(null);
    setDataResults(null);
    setRecognizedText('');
    setInputText('');
  };

  return (
    <VoiceAssistantContext.Provider
      value={{
        isOpen,
        setIsOpen,
        assistantState,
        messages,
        recognizedText,
        inputText,
        setInputText,
        isMuted,
        setIsMuted,
        draftRequest,
        confirmationCard,
        setConfirmationCard,
        dataResults,
        errorMessage,
        toggleListening,
        sendMessage,
        speakText,
        stopSpeaking,
        resetAssistantSession,
      }}
    >
      {children}
    </VoiceAssistantContext.Provider>
  );
};

export const useVoiceAssistant = () => useContext(VoiceAssistantContext);

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { processAssistantMessageLocal } from '../services/localAssistantService';

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
  const sendMessageRef = useRef(null);
  const currentUtteranceRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setAssistantState('listening');
          setErrorMessage('');
          finalTranscriptRef.current = '';
          interimTranscriptRef.current = '';
        };

        recognition.onresult = (event) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const part = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + part).trim();
            } else {
              interim = (interim + ' ' + part).trim();
            }
          }
          interimTranscriptRef.current = interim;
          const display = (finalTranscriptRef.current + (interim ? ' ' + interim : '')).trim();
          setRecognizedText(display);
          setInputText(display);
        };

        recognition.onerror = (event) => {
          console.warn('[Speech Recognition Error]', event.error);
          if (event.error === 'no-speech') {
            setAssistantState('ready');
          } else if (event.error === 'not-allowed') {
            setErrorMessage('Microphone access denied. Please allow microphone permissions or use text input.');
            setAssistantState('ready');
          } else if (event.error === 'network') {
            setErrorMessage('Voice recognition service timeout. You can type below or click suggested chips.');
            setAssistantState('ready');
          } else {
            setErrorMessage(`Voice recognition: ${event.error}. Please type your request.`);
            setAssistantState('ready');
          }
        };

        recognition.onend = () => {
          const finalSpoken = (finalTranscriptRef.current || interimTranscriptRef.current || '').trim();
          finalTranscriptRef.current = '';
          interimTranscriptRef.current = '';

          // Transition out of listening state
          setAssistantState((prev) => (prev === 'listening' ? 'ready' : prev));

          // If the user spoke something, automatically submit it!
          if (finalSpoken && sendMessageRef.current) {
            sendMessageRef.current(finalSpoken);
          }
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
      }
    }
  }, []);

  const speakText = (text) => {
    if (isMuted || !('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();

      // Clean out markdown formatting like ** or [link] or bullet points
      const cleanText = text
        .replace(/[*_#`~]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/https?:\/\/\S+/g, '')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select preferred natural English voice
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice =
        voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David') || v.name.includes('Zira') || v.name.includes('India'))) ||
        voices.find((v) => v.lang.startsWith('en'));

      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      utterance.onstart = () => setAssistantState('speaking');
      utterance.onend = () => setAssistantState('ready');
      utterance.onerror = (e) => {
        console.warn('[SpeechSynthesis warning]', e);
        setAssistantState('ready');
      };

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      setAssistantState('ready');
    }
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
      setErrorMessage('Speech recognition is not supported in this browser. Please type your request below.');
      return;
    }

    if (assistantState === 'listening') {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setAssistantState('ready');
    } else {
      try {
        setRecognizedText('');
        setErrorMessage('');
        finalTranscriptRef.current = '';
        interimTranscriptRef.current = '';
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech start error:', err);
        // Sometimes recognition needs an abort before starting again
        try {
          recognitionRef.current.abort();
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (e) {
              setErrorMessage('Could not restart microphone. Please type your query.');
            }
          }, 200);
        } catch (e) {
          setErrorMessage('Could not start microphone. Please type your query.');
        }
      }
    }
  };

  const sendMessage = async (textToSend) => {
    const finalMsg = (textToSend || inputText || recognizedText || '').trim();
    if (!finalMsg) return;

    stopSpeaking();
    setAssistantState('processing');
    setRecognizedText('');
    setInputText('');
    setErrorMessage('');

    // Append user message to conversation transcript
    const userMsg = { sender: 'user', text: finalMsg };
    setMessages((prev) => [...prev, userMsg]);

    try {
      let res;
      try {
        res = await api.sendAssistantMessage({
          message: finalMsg,
          draftRequest,
        });
      } catch (networkErr) {
        console.warn('Network call failed, falling back to local assistant intelligence:', networkErr);
        res = processAssistantMessageLocal({
          message: finalMsg,
          draftRequest,
        });
      }

      if (res && res.success) {
        const assistantMsg = {
          sender: 'assistant',
          text: res.displayText || res.message || 'I have processed your request.',
          spokenText: res.spokenText || res.displayText || '',
          dataResults: res.dataResults || null,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setDraftRequest(res.draftRequest || {});
        setConfirmationCard(res.confirmationCard || null);
        setDataResults(res.dataResults || null);

        // Read response out loud
        if (res.spokenText) {
          speakText(res.spokenText);
        } else {
          setAssistantState('ready');
        }
      } else {
        // Fallback to local intelligence if backend returned unsuccessful status
        const fallback = processAssistantMessageLocal({
          message: finalMsg,
          draftRequest,
        });

        const assistantMsg = {
          sender: 'assistant',
          text: fallback.displayText,
          spokenText: fallback.spokenText,
          dataResults: fallback.dataResults || null,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setDraftRequest(fallback.draftRequest || {});
        setConfirmationCard(fallback.confirmationCard || null);
        setDataResults(fallback.dataResults || null);

        if (fallback.spokenText) {
          speakText(fallback.spokenText);
        } else {
          setAssistantState('ready');
        }
      }
    } catch (err) {
      console.warn('Voice Assistant unexpected error, using local fallback:', err);
      const fallback = processAssistantMessageLocal({
        message: finalMsg,
        draftRequest,
      });

      const assistantMsg = {
        sender: 'assistant',
        text: fallback.displayText,
        spokenText: fallback.spokenText,
        dataResults: fallback.dataResults || null,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setDraftRequest(fallback.draftRequest || {});
      setConfirmationCard(fallback.confirmationCard || null);
      setDataResults(fallback.dataResults || null);

      if (fallback.spokenText) {
        speakText(fallback.spokenText);
      } else {
        setAssistantState('ready');
      }
    }
  };

  // Keep sendMessage reference updated for SpeechRecognition onend handler
  sendMessageRef.current = sendMessage;

  const resetAssistantSession = () => {
    stopSpeaking();
    setDraftRequest({});
    setConfirmationCard(null);
    setDataResults(null);
    setRecognizedText('');
    setInputText('');
    setErrorMessage('');
    setMessages([
      {
        sender: 'assistant',
        text: 'Hello! I am your FixNearby Voice Helper. You can speak or type commands like "Find an electrician near me" or "My washing machine is not draining".',
        spokenText: 'Hello! I am your FixNearby Voice Helper. How can I help you today?',
      },
    ]);
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

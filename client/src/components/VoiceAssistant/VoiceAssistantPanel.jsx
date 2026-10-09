import React, { useState } from 'react';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  X, Mic, MicOff, Volume2, VolumeX, Send, RefreshCw, Square, CheckCircle, AlertTriangle, Sparkles, MapPin, Calendar
} from 'lucide-react';

export const VoiceAssistantPanel = () => {
  const {
    isOpen,
    setIsOpen,
    assistantState,
    messages,
    recognizedText,
    inputText,
    setInputText,
    isMuted,
    setIsMuted,
    confirmationCard,
    setConfirmationCard,
    errorMessage,
    toggleListening,
    sendMessage,
    speakText,
    stopSpeaking,
    resetAssistantSession,
  } = useVoiceAssistant();

  const { isAuthenticated, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleConfirmRequest = async () => {
    if (!isAuthenticated) {
      alert('Please log in or register to submit a service request.');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createRequest(confirmationCard);
      if (res.success) {
        setSubmitSuccess('Service request posted successfully!');
        setConfirmationCard(null);
        setTimeout(() => {
          setIsOpen(false);
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStateBadge = () => {
    switch (assistantState) {
      case 'listening':
        return <span className="badge" style={{ background: '#dbeafe', color: '#1e40af' }}>Listening...</span>;
      case 'processing':
        return <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>Processing...</span>;
      case 'speaking':
        return <span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>Speaking</span>;
      case 'error':
        return <span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>Error</span>;
      default:
        return <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>Ready</span>;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '420px',
        maxWidth: 'calc(100vw - 32px)',
        height: '600px',
        maxHeight: 'calc(100vh - 48px)',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
        border: '1px solid var(--surface-border)',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e40af, #2563eb)',
          color: '#ffffff',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.4rem', borderRadius: '50%' }}>
            <Sparkles size={20} color="#fef08a" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>FixNearby Voice Helper</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
              {getStateBadge()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.3rem' }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            onClick={stopSpeaking}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.3rem' }}
            title="Stop Speaking"
          >
            <Square size={16} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.3rem' }}
            title="Close Assistant"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Warning/Error Banner */}
      {errorMessage && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertTriangle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Messages Transcript */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc' }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: msg.sender === 'user' ? 'var(--primary)' : '#ffffff',
              color: msg.sender === 'user' ? '#ffffff' : 'var(--text-main)',
              padding: '0.75rem 1rem',
              borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
              boxShadow: msg.sender === 'assistant' ? 'var(--shadow-sm)' : 'none',
              border: msg.sender === 'assistant' ? '1px solid var(--surface-border)' : 'none',
              fontSize: '0.9rem',
              whiteSpace: 'pre-line',
            }}
          >
            {msg.text}

            {msg.spokenText && msg.sender === 'assistant' && (
              <button
                onClick={() => speakText(msg.spokenText)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: '600' }}
              >
                <Volume2 size={12} /> Replay Audio
              </button>
            )}
          </div>
        ))}

        {/* Listening Animation Indicator */}
        {assistantState === 'listening' && (
          <div style={{ alignSelf: 'flex-start', background: '#eff6ff', padding: '0.6rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #bfdbfe' }}>
            <div className="mic-pulse" style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }}></div>
            <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
              {recognizedText ? `"${recognizedText}"` : 'Listening to your voice... Speak now'}
            </span>
          </div>
        )}

        {/* Confirmation Card for Guided Service Request */}
        {confirmationCard && (
          <div style={{ background: '#ffffff', border: '2px solid var(--primary)', borderRadius: '12px', padding: '1rem', marginTop: '0.5rem', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              <CheckCircle size={18} /> Confirm Service Request
            </div>

            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.85rem' }}>
              <div><strong>Category:</strong> {confirmationCard.category}</div>
              <div><strong>Description:</strong> {confirmationCard.description}</div>
              <div><strong>Location:</strong> {confirmationCard.serviceLocation.city}, {confirmationCard.serviceLocation.locality}</div>
              <div><strong>Urgency:</strong> <span className="badge badge-open">{confirmationCard.urgency}</span></div>
            </div>

            <button
              onClick={handleConfirmRequest}
              disabled={submitting}
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
            >
              {submitting ? 'Submitting...' : 'Confirm & Submit Request'}
            </button>
          </div>
        )}

        {submitSuccess && (
          <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center', fontWeight: '600' }}>
            {submitSuccess}
          </div>
        )}
      </div>

      {/* Suggested Command Chips */}
      <div style={{ padding: '0.5rem 1rem', background: '#ffffff', borderTop: '1px solid var(--surface-border)', display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
        <button
          onClick={() => sendMessage('Find an electrician near me')}
          style={{ background: '#f1f5f9', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', color: 'var(--text-main)', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          💡 Electrician near me
        </button>
        <button
          onClick={() => sendMessage('My washing machine is not draining')}
          style={{ background: '#f1f5f9', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', color: 'var(--text-main)', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          🔧 Washing machine leak
        </button>
        <button
          onClick={() => sendMessage('Show my active bookings')}
          style={{ background: '#f1f5f9', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', color: 'var(--text-main)', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          📅 Show my bookings
        </button>
      </div>

      {/* Input Control Bar */}
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--surface-border)', background: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={toggleListening}
          style={{
            background: assistantState === 'listening' ? 'var(--danger)' : 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          title={assistantState === 'listening' ? 'Stop Listening' : 'Start Voice Input'}
        >
          {assistantState === 'listening' ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Speak or type your service need..."
          style={{ flex: 1, padding: '0.6rem 0.85rem', border: '1px solid var(--surface-border)', borderRadius: '20px', fontSize: '0.9rem' }}
        />

        <button
          onClick={() => sendMessage()}
          disabled={!inputText.trim()}
          style={{
            background: 'none',
            border: 'none',
            color: inputText.trim() ? 'var(--primary)' : '#cbd5e1',
            cursor: inputText.trim() ? 'pointer' : 'default',
            padding: '0.4rem',
          }}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

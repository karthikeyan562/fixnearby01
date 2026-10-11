import React, { useState, useEffect, useRef } from 'react';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  X, Mic, MicOff, Volume2, VolumeX, Send, RotateCcw, Square, CheckCircle,
  AlertTriangle, Sparkles, MapPin, Calendar, Star, Phone, ShieldCheck,
  Wrench, ExternalLink, ArrowRight
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
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to bottom whenever messages or status updates
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, assistantState, confirmationCard, isOpen]);

  if (!isOpen) return null;

  const handleConfirmRequest = async () => {
    setSubmitting(true);
    setSubmitSuccess(null);
    try {
      const res = await api.createRequest(confirmationCard);
      if (res && res.success) {
        setSubmitSuccess('🎉 Service request posted successfully! Nearby verified pros have been notified.');
        setConfirmationCard(null);
        setTimeout(() => {
          if (isAuthenticated) {
            setIsOpen(false);
            navigate('/dashboard');
          }
        }, 2200);
      } else {
        alert(res?.error || 'Could not submit request. Please try again.');
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
        return (
          <span
            className="badge"
            style={{
              background: '#dbeafe',
              color: '#1e40af',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb', animation: 'pulse 1.2s infinite' }}></span>
            Listening...
          </span>
        );
      case 'processing':
        return (
          <span
            className="badge"
            style={{
              background: '#fef3c7',
              color: '#92400e',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
            }}
          >
            Processing...
          </span>
        );
      case 'speaking':
        return (
          <span
            className="badge"
            style={{
              background: '#dcfce7',
              color: '#166534',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
            }}
          >
            <Volume2 size={12} /> Speaking
          </span>
        );
      case 'error':
        return (
          <span
            className="badge"
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
            }}
          >
            Notice
          </span>
        );
      default:
        return (
          <span
            className="badge"
            style={{
              background: '#f1f5f9',
              color: '#475569',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
            }}
          >
            Ready
          </span>
        );
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '430px',
        maxWidth: 'calc(100vw - 32px)',
        height: '620px',
        maxHeight: 'calc(100vh - 48px)',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08)',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'inherit',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
          color: '#ffffff',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.45rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={18} color="#fef08a" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: '700', margin: 0, color: '#ffffff' }}>FixNearby Voice Helper</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '3px' }}>
              {getStateBadge()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <button
            onClick={resetAssistantSession}
            style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', padding: '0.35rem', borderRadius: '6px' }}
            title="Reset Chat"
          >
            <RotateCcw size={17} />
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', padding: '0.35rem', borderRadius: '6px' }}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={18} color="#fca5a5" /> : <Volume2 size={18} />}
          </button>
          {assistantState === 'speaking' && (
            <button
              onClick={stopSpeaking}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.35rem', borderRadius: '6px' }}
              title="Stop Audio"
            >
              <Square size={15} />
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', padding: '0.35rem', borderRadius: '6px' }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Warning/Error Banner */}
      {errorMessage && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.55rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #fee2e2' }}>
          <AlertTriangle size={15} color="#dc2626" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Messages Transcript */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: '#f8fafc' }}>
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={idx}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <div
                style={{
                  background: isUser ? '#2563eb' : '#ffffff',
                  color: isUser ? '#ffffff' : '#1e293b',
                  padding: '0.75rem 1rem',
                  borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  boxShadow: isUser ? '0 4px 12px rgba(37,99,235,0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
                  border: isUser ? 'none' : '1px solid #e2e8f0',
                  fontSize: '0.88rem',
                  lineHeight: '1.45',
                  whiteSpace: 'pre-line',
                }}
              >
                {msg.text}

                {!isUser && msg.spokenText && (
                  <div style={{ marginTop: '0.45rem', paddingTop: '0.4rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center' }}>
                    <button
                      onClick={() => speakText(msg.spokenText)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}
                    >
                      <Volume2 size={13} /> Replay voice
                    </button>
                  </div>
                )}
              </div>

              {/* Render Provider Cards inside chat transcript if present in msg.dataResults */}
              {!isUser && Array.isArray(msg.dataResults) && msg.dataResults.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {msg.dataResults.map((provider) => {
                    const phone = provider.userId?.phone || provider.businessPhone || '';
                    const city = provider.userId?.location?.city || provider.serviceAreas?.[0]?.city || 'Local Area';
                    const rating = provider.averageRating || 4.8;
                    const reviews = provider.reviewCount || 20;
                    const name = provider.businessName || provider.userId?.name || 'Verified Technician';
                    const category = provider.serviceCategories?.[0] || 'Service Pro';

                    return (
                      <div
                        key={provider._id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '0.75rem',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>{name}</h4>
                              <ShieldCheck size={14} color="#16a34a" title="Verified Provider" />
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {category} • {city}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: '#fef9c3', padding: '0.2rem 0.45rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', color: '#854d0e' }}>
                            <Star size={11} fill="#eab308" color="#eab308" />
                            <span>{rating}</span>
                            <span style={{ fontSize: '0.7rem', color: '#a16207', fontWeight: 'normal' }}>({reviews})</span>
                          </div>
                        </div>

                        {provider.indicativePriceRange && (
                          <div style={{ fontSize: '0.78rem', color: '#334155', marginBottom: '0.5rem' }}>
                            Starting: <strong>₹{provider.indicativePriceRange.min} - ₹{provider.indicativePriceRange.max}</strong>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                          {phone && (
                            <a
                              href={`tel:${phone}`}
                              style={{
                                flex: 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.3rem',
                                background: '#16a34a',
                                color: '#ffffff',
                                textDecoration: 'none',
                                padding: '0.35rem 0.6rem',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: '600',
                              }}
                            >
                              <Phone size={12} /> Call Pro
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              navigate(`/providers/${provider._id}`);
                            }}
                            style={{
                              flex: 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.3rem',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              padding: '0.35rem 0.6rem',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            <ExternalLink size={12} /> View Profile
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Listening Animation Indicator */}
        {assistantState === 'listening' && (
          <div
            style={{
              alignSelf: 'flex-start',
              background: '#eff6ff',
              padding: '0.7rem 1rem',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              border: '1px solid #bfdbfe',
              boxShadow: '0 2px 8px rgba(37,99,235,0.1)',
            }}
          >
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb', boxShadow: '0 0 0 4px rgba(37,99,235,0.25)' }}></div>
            <div>
              <div style={{ fontSize: '0.82rem', color: '#1e40af', fontWeight: '700' }}>
                {recognizedText ? `"${recognizedText}"` : 'Listening to your voice... Speak now'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#60a5fa' }}>Pausing automatically submits your request</div>
            </div>
          </div>
        )}

        {/* Confirmation Card for Guided Service Request */}
        {confirmationCard && (
          <div
            style={{
              background: '#ffffff',
              border: '2px solid #2563eb',
              borderRadius: '14px',
              padding: '1rem',
              marginTop: '0.4rem',
              boxShadow: '0 4px 14px rgba(37,99,235,0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#1e40af', fontWeight: '700', fontSize: '0.92rem', marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={18} color="#2563eb" /> Ready to Post Service Request
              </div>
              <button
                onClick={() => setConfirmationCard(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: '0.84rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.85rem', color: '#334155' }}>
              <div><strong>Category:</strong> {confirmationCard.category}</div>
              <div><strong>Problem:</strong> {confirmationCard.description}</div>
              <div>
                <strong>Location:</strong> {confirmationCard.serviceLocation?.city || confirmationCard.city || 'Coimbatore'}, {confirmationCard.serviceLocation?.locality || 'Town Hall'}
              </div>
              <div>
                <strong>Urgency:</strong>{' '}
                <span
                  style={{
                    background: confirmationCard.urgency === 'emergency' ? '#fee2e2' : '#f1f5f9',
                    color: confirmationCard.urgency === 'emergency' ? '#991b1b' : '#334155',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                  }}
                >
                  {confirmationCard.urgency || 'medium'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleConfirmRequest}
                disabled={submitting}
                style={{
                  flex: 1,
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                {submitting ? 'Submitting...' : 'Confirm & Post Request'}
                {!submitting && <ArrowRight size={14} />}
              </button>
            </div>
          </div>
        )}

        {submitSuccess && (
          <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem', borderRadius: '10px', fontSize: '0.84rem', textAlign: 'center', fontWeight: '600', border: '1px solid #bbf7d0' }}>
            {submitSuccess}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Command Chips */}
      <div style={{ padding: '0.55rem 0.85rem', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
        <button
          onClick={() => sendMessage('Find an electrician near me')}
          style={{ background: '#f1f5f9', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '12px', fontSize: '0.76rem', color: '#334155', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '500' }}
        >
          ⚡ Electrician near me
        </button>
        <button
          onClick={() => sendMessage('My washing machine is leaking water')}
          style={{ background: '#f1f5f9', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '12px', fontSize: '0.76rem', color: '#334155', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '500' }}
        >
          🔧 Washing machine leak
        </button>
        <button
          onClick={() => sendMessage('AC is not cooling properly')}
          style={{ background: '#f1f5f9', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '12px', fontSize: '0.76rem', color: '#334155', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '500' }}
        >
          ❄️ AC not cooling
        </button>
        <button
          onClick={() => sendMessage('Show my active bookings')}
          style={{ background: '#f1f5f9', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '12px', fontSize: '0.76rem', color: '#334155', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '500' }}
        >
          📅 Show my bookings
        </button>
        <button
          onClick={() => sendMessage('How does FixNearby work?')}
          style={{ background: '#f1f5f9', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '12px', fontSize: '0.76rem', color: '#334155', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '500' }}
        >
          ❓ How it works
        </button>
      </div>

      {/* Input Control Bar */}
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
        <button
          onClick={toggleListening}
          style={{
            background: assistantState === 'listening' ? '#ef4444' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: assistantState === 'listening' ? '0 0 0 4px rgba(239, 68, 68, 0.3)' : '0 2px 6px rgba(37,99,235,0.3)',
            transition: 'all 0.2s ease',
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
          placeholder={assistantState === 'listening' ? 'Listening to speech...' : 'Speak or type your service need...'}
          style={{
            flex: 1,
            padding: '0.65rem 0.95rem',
            border: '1px solid #cbd5e1',
            borderRadius: '24px',
            fontSize: '0.88rem',
            outline: 'none',
          }}
        />

        <button
          onClick={() => sendMessage()}
          disabled={!inputText.trim()}
          style={{
            background: inputText.trim() ? '#2563eb' : '#e2e8f0',
            border: 'none',
            color: inputText.trim() ? '#ffffff' : '#94a3b8',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputText.trim() ? 'pointer' : 'default',
            flexShrink: 0,
            transition: 'background 0.2s ease',
          }}
          title="Send Message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

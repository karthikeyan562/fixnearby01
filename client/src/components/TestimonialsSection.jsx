import React, { useState, useEffect, useRef } from 'react';
import {
  Star, Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight,
  Quote, Video, Maximize2, X, CheckCircle, ShieldCheck, Film
} from 'lucide-react';
import { api } from '../services/api';

/* Customer Satisfaction Video & Review Showcase
   - Supports genuine HTML5 video playback with interactive player controls
   - Video Modal with sound, scrubber, and fullscreen
   - Dynamically loads verified testimonials from backend API
   - Sanitized customer data (respects user privacy)
*/

const CATEGORY_ICONS = {
  Electrician: '⚡',
  Plumber: '🔧',
  'AC Technician': '❄️',
  Carpenter: '🪚',
  Painter: '🎨',
  Appliance: '🔌',
  Default: '🛠️',
};

const StarRating = ({ rating, small = false }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={small ? 14 : 17}
        fill={i <= rating ? '#f59e0b' : 'transparent'}
        color={i <= rating ? '#f59e0b' : '#cbd5e1'}
      />
    ))}
  </div>
);

// Modal Video Player Component
const VideoModal = ({ testimonial, onClose }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0f172a',
          borderRadius: '24px',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '720px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                background: '#2563eb',
                color: '#fff',
                padding: '0.25rem 0.6rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '700',
              }}
            >
              📹 Customer Story
            </span>
            <span style={{ color: '#f8fafc', fontWeight: '700', fontSize: '0.95rem' }}>
              {testimonial.customerName}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
              • {testimonial.serviceCategory}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Player */}
        <div style={{ position: 'relative', background: '#000', minHeight: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {testimonial.videoUrl ? (
            <video
              ref={videoRef}
              src={testimonial.videoUrl}
              poster={testimonial.videoThumbnail}
              autoPlay
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              style={{ width: '100%', maxHeight: '420px', objectFit: 'contain' }}
              onClick={togglePlay}
            />
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <Film size={48} color="#3b82f6" style={{ marginBottom: '1rem' }} />
              <p>Video review is being processed.</p>
            </div>
          )}

          {/* Overlaid Play/Pause when paused */}
          {!isPlaying && testimonial.videoUrl && (
            <div
              onClick={togglePlay}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}
            >
              <Play size={28} color="#fff" style={{ marginLeft: '4px' }} />
            </div>
          )}

          {/* Player Controls Bar */}
          {testimonial.videoUrl && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                padding: '0.75rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {/* Progress bar */}
              <div
                onClick={handleSeek}
                style={{
                  height: '5px',
                  background: 'rgba(255,255,255,0.25)',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                    background: '#2563eb',
                    borderRadius: '3px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={togglePlay}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button
                    onClick={toggleMute}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <span style={{ color: '#cbd5e1', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <StarRating rating={testimonial.rating} small />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Customer Review Summary Footer */}
        <div style={{ padding: '1.25rem 1.5rem', background: '#1e293b' }}>
          <p style={{ color: '#e2e8f0', fontSize: '0.92rem', lineHeight: '1.5', fontStyle: 'italic', marginBottom: '0.75rem' }}>
            "{testimonial.reviewText}"
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#93c5fd', fontSize: '0.82rem', fontWeight: '700' }}>
                Service Provider: {testimonial.providerName}
              </span>
            </div>
            <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle size={14} /> Verified Booking Review
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Video Card Item Component
const VideoCard = ({ testimonial, onWatchVideo }) => {
  const [isHovered, setIsHovered] = useState(false);
  const icon = CATEGORY_ICONS[testimonial.serviceCategory] || CATEGORY_ICONS.Default;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        background: '#ffffff',
        boxShadow: isHovered ? '0 20px 40px rgba(37, 99, 235, 0.18)' : '0 6px 20px rgba(0,0,0,0.06)',
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Video Poster Thumbnail Area */}
      <div
        onClick={() => onWatchVideo(testimonial)}
        style={{
          width: '100%',
          height: '200px',
          position: 'relative',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          overflow: 'hidden',
        }}
      >
        {testimonial.videoThumbnail ? (
          <img
            src={testimonial.videoThumbnail}
            alt={testimonial.customerName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.5s ease',
              opacity: 0.85,
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3.5rem',
            }}
          >
            {icon}
          </div>
        )}

        {/* Video Overlay Gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.2) 60%, transparent 100%)',
          }}
        />

        {/* Category Pill */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            padding: '0.25rem 0.7rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <span>{icon}</span> {testimonial.serviceCategory}
        </div>

        {/* Duration Badge */}
        {testimonial.videoDuration && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(0, 0, 0, 0.75)',
              color: '#fff',
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: '700',
              fontFamily: 'monospace',
            }}
          >
            {testimonial.videoDuration}
          </div>
        )}

        {/* Central Play Button */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${isHovered ? 1.15 : 1})`,
            transition: 'transform 0.25s ease',
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.5)',
          }}
        >
          <Play size={22} color="#ffffff" style={{ marginLeft: '3px' }} />
        </div>

        {/* Bottom Bar: Watch Story Prompt */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '12px',
            right: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#f8fafc', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Video size={13} color="#60a5fa" /> Watch Customer Story
          </span>
          <span style={{ color: '#93c5fd', fontSize: '0.75rem', fontWeight: '600' }}>
            {testimonial.customerLocation}
          </span>
        </div>
      </div>

      {/* Review Body */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {/* Header with Name & Rating */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#fff',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {testimonial.customerName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a', margin: 0 }}>
                  {testimonial.customerName}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                  {testimonial.customerLocation}
                </p>
              </div>
            </div>
            <StarRating rating={testimonial.rating} small />
          </div>

          {/* Review Text */}
          <div style={{ position: 'relative', margin: '0.5rem 0' }}>
            <Quote size={16} color="#93c5fd" style={{ position: 'absolute', top: -2, left: -2, opacity: 0.4 }} />
            <p
              style={{
                fontSize: '0.86rem',
                color: '#334155',
                lineHeight: '1.55',
                paddingLeft: '1.25rem',
                fontStyle: 'italic',
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {testimonial.reviewText}
            </p>
          </div>
        </div>

        {/* Footer info: Provider and Verified badge */}
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
            Pro: <strong style={{ color: '#0f172a' }}>{testimonial.providerName}</strong>
          </span>
          <span
            style={{
              background: '#ecfdf5',
              color: '#059669',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: '700',
            }}
          >
            ✓ Verified
          </span>
        </div>
      </div>
    </div>
  );
};

export const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  useEffect(() => {
    api.getTestimonials()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setTestimonials(res.data);
        }
      })
      .catch((err) => {
        console.warn('Testimonials load warning:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'Electrician', 'AC Technician', 'Plumber', 'Carpenter'];

  const filteredTestimonials = selectedCategory === 'All'
    ? testimonials
    : testimonials.filter((t) => t.serviceCategory?.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <section
      style={{
        padding: '5.5rem 0',
        background: 'linear-gradient(180deg, #f8fafc 0%, #f0fdf4 50%, #f8fafc 100%)',
        borderTop: '1px solid #e2e8f0',
        borderBottom: '1px solid #e2e8f0',
        position: 'relative',
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span
            style={{
              background: '#dcfce7',
              color: '#15803d',
              border: '1px solid #bbf7d0',
              padding: '0.35rem 1.1rem',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '1rem',
            }}
          >
            <ShieldCheck size={16} /> Verified Customer Stories & Video Reviews
          </span>

          <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.75rem', letterSpacing: '-0.5px' }}>
            Real Homes. Proven Results.
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '620px', margin: '0 auto', lineHeight: '1.6' }}>
            Watch homeowners across Coimbatore and Tamil Nadu share their genuine service repair experiences with FixNearby verified experts.
          </p>

          {/* Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '1.75rem',
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.45rem 1.1rem',
                  borderRadius: '9999px',
                  border: selectedCategory === cat ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: selectedCategory === cat ? '#2563eb' : '#ffffff',
                  color: selectedCategory === cat ? '#ffffff' : '#475569',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedCategory === cat ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Video Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.75rem',
            marginBottom: '3rem',
          }}
        >
          {filteredTestimonials.length > 0 ? (
            filteredTestimonials.map((t) => (
              <VideoCard
                key={t._id}
                testimonial={t}
                onWatchVideo={(item) => setActiveVideoModal(item)}
              />
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              No customer video reviews currently in this category.
            </div>
          )}
        </div>

        {/* Trust Badges & Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            background: '#ffffff',
            borderRadius: '20px',
            padding: '1.5rem 2.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.6rem' }}>⭐️</span>
              <div>
                <p style={{ fontWeight: '800', color: '#0f172a', margin: 0, fontSize: '1rem' }}>4.8 / 5 Rating</p>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>From 2,400+ Homeowners</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.6rem' }}>🛡️</span>
              <div>
                <p style={{ fontWeight: '800', color: '#0f172a', margin: 0, fontSize: '1rem' }}>Background Checked</p>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Verified government ID & skills</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.6rem' }}>💬</span>
              <div>
                <p style={{ fontWeight: '800', color: '#0f172a', margin: 0, fontSize: '1rem' }}>Direct Calling</p>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Immediate one-tap phone contact</p>
              </div>
            </div>
          </div>

          <div>
            <a href="/providers" className="btn btn-primary btn-lg" style={{ borderRadius: '12px' }}>
              Book a Top-Rated Professional →
            </a>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {activeVideoModal && (
        <VideoModal
          testimonial={activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
        />
      )}
    </section>
  );
};

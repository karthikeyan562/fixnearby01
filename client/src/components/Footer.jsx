import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ background: 'var(--secondary)', color: '#94a3b8', paddingTop: '4rem', paddingBottom: '2rem', marginTop: '4rem' }}>
      <div className="container">
        <div className="grid-4" style={{ marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--primary)', color: '#fff', padding: '0.4rem', borderRadius: '8px' }}>
                <Wrench size={20} />
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff' }}>
                Fix<span style={{ color: '#60a5fa' }}>Nearby</span>
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              The trusted local service booking platform connecting households with verified electricians, plumbers, AC technicians, and repair specialists in your neighborhood.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '1rem' }}>Popular Services</h4>
            <ul style={{ listStyle: 'none', lineHeight: '2' }}>
              <li><Link to="/providers?category=Electrician" style={{ color: '#94a3b8' }}>Electricians</Link></li>
              <li><Link to="/providers?category=Plumber" style={{ color: '#94a3b8' }}>Plumbers & Leak Fix</Link></li>
              <li><Link to="/providers?category=AC+Technician" style={{ color: '#94a3b8' }}>AC Repair & Servicing</Link></li>
              <li><Link to="/providers?category=Appliance+Repair" style={{ color: '#94a3b8' }}>Washing Machine & Fridge</Link></li>
              <li><Link to="/providers?category=Carpenter" style={{ color: '#94a3b8' }}>Carpenters & Woodwork</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '1rem' }}>For Professionals</h4>
            <ul style={{ listStyle: 'none', lineHeight: '2' }}>
              <li><Link to="/register?role=provider" style={{ color: '#94a3b8' }}>Register as Service Provider</Link></li>
              <li><Link to="/login" style={{ color: '#94a3b8' }}>Provider Dashboard Login</Link></li>
              <li><span style={{ color: '#94a3b8' }}>Verification Guidelines</span></li>
              <li><span style={{ color: '#94a3b8' }}>Trust & Safety Policy</span></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '1rem' }}>Contact & Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="var(--primary)" />
                <span>Helpline: +91 1800 425 9000</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="var(--primary)" />
                <span>support@fixnearby.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="var(--primary)" />
                <span>Coimbatore, Tamil Nadu, India</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <p>© {new Date().getFullYear()} FixNearby Local Service Booking Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

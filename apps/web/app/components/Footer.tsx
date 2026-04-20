'use client';

import React from 'react';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ 
      position: 'relative',
      background: '#1A1D1F', // Dark base
      color: 'white',
      padding: '10rem 2rem 4rem',
      marginTop: '-60px', // Pull up to overlap with the rounded section above
      borderRadius: '60px 60px 0 0',
      overflow: 'hidden'
    }}>
      {/* Glorious Savannah Background */}
      <div style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url("/savannah-footer.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center 20%',
        opacity: 0.3,
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>

      {/* Modern Gradient Overlay */}
      <div style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, #1A1D1F 0%, transparent 20%, transparent 70%, #1A1D1F 100%)',
        zIndex: 1
      }}></div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        position: 'relative', 
        zIndex: 2,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '4rem'
      }}>
        {/* Brand Column */}
        <div style={{ gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            Hotel <span style={{ color: 'var(--primary)' }}>Capanaparo</span>
          </h2>
          <p style={{ color: '#94A3B8', lineHeight: 1.8, marginBottom: '2rem', maxWidth: '350px' }}>
            Llevando la experiencia del llano venezolano a un nivel de sofisticación internacional. 
            Donde el lujo se encuentra con la naturaleza salvaje.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[Globe, Globe, Globe].map((Icon, i) => (
              <a key={i} href="#" style={{ 
                width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                color: 'white', textDecoration: 'none'
              }} className="social-icon">
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary)' }}>Empresa</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
            {['Sobre Nosotros', 'Nuestras Suites', 'Galería', 'Políticas'].map((item) => (
              <li key={item}><Link href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}>{item}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary)' }}>Contacto</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1.25rem' }}>
            <li style={{ display: 'flex', gap: '1rem', color: '#94A3B8' }}>
              <MapPin size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Edo. Apure, Venezuela</span>
            </li>
            <li style={{ display: 'flex', gap: '1rem', color: '#94A3B8' }}>
              <Phone size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>+58 412 123 4567</span>
            </li>
            <li style={{ display: 'flex', gap: '1rem', color: '#94A3B8' }}>
              <Mail size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>contacto@capanaparo.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '4rem auto 0', 
        paddingTop: '2rem', 
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2,
        fontSize: '0.85rem',
        color: '#64748B'
      }}>
        <p>© {new Date().getFullYear()} Modern Booking System. Hecho con ❤️ para Capanaparo.</p>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Términos</Link>
          <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacidad</Link>
        </div>
      </div>

      <style jsx>{`
        .social-icon:hover {
          background: var(--primary) !important;
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(46, 196, 182, 0.4);
        }
        li a:hover {
          color: white !important;
        }
      `}</style>
    </footer>
  );
}

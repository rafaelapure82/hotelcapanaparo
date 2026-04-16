'use client';

import React from 'react';

export default function Hero() {
  return (
    <section className="animate-in" style={{
      padding: '4rem 2rem 8rem',
      background: 'linear-gradient(to bottom, #f8fafc, #ffffff)',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem'
    }}>
      <h1 style={{ 
        fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
        fontWeight: 800, 
        letterSpacing: '-0.02em',
        maxWidth: '900px',
        lineHeight: 1.1
      }}>
        Welcome to <span style={{ color: 'var(--primary)' }}>Hotel Capanaparo</span> Suites.
      </h1>
      
      <p style={{ 
        color: 'var(--secondary)', 
        fontSize: '1.25rem', 
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        Experience the world's most unique properties, curated for travelers who seek the exceptional.
      </p>

      {/* Modern Search Bar */}
      <div className="glass" style={{
        marginTop: '2rem',
        padding: '1rem',
        borderRadius: '100px',
        display: 'flex',
        gap: '1rem',
        maxWidth: '900px',
        width: '100%',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ flex: 2, textAlign: 'left', padding: '0 1.5rem', borderRight: '1px solid var(--border)' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--secondary)' }}>Location</label>
          <input type="text" placeholder="Where are you going?" style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '1rem' }} />
        </div>
        
        <div style={{ flex: 1, textAlign: 'left', padding: '0 1.5rem', borderRight: '1px solid var(--border)' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--secondary)' }}>Check-in</label>
          <input type="text" placeholder="Add dates" style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '1rem' }} />
        </div>
        
        <div style={{ flex: 1, textAlign: 'left', padding: '0 1.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--secondary)' }}>Guests</label>
          <input type="text" placeholder="Add guests" style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '1rem' }} />
        </div>

        <button className="btn-primary" style={{ borderRadius: '50px', padding: '1rem 2rem' }}>
          Search
        </button>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .glass {
            flex-direction: column;
            border-radius: 20px;
            padding: 2rem;
          }
          .glass > div {
            border-right: none;
            border-bottom: 1px solid var(--border);
            padding: 1rem 0;
          }
        }
      `}</style>
    </section>
  );
}

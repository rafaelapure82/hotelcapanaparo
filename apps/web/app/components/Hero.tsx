'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();
  const router = useRouter();
  const [city, setCity] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    router.push(`/homes?${params.toString()}`);
  };

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
        {t('welcome')} <span style={{ color: 'var(--primary)' }}>Hotel Capanaparo</span> {t('heroTitle').replace('Hotel Capanaparo ', '')}.
      </h1>
      
      <p style={{ 
        color: 'var(--secondary)', 
        fontSize: '1.25rem', 
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {t('heroSubtitle')}
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
          <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--secondary)' }}>{t('searchLocation')}</label>
          <input 
            type="text" 
            placeholder="Where are you going?" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '1rem' }} 
          />
        </div>
        
        <div style={{ flex: 1, textAlign: 'left', padding: '0 1.5rem', borderRight: '1px solid var(--border)' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--secondary)' }}>{t('searchDates')}</label>
          <input type="text" placeholder="Add dates" style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '1rem' }} />
        </div>
        
        <div style={{ flex: 1, textAlign: 'left', padding: '0 1.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--secondary)' }}>{t('searchGuests')}</label>
          <input type="text" placeholder="Add guests" style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '1rem' }} />
        </div>

        <button 
          onClick={handleSearch}
          className="btn-primary" 
          style={{ borderRadius: '50px', padding: '1rem 2rem' }}
        >
          {t('searchBtn')}
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

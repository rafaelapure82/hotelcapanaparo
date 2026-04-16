'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showLang, setShowLang] = useState(false);

  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
  ];

  return (
    <nav className="glass animate-in" style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 1000,
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid var(--border)'
    }}>
      <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
        Hotel Capanaparo <span style={{ color: 'var(--foreground)' }}>Suites</span>
      </Link>
      
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link href="/homes" style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('explore')}</Link>
        
        {/* Language Selector */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowLang(!showLang)}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontWeight: 700, 
              cursor: 'pointer',
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {language} <span style={{ fontSize: '0.6rem' }}>▼</span>
          </button>
          
          {showLang && (
            <div className="glass" style={{ 
              position: 'absolute', 
              top: '100%', 
              right: 0, 
              marginTop: '1rem',
              padding: '0.5rem',
              borderRadius: '12px',
              minWidth: '150px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as any);
                    setShowLang(false);
                  }}
                  style={{
                    padding: '0.6rem 1rem',
                    textAlign: 'left',
                    background: language === lang.code ? 'rgba(0,0,0,0.05)' : 'none',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: language === lang.code ? 700 : 500
                  }}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {user ? (
          <>
            <Link 
              href={user.roles.includes('admin') ? '/dashboard' : '/portal'} 
              className="btn-primary" 
              style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}
            >
              {user.roles.includes('admin') ? t('dashboard') : t('myPortal')}
            </Link>
            <button 
              onClick={logout}
              style={{ padding: '0.6rem', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
              title={t('logout')}
            >
              🚪
            </button>
          </>
        ) : (
          <Link href="/auth/login" className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>
            {t('signIn')}
          </Link>
        )}
      </div>
    </nav>
  );
}

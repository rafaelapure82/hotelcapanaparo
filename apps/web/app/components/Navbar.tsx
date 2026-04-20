'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showLang, setShowLang] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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
      padding: '0.75rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid var(--border)'
    }}>
      <Link href="/" style={{ fontSize: isMobile ? '1.15rem' : '1.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
        Hotel Capanaparo <span style={{ color: 'var(--foreground)' }}>Suites</span>
      </Link>
      
      {/* Mobile hamburger */}
      {isMobile && (
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Desktop nav items */}
      {!isMobile && (
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link href="/homes" style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('explore')}</Link>
          
          {/* Language Selector */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowLang(!showLang)}
              style={{ 
                background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer',
                textTransform: 'uppercase', fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              {language} <span style={{ fontSize: '0.6rem' }}>▼</span>
            </button>
            
            {showLang && (
              <div className="glass" style={{ 
                position: 'absolute', top: '100%', right: 0, marginTop: '1rem',
                padding: '0.5rem', borderRadius: '12px', minWidth: '150px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column', gap: '0.25rem'
              }}>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code as any); setShowLang(false); }}
                    style={{
                      padding: '0.6rem 1rem', textAlign: 'left',
                      background: language === lang.code ? 'rgba(0,0,0,0.05)' : 'none',
                      border: 'none', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '0.85rem', fontWeight: language === lang.code ? 700 : 500
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
      )}

      {/* Mobile dropdown */}
      {isMobile && mobileOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'white', borderBottom: '1px solid var(--border)',
          padding: '1.5rem 2rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <Link href="/homes" onClick={() => setMobileOpen(false)} style={{ fontWeight: 600, fontSize: '1rem', padding: '0.5rem 0' }}>{t('explore')}</Link>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {languages.map(lang => (
              <button key={lang.code} onClick={() => { setLanguage(lang.code as any); }}
                style={{
                  padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  background: language === lang.code ? 'var(--primary)' : '#F1F5F9',
                  color: language === lang.code ? 'white' : 'var(--foreground)',
                  border: 'none'
                }}>
                {lang.code.toUpperCase()}
              </button>
            ))}
          </div>

          {user ? (
            <>
              <Link 
                href={user.roles.includes('admin') ? '/dashboard' : '/portal'} 
                className="btn-primary" 
                onClick={() => setMobileOpen(false)}
                style={{ padding: '0.75rem', fontSize: '0.9rem', justifyContent: 'center', borderRadius: '12px' }}
              >
                {user.roles.includes('admin') ? t('dashboard') : t('myPortal')}
              </Link>
              <button onClick={() => { logout(); setMobileOpen(false); }}
                style={{ padding: '0.75rem', background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                {t('logout')}
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="btn-primary" onClick={() => setMobileOpen(false)}
              style={{ padding: '0.75rem', fontSize: '0.9rem', justifyContent: 'center', borderRadius: '12px' }}>
              {t('signIn')}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

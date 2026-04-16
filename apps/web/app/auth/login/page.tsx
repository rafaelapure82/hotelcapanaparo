'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="animate-in" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh',
      padding: '2rem'
    }}>
      <div className="glass" style={{ 
        width: '100%', 
        maxWidth: '450px', 
        padding: '3rem', 
        borderRadius: '24px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t('loginWelcome')}</h1>
          <p style={{ color: 'var(--secondary)' }}>{t('heroSubtitle').split('.')[0]}</p>
        </div>

        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#dc2626', 
            padding: '1rem', 
            borderRadius: '12px', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', marginLeft: '0.5rem' }}>{t('email').toUpperCase()}</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.05)',
                fontSize: '1rem'
              }}
            />
          </div>

          <div className="input-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', marginLeft: '0.5rem' }}>{t('password').toUpperCase()}</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.05)',
                fontSize: '1rem'
              }}
            />
          </div>

          <button className="btn-primary" type="submit" style={{ 
            padding: '1.1rem', 
            fontSize: '1rem', 
            letterSpacing: '1px',
            marginTop: '1rem'
          }}>
            {t('signIn').toUpperCase()}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2.5rem', color: 'var(--secondary)', fontSize: '0.9rem' }}>
          {t('dontHaveAccount')} <Link href="/auth/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>{t('createAccount')}</Link>
        </p>
      </div>
    </div>
  );
}

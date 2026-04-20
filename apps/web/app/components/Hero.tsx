'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Search, MapPin, Calendar, Users, Minus, Plus } from 'lucide-react';

export default function Hero() {
  const { t } = useLanguage();
  const router = useRouter();
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (guests > 1) params.set('guests', String(guests));
    router.push(`/homes?${params.toString()}`);
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return null;
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <section className="animate-in" style={{
      padding: '10rem 2rem 8rem',
      background: 'linear-gradient(165deg, #f8fafc 0%, #ffffff 40%, #CBF3F020 100%)',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,196,182,0.08), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-120px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,159,28,0.05), transparent)', pointerEvents: 'none' }} />

      <h1 style={{ 
        fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
        fontWeight: 900, 
        letterSpacing: '-0.03em',
        maxWidth: '900px',
        lineHeight: 1.1,
        position: 'relative'
      }}>
        {t('welcome')} <span style={{ color: 'var(--primary)' }}>Hotel Capanaparo</span> Suites
      </h1>
      
      <p style={{ 
        color: 'var(--secondary)', 
        fontSize: '1.2rem', 
        maxWidth: '600px',
        margin: '0 auto',
        lineHeight: 1.6,
        fontWeight: 500
      }}>
        {t('heroSubtitle')}
      </p>

      {/* ========== FUNCTIONAL SEARCH BAR ========== */}
      <div style={{
        marginTop: '2.5rem',
        padding: '0.5rem',
        borderRadius: '100px',
        display: 'flex',
        gap: '0',
        maxWidth: '960px',
        width: '100%',
        background: 'white',
        boxShadow: '0 8px 40px -8px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
        position: 'relative'
      }}>
        {/* Location */}
        <div style={{ flex: 2, textAlign: 'left', padding: '0.75rem 1.5rem', borderRight: '1px solid #E2E8F0', borderRadius: '100px 0 0 100px', transition: 'background 0.2s' }}
          onMouseOver={e => (e.currentTarget.style.background = '#F8FAFC')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
          <label style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <MapPin size={12} /> {t('searchLocation')}
          </label>
          <input 
            type="text" 
            placeholder="¿A dónde vas?" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.95rem', fontWeight: 600, marginTop: '0.15rem' }} 
          />
        </div>
        
        {/* Check-in */}
        <div style={{ flex: 1, textAlign: 'left', padding: '0.75rem 1.25rem', borderRight: '1px solid #E2E8F0', transition: 'background 0.2s', position: 'relative', cursor: 'pointer' }}
          onMouseOver={e => (e.currentTarget.style.background = '#F8FAFC')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          onClick={() => { const input = document.getElementById('search-start-date') as any; if(input) input.showPicker(); }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
            <Calendar size={12} /> Check-in
          </label>
          <input 
            id="search-start-date"
            type="date" 
            value={startDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.95rem', fontWeight: 600, marginTop: '0.15rem', color: startDate ? 'var(--foreground)' : 'var(--secondary)', cursor: 'pointer' }} 
          />
        </div>
        
        {/* Check-out */}
        <div style={{ flex: 1, textAlign: 'left', padding: '0.75rem 1.25rem', borderRight: '1px solid #E2E8F0', transition: 'background 0.2s', cursor: 'pointer' }}
          onMouseOver={e => (e.currentTarget.style.background = '#F8FAFC')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          onClick={() => { const input = document.getElementById('search-end-date') as any; if(input) input.showPicker(); }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
            <Calendar size={12} /> Check-out
          </label>
          <input 
            id="search-end-date"
            type="date" 
            value={endDate}
            min={startDate || new Date().toISOString().split('T')[0]}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.95rem', fontWeight: 600, marginTop: '0.15rem', color: endDate ? 'var(--foreground)' : 'var(--secondary)', cursor: 'pointer' }} 
          />
        </div>

        {/* Guests */}
        <div style={{ flex: 0.8, textAlign: 'left', padding: '0.75rem 1.25rem', transition: 'background 0.2s', cursor: 'pointer', position: 'relative' }}
          onClick={() => setShowGuestPicker(!showGuestPicker)}
          onMouseOver={e => (e.currentTarget.style.background = '#F8FAFC')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
          <label style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Users size={12} /> {t('searchGuests')}
          </label>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.15rem' }}>
            {guests} huésped{guests > 1 ? 'es' : ''}
          </div>

          {showGuestPicker && (
            <div 
              onClick={e => e.stopPropagation()}
              style={{ position: 'absolute', top: 'calc(100% + 0.5rem)', left: 0, right: 0, background: 'white', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)', border: '1px solid #E2E8F0', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Huéspedes</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => setGuests(g => Math.max(1, g - 1))} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #CBD5E1', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Minus size={16} />
                </button>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '1.5rem', textAlign: 'center' }}>{guests}</span>
                <button onClick={() => setGuests(g => Math.min(10, g + 1))} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #CBD5E1', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button 
          onClick={handleSearch}
          style={{ 
            borderRadius: '50px', 
            padding: '1rem 1.75rem', 
            background: 'var(--primary)', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontWeight: 800,
            fontSize: '0.95rem',
            transition: 'all 0.2s',
            boxShadow: '0 4px 14px rgba(46,196,182,0.4)'
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,196,182,0.5)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(46,196,182,0.4)'; }}
        >
          <Search size={20} />
          {t('searchBtn')}
        </button>
      </div>

      {/* Quick trust bar */}
      <div style={{ display: 'flex', gap: '2.5rem', marginTop: '2rem', color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
        <span>✓ Reserva Confirmada en 24h</span>
        <span>✓ Precios sin Sorpresas</span>
        <span>✓ Cancelación Flexible</span>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          section > div:nth-child(4) {
            flex-direction: column !important;
            border-radius: 24px !important;
            padding: 1rem !important;
          }
          section > div:nth-child(4) > div {
            border-right: none !important;
            border-bottom: 1px solid #E2E8F0;
            padding: 1rem !important;
            border-radius: 0 !important;
          }
          section > div:nth-child(5) {
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
        }
      `}</style>
    </section>
  );
}

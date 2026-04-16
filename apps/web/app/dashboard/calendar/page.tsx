'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function CalendarPage() {
  const { t, formatDate, language } = useLanguage();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate a range of dates for the next 14 days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const { data } = await api.get('/homes/calendar/data');
        setData(data);
      } catch (err) {
        console.error('Failed to fetch calendar data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, []);

  const isBooked = (home: any, date: Date) => {
    return home.bookings.find((b: any) => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      const current = new Date(date);
      current.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return current >= start && current <= end && b.status !== 'cancelled';
    });
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>{t('loading')}</div>;

  return (
    <div className="animate-in" style={{ padding: '3rem', minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{t('viewTimeline')}</h1>
          <p style={{ color: 'var(--secondary)' }}>Real-time availability and booking overview.</p>
        </div>
        <Link href="/dashboard" className="btn-secondary" style={{ padding: '0.6rem 1.2rem' }}>Back to Stats</Link>
      </header>

      <div className="glass" style={{ 
        overflowX: 'auto', 
        borderRadius: '24px', 
        border: '1px solid var(--border)',
        padding: '1rem'
      }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px' }}>
          <thead>
            <tr>
              <th style={{ minWidth: '200px', textAlign: 'left', padding: '1rem', color: 'var(--secondary)', fontSize: '0.8rem' }}>{t('property')}</th>
              {days.map((day, i) => (
                <th key={i} style={{ minWidth: '80px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6 }}>{day.toLocaleDateString(language, { weekday: 'short' })}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{day.getDate()}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((home) => (
              <tr key={home.id}>
                <td style={{ padding: '1rem', fontWeight: 700, fontSize: '0.9rem' }}>{home.title}</td>
                {days.map((day, i) => {
                  const booking = isBooked(home, day);
                  return (
                    <td key={i} style={{ padding: '4px' }}>
                      <div style={{ 
                        height: '40px', 
                        borderRadius: '8px',
                        background: booking ? 'var(--primary)' : 'rgba(0,0,0,0.03)',
                        opacity: booking ? 1 : 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        cursor: booking ? 'pointer' : 'default',
                        transition: 'all 0.2s ease'
                      }} title={booking ? `${booking.firstName} ${booking.lastName}` : 'Available'}>
                        {booking && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }}></div>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'var(--primary)' }}></div>
          <span>Occupied</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'rgba(0,0,0,0.08)' }}></div>
          <span>Available</span>
        </div>
      </div>
    </div>
  );
}

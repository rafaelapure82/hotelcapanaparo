'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function GuestPortalPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          api.get('/stats/guest'),
          api.get('/bookings/my-bookings'),
        ]);
        setStats(statsRes.data);
        setBookings(bookingsRes.data);
      } catch (err) {
        console.error('Failed to fetch guest data', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading your experience...</div>;

  return (
    <div className="animate-in" style={{ padding: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Welcome, {user?.firstName}</h1>
        <p style={{ color: 'var(--secondary)', fontSize: '1.1rem' }}>Manage your stays and explore your next luxury escape.</p>
      </header>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <div className="glass" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '1rem' }}>TOTAL STAYS</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{stats?.myBookings || 0}</p>
        </div>
        <div className="glass" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--primary)', color: 'white' }}>
          <p style={{ opacity: 0.8, fontWeight: 700, fontSize: '0.85rem', marginBottom: '1rem' }}>NEXT CHECK-IN</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {stats?.lastStay ? new Date(stats.lastStay.startDate).toLocaleDateString() : 'No upcoming stays'}
          </p>
        </div>
      </div>

      {/* My Bookings */}
      <section>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem' }}>My Stays</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bookings.length > 0 ? bookings.map((booking) => (
            <div key={booking.id} className="glass" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '2rem', 
              borderRadius: '20px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ width: '100px', height: '100px', background: '#e2e8f0', borderRadius: '12px', flexShrink: 0 }}></div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{booking.home?.title || 'Luxury Suite'}</h3>
                  <p style={{ color: 'var(--secondary)' }}>{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                  <p style={{ fontWeight: 800, marginTop: '0.5rem' }}>{booking.currency} {booking.total}</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                <span style={{ 
                  padding: '0.4rem 1rem', 
                  borderRadius: '50px', 
                  fontSize: '0.75rem', 
                  fontWeight: 800,
                  background: booking.status === 'confirmed' ? '#d1fae5' : '#fef3c7',
                  color: booking.status === 'confirmed' ? '#065f46' : '#92400e',
                  textTransform: 'uppercase'
                }}>
                  {booking.status}
                </span>
                <Link href={`/homes/${booking.serviceId}`} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>View Suite</Link>
              </div>
            </div>
          )) : (
            <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '20px' }}>
              <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>You haven't made any reservations yet.</p>
              <Link href="/homes" className="btn-primary">Explore Suites</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

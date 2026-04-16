import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats/admin');
        setStatsData(data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = statsData ? [
    { label: 'Total Earnings', value: `$${statsData.totalEarnings.toLocaleString()}`, change: '+12%' },
    { label: 'Active Bookings', value: statsData.activeBookings.toString(), change: '+5' },
    { label: 'Total Suites', value: statsData.totalProperties.toString(), change: '0' },
    { label: 'Occupancy Rate', value: `${statsData.occupancyRate}%`, change: '+2%' },
  ] : [];

  const recentBookings = [
    { guest: 'John Doe', property: 'Presidential Suite', dates: 'Oct 24 - 29', status: 'Confirmed', total: '$1,750' },
    { guest: 'Jane Smith', property: 'Riverside Cabin', dates: 'Nov 02 - 05', status: 'Pending', total: '$840' },
    { guest: 'Carlos Ruiz', property: 'Mountain View', dates: 'Nov 12 - 15', status: 'Confirmed', total: '$960' },
  ];


  return (
    <div className="animate-in" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside className="glass" style={{ width: '280px', padding: '2rem', borderRight: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--primary)' }}>DASHBOARD</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/dashboard" style={{ padding: '0.75rem 1rem', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: 600 }}>Overview</Link>
          <Link href="/dashboard/properties" style={{ padding: '0.75rem 1rem', borderRadius: '8px' }}>My Properties</Link>
          <Link href="/dashboard/bookings" style={{ padding: '0.75rem 1rem', borderRadius: '8px' }}>Bookings</Link>
          <Link href="/dashboard/earnings" style={{ padding: '0.75rem 1rem', borderRadius: '8px' }}>Earnings</Link>
          <Link href="/dashboard/settings" style={{ padding: '0.75rem 1rem', borderRadius: '8px' }}>Settings</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Welcome back, {user?.firstName || 'Partner'}</h1>
            <p style={{ color: 'var(--secondary)' }}>Here is what is happening with your properties today.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/dashboard/calendar" className="btn-secondary">View Timeline</Link>
            <button className="btn-primary">+ Add New Property</button>
          </div>
        </header>

        {/* Daily Brief / Urgency Alerts */}
        <div className="glass" style={{ 
          padding: '1.5rem 2rem', 
          borderRadius: '16px', 
          marginBottom: '3rem', 
          background: '#fffbeb', 
          border: '1px solid #fde68a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#f59e0b', color: 'white', padding: '0.5rem', borderRadius: '8px', fontSize: '1.2rem' }}>⚡</div>
            <div>
              <p style={{ fontWeight: 800, color: '#92400e' }}>Action Required</p>
              <p style={{ fontSize: '0.9rem', color: '#b45309' }}>You have 2 bookings pending confirmation for this weekend.</p>
            </div>
          </div>
          <Link href="/dashboard/bookings" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#b45309', textDecoration: 'underline' }}>Manage Now</Link>
        </div>


        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          {stats.map((stat, i) => (
            <div key={i} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>{stat.label}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <p style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stat.value}</p>
                <span style={{ fontSize: '0.85rem', color: stat.change.startsWith('+') ? '#10b981' : 'inherit', fontWeight: 700 }}>{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Recent Bookings</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.85rem' }}>GUEST</th>
                <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.85rem' }}>PROPERTY</th>
                <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.85rem' }}>DATES</th>
                <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.85rem' }}>STATUS</th>
                <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.85rem' }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1.25rem', fontWeight: 600 }}>{booking.guest}</td>
                  <td style={{ padding: '1.25rem' }}>{booking.property}</td>
                  <td style={{ padding: '1.25rem', color: 'var(--secondary)' }}>{booking.dates}</td>
                  <td style={{ padding: '1.25rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '50px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      background: booking.status === 'Confirmed' ? '#d1fae5' : '#fef3c7',
                      color: booking.status === 'Confirmed' ? '#065f46' : '#92400e'
                    }}>
                      {booking.status}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem', fontWeight: 700 }}>{booking.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <style jsx>{`
        @media (max-width: 1024px) {
          aside { display: none; }
        }
      `}</style>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Home, 
  Settings, 
  TrendingUp, 
  CheckCircle,
  LogOut,
  ChevronRight,
  User,
  UserCircle
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { exchangeRate, setExchangeRate, formatPrice, t } = useLanguage();
  const [newRate, setNewRate] = useState(exchangeRate.toString());
  const [updatingRate, setUpdatingRate] = useState(false);

  const isAdmin = user?.roles.includes('admin');

  const menuItems = [
    { name: t('dashboard'), icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'partner'] },
    { name: t('bookings'), icon: CalendarDays, path: '/dashboard/reservations', roles: ['admin', 'partner'] },
    { name: t('myProperties'), icon: Home, path: '/dashboard/rooms', roles: ['admin', 'partner'] },
    { name: t('earnings'), icon: TrendingUp, path: '/dashboard/financials', roles: ['admin'] },
    { name: t('Reviews'), icon: CheckCircle, path: '/dashboard/reviews', roles: ['admin', 'partner'] },
    { name: 'Perfil', icon: UserCircle, path: '/dashboard/profile', roles: ['admin', 'partner'] },
    { name: t('settings'), icon: Settings, path: '/dashboard/settings', roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.some(role => user?.roles.includes(role))
  );

  const handleUpdateRate = async () => {
    setUpdatingRate(true);
    try {
      await api.patch('/settings/exchange-rate', { rate: parseFloat(newRate) });
      setExchangeRate(parseFloat(newRate));
    } catch (err) {
      console.error('Failed to update rate', err);
    } finally {
      setUpdatingRate(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F8FAFC' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        background: 'white',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 1.5rem',
        boxShadow: '4px 0 10px -5px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', padding: '0 0.5rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 }}>HC</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--foreground)' }}>Capanaparo</span>
        </div>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none' }}>
            {filteredItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path} style={{ marginBottom: '0.5rem' }}>
                  <Link href={item.path} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    color: isActive ? 'var(--primary)' : '#64748B',
                    background: isActive ? 'var(--dominant)' : 'transparent',
                    fontWeight: isActive ? 800 : 600,
                    transition: 'all 0.2s ease'
                  }}>
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    <span style={{ fontSize: '0.95rem' }}>{item.name}</span>
                    {isActive && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Admin Rate Widget */}
        {isAdmin && (
          <div style={{ 
            background: 'var(--dominant)', 
            padding: '1.5rem', 
            borderRadius: '24px', 
            marginBottom: '1.5rem',
            border: '1px solid rgba(46, 196, 182, 0.1)'
          }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Sincronización Divisa</h4>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>$1 =</span>
              <input 
                type="number" 
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                style={{
                  width: '65px',
                  padding: '0.4rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontWeight: 700,
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              />
              <button 
                onClick={handleUpdateRate}
                disabled={updatingRate}
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.8rem 1rem',
            color: '#EF4444',
            fontWeight: 700,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginTop: 'auto'
          }}
        >
          <LogOut size={20} />
          {t('logout')}
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: '80px',
          background: 'white',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 3rem',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--foreground)' }}>
            {menuItems.find(m => pathname === m.path)?.name || 'Dashboard'}
          </h1>
          <Link href="/dashboard/profile" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 800 }}>{user?.firstName} {user?.lastName}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: 700, textTransform: 'uppercase' }}>{user?.roles[0]}</p>
            </div>
            <div style={{ 
              width: '45px', height: '45px', borderRadius: '15px', 
              background: 'var(--dominant)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={24} style={{ color: 'var(--primary)' }} />
              )}
            </div>
          </Link>
        </header>

        <section style={{ padding: '2.5rem 3rem', flex: 1 }}>
          {children}
        </section>
      </main>
    </div>
  );
}

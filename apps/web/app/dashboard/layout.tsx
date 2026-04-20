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
  UserCircle,
  MessageSquare,
  Package,
  ClipboardList,
  Menu,
  X,
  Star,
  LineChart,
  BarChart3
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import NotificationBell from '@/components/dashboard/NotificationBell';
import api from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  // ... rest of component logic
  const { exchangeRate, updateRate, formatPrice, t } = useLanguage();
  const [newRate, setNewRate] = useState(exchangeRate.toString());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setNewRate(exchangeRate.toString());
  }, [exchangeRate]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close sidebar on navigation in mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname]);

  const [updatingRate, setUpdatingRate] = useState(false);

  const isAdmin = user?.roles.includes('admin');

  const menuItems = [
    { name: t('dashboard'), icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'partner'] },
    { name: t('bookings'), icon: CalendarDays, path: '/dashboard/reservations', roles: ['admin', 'partner'] },
    { name: t('messages'), icon: MessageSquare, path: '/dashboard/messages', roles: ['admin', 'partner'] },
    { name: t('myProperties'), icon: Home, path: '/dashboard/rooms', roles: ['admin', 'partner'] },
    { name: t('inventory'), icon: Package, path: '/dashboard/inventory', roles: ['admin', 'partner'] },
    { name: t('earnings'), icon: TrendingUp, path: '/dashboard/financials', roles: ['admin'] },
    { name: 'Reportes', icon: BarChart3, path: '/dashboard/reports', roles: ['admin', 'partner'] },
    { name: 'Inteligencia BI', icon: LineChart, path: '/dashboard/bi', roles: ['admin'] },
    { name: 'Limpieza', icon: CheckCircle, path: '/dashboard/housekeeping', roles: ['admin', 'staff-limpieza'] },
    { name: 'Reseñas', icon: Star, path: '/dashboard/reviews', roles: ['admin', 'partner'] },
    { name: 'Perfil', icon: UserCircle, path: '/dashboard/profile', roles: ['admin', 'partner', 'staff-limpieza'] },
    { name: 'Auditoría', icon: ClipboardList, path: '/dashboard/audit', roles: ['admin'] },
    { name: t('settings'), icon: Settings, path: '/dashboard/settings', roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.some(role => user?.roles.includes(role))
  );

  const handleUpdateRate = async () => {
    setUpdatingRate(true);
    try {
      await updateRate(parseFloat(newRate));
    } catch (err) {
      console.error('Failed to update rate', err);
    } finally {
      setUpdatingRate(false);
    }
  };

  const sidebarContent = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '0 0.5rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, flexShrink: 0 }}>HC</div>
          <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--foreground)' }}>Capanaparo</span>
        </div>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={22} color="#64748B" />
          </button>
        )}
      </div>

      <nav style={{ flex: 1, overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none' }}>
          {filteredItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path} style={{ marginBottom: '0.35rem' }}>
                <Link href={item.path} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.7rem 1rem',
                  borderRadius: '12px',
                  color: isActive ? 'var(--primary)' : '#64748B',
                  background: isActive ? 'var(--dominant)' : 'transparent',
                  fontWeight: isActive ? 800 : 600,
                  transition: 'all 0.2s ease',
                  fontSize: '0.9rem'
                }}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
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
          padding: '1.25rem', 
          borderRadius: '20px', 
          marginBottom: '1rem',
          border: '1px solid rgba(46, 196, 182, 0.1)'
        }}>
          <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Tasa de Cambio</h4>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>$1 =</span>
            <input 
              type="number" 
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              style={{
                width: '60px',
                padding: '0.35rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontWeight: 700,
                outline: 'none',
                fontSize: '0.8rem'
              }}
            />
            <button 
              onClick={handleUpdateRate}
              disabled={updatingRate}
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                padding: '0.35rem 0.7rem',
                borderRadius: '8px',
                fontSize: '0.7rem',
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
          gap: '0.85rem',
          padding: '0.7rem 1rem',
          color: '#EF4444',
          fontWeight: 700,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.9rem',
          width: '100%'
        }}
      >
        <LogOut size={20} />
        {t('logout')}
      </button>
    </>
  );

  return (
    <NotificationProvider userId={user?.id}>
      <div style={{ display: 'flex', height: '100vh', background: '#F8FAFC' }}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40, backdropFilter: 'blur(4px)' }} 
        />
      )}

      {/* Sidebar — desktop: static, mobile: slide-in */}
      <aside style={{
        width: '270px',
        background: 'white',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1.25rem',
        boxShadow: isMobile ? '4px 0 20px rgba(0,0,0,0.1)' : '4px 0 10px -5px rgba(0,0,0,0.05)',
        position: isMobile ? 'fixed' : 'relative',
        top: 0,
        left: isMobile ? (sidebarOpen ? '0' : '-300px') : '0',
        bottom: 0,
        zIndex: 50,
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowY: 'auto'
      }}>
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          minHeight: '70px',
          background: 'white',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(true)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}
              >
                <Menu size={24} />
              </button>
            )}
            <h1 style={{ fontSize: isMobile ? '1.1rem' : '1.3rem', fontWeight: 900, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {menuItems.find(m => pathname === m.path)?.name || 'Dashboard'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <NotificationBell />
            
            <Link href="/dashboard/profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
            {!isMobile && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 800 }}>{user?.firstName} {user?.lastName}</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--secondary)', fontWeight: 700, textTransform: 'uppercase' }}>{user?.roles[0]}</p>
              </div>
            )}
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '12px', 
              background: 'var(--dominant)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              flexShrink: 0
            }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={22} style={{ color: 'var(--primary)' }} />
              )}
            </div>
          </Link>
          </div>
        </header>

        <section style={{ padding: isMobile ? '1.5rem 1rem' : '2rem 2.5rem', flex: 1 }}>
          {children}
        </section>
      </main>
    </div>
    </NotificationProvider>
  );
}

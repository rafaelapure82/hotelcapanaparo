'use client';

import React, { useState } from 'react';
import { Bell, X, Info, AlertTriangle, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import Link from 'next/link';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'handoff': return <MessageSquare size={16} color="var(--primary)" />;
      case 'warning': return <AlertTriangle size={16} color="#F59E0B" />;
      case 'error': return <AlertCircle size={16} color="#EF4444" />;
      case 'success': return <CheckCircle2 size={16} color="#10B981" />;
      default: return <Info size={16} color="#3B82F6" />;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'var(--dominant)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.2s ease',
        }}
      >
        <Bell size={20} color={unreadCount > 0 ? 'var(--primary)' : '#64748B'} strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#EF4444',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 900,
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {unreadCount > 9 ? '+9' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 100 }}
          />
          <div style={{
            position: 'absolute',
            top: '50px',
            right: '0',
            width: '320px',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
            zIndex: 101,
            overflow: 'hidden',
            animation: 'slideDown 0.2s ease-out'
          }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 900, fontSize: '0.95rem' }}>Notificaciones</h3>
              <button 
                onClick={markAllAsRead}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Marcar todas leídas
              </button>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)', fontSize: '0.85rem' }}>
                  No tienes notificaciones
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => {
                        if (!n.isRead) markAsRead(n.id);
                        if (n.link) window.location.href = n.link;
                    }}
                    style={{ 
                      padding: '1rem 1.25rem', 
                      borderBottom: '1px solid #F8FAFC', 
                      cursor: 'pointer',
                      background: n.isRead ? 'transparent' : 'var(--dominant)',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <div style={{ marginTop: '0.2rem' }}>{getIcon(n.type)}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.2rem' }}>{n.title}</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: '1.4', fontWeight: 600 }}>{n.message}</p>
                        <span style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '0.5rem', display: 'block' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!n.isRead && (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '0.3rem' }} />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link href="/dashboard/notifications" style={{ display: 'block', padding: '1rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', background: '#F8FAFC', textDecoration: 'none' }}>
              Ver todas las alertas
            </Link>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

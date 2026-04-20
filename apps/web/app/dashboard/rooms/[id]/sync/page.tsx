'use client';

import React, { useEffect, useState } from 'react';
import { 
  RefreshCw, 
  Link as LinkIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Copy,
  Calendar
} from 'lucide-react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

export default function RoomSyncSettings() {
  const { id } = useParams();
  const [home, setHome] = useState<any>(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchHome();
  }, [id]);

  const fetchHome = async () => {
    try {
      const { data } = await api.get(`/homes/${id}`);
      setHome(data);
      setExternalUrl(data.externalCalendarUrl || '');
    } catch (err) {
      console.error('Failed to fetch property', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      await api.put(`/homes/${id}`, { externalCalendarUrl: externalUrl });
      alert('Configuración guardada correctamente. La sincronización se ejecutará cada hora.');
    } catch (err) {
      console.error('Failed to save settings', err);
    }
  };

  const triggerManualSync = async () => {
    setSyncing(true);
    try {
      await api.post(`/sync/${id}/trigger`);
      alert('Sincronización manual completada con éxito.');
      fetchHome();
    } catch (err) {
      alert('Error en la sincronización. Verifica la URL del calendario externo.');
    } finally {
      setSyncing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('URL copiada al portapapeles');
  };

  if (loading) return <div>Cargando configuración de sincronización...</div>;

  const ourICalUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/sync/ical/${id}`;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--foreground)', marginBottom: '0.5rem' }}>Channel Manager: {home?.title}</h2>
          <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Sincroniza tu disponibilidad con Airbnb, Booking y otros canales externos</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
        {/* 1. EXPORT: Sync internal to external */}
        <section style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--dominant)', borderRadius: '12px' }}>
                    <ExternalLink size={24} color="var(--primary)" />
                </div>
                <div>
                    <h3 style={{ fontWeight: 800 }}>Exportar Calendario (iCal)</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Usa este link en Airbnb o Booking.com para que vean tu disponibilidad.</p>
                </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', background: '#F8FAFC', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <input 
                    readOnly 
                    value={ourICalUrl}
                    style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }} 
                />
                <button 
                    onClick={() => copyToClipboard(ourICalUrl)}
                    style={{ background: 'white', border: '1px solid #E2E8F0', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer' }}
                >
                    <Copy size={16} />
                </button>
            </div>
        </section>

        {/* 2. IMPORT: Sync external to internal */}
        <section style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.75rem', background: '#FFF7ED', borderRadius: '12px' }}>
                    <RefreshCw size={24} color="#F59E0B" />
                </div>
                <div>
                    <h3 style={{ fontWeight: 800 }}>Importar Calendario Externo</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Pega el link de iCal de Airbnb/Booking para bloquear fechas ocupadas aquí.</p>
                </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#94A3B8', marginBottom: '0.5rem' }}>URL del Calendario Externo</label>
                <input 
                    type="text" 
                    placeholder="https://www.airbnb.com/calendar/ical/..."
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 600 }}
                />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                    onClick={saveSettings}
                    style={{ flex: 1, padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 800, cursor: 'pointer' }}
                >
                    Guardar Configuración
                </button>
                <button 
                    onClick={triggerManualSync}
                    disabled={syncing || !externalUrl}
                    style={{ padding: '0 1.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Sincronizando...' : 'Sincronizar Ya'}
                </button>
            </div>

            {home?.lastSync && (
                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                    <CheckCircle2 size={14} color="#10B981" /> Última sincronización exitosa: {new Date(home.lastSync).toLocaleString()}
                </div>
            )}
        </section>

      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
    background: 'white',
    padding: '2rem',
    borderRadius: '24px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
};

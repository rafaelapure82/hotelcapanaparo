'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Settings, Bell, Shield, Globe, Save, Wallet } from 'lucide-react';
import api from '@/lib/api';

export default function SettingsPage() {
  const { exchangeRate, setExchangeRate, t } = useLanguage();
  const [rate, setRate] = useState(exchangeRate.toString());
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    try {
      await api.patch('/settings/exchange-rate', { rate: parseFloat(rate) });
      setExchangeRate(parseFloat(rate));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="animate-in" style={{ display: 'grid', gap: '2rem', maxWidth: '800px' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Configuración</h2>
        <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Gestiona las preferencias generales de la suite.</p>
      </div>

      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.6rem', background: 'var(--dominant)', borderRadius: '10px' }}>
            <Wallet size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h4 style={{ fontWeight: 800 }}>Divisa y Economía</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Configura la tasa de cambio oficial para cálculos en Bolívares.</p>
          </div>
        </div>
        <div style={{ padding: '2rem', display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--foreground)' }}>Tasa de Cambio (USD a Bs)</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="number" 
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', fontWeight: 700 }}
              />
              <button 
                onClick={handleSave}
                style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0 2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                Actualizar
              </button>
            </div>
          </div>
          {success && <p style={{ color: '#166534', fontWeight: 800, fontSize: '0.85rem' }}>✓ Tasa actualizada exitosamente.</p>}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', opacity: 0.6, pointerEvents: 'none' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.6rem', background: '#F1F5F9', borderRadius: '10px' }}>
            <Bell size={20} style={{ color: 'var(--secondary)' }} />
          </div>
          <div>
            <h4 style={{ fontWeight: 800 }}>Notificaciones (Próximamente)</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Configura alertas de WhatsApp y correo electrónico.</p>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', opacity: 0.6, pointerEvents: 'none' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.6rem', background: '#F1F5F9', borderRadius: '10px' }}>
            <Shield size={20} style={{ color: 'var(--secondary)' }} />
          </div>
          <div>
            <h4 style={{ fontWeight: 800 }}>Seguridad</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Gestión de roles y permisos de acceso avanzados.</p>
          </div>
        </div>
      </div>

    </div>
  );
}

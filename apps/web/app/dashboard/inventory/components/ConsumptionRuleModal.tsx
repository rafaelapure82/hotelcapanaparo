'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

export const ConsumptionRuleModal = ({ item, onClose }: { item: any, onClose: () => void }) => {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    qtyPerGuest: 0,
    qtyPerNight: 0,
    qtyPerBooking: 0,
  });

  useEffect(() => {
    fetchRules();
  }, [item.id]);

  const fetchRules = async () => {
    try {
      const { data } = await api.get(`/inventory/rules`);
      // Find rule for this item
      const itemRule = data.find((r: any) => r.recordId === item.id);
      if (itemRule) {
        setFormData({
          qtyPerGuest: itemRule.qtyPerGuest,
          qtyPerNight: itemRule.qtyPerNight,
          qtyPerBooking: itemRule.qtyPerBooking,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/inventory/rules`, {
        recordId: item.id,
        ...formData
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '1.5rem' }}>
      <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Reglas de Consumo</h2>
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Cálculo automático para <strong>{item.item}</strong></p>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ padding: '1.5rem', background: 'var(--dominant)', borderRadius: '24px', border: '1px solid var(--primary-light)' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Por Cada Huésped</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input 
                  type="number" 
                  step="0.1"
                  value={formData.qtyPerGuest}
                  onChange={(e) => setFormData({...formData, qtyPerGuest: +e.target.value})}
                  style={{ width: '100px', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '1.2rem', fontWeight: 900 }}
                />
                <span style={{ fontWeight: 700 }}>{item.unit} por persona</span>
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Por Cada Noche</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input 
                  type="number" 
                  step="0.1"
                  value={formData.qtyPerNight}
                  onChange={(e) => setFormData({...formData, qtyPerNight: +e.target.value})}
                  style={{ width: '100px', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '1.2rem', fontWeight: 900 }}
                />
                <span style={{ fontWeight: 700 }}>{item.unit} por noche</span>
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Por Cada Reserva (Fijo)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input 
                  type="number" 
                  step="0.1"
                  value={formData.qtyPerBooking}
                  onChange={(e) => setFormData({...formData, qtyPerBooking: +e.target.value})}
                  style={{ width: '100px', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '1.2rem', fontWeight: 900 }}
                />
                <span style={{ fontWeight: 700 }}>{item.unit} adicionales</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#ecfdf5', borderRadius: '20px', border: '1px solid #10b981' }}>
            <p style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowRight size={16} /> 
                Ejemplo: Una estancia de 2 personas x 3 noches consumirá 
                <strong> {Math.ceil((formData.qtyPerGuest * 2) + (formData.qtyPerNight * 3) + formData.qtyPerBooking)} {item.unit}</strong>
            </p>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%', padding: '1.25rem', borderRadius: '18px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 10px 15px -3px rgba(46, 196, 182, 0.4)' }}
        >
          {saving ? 'Guardando...' : <><Save size={20} /> Guardar Regla Mágica</>}
        </button>
      </div>
    </div>
  );
};

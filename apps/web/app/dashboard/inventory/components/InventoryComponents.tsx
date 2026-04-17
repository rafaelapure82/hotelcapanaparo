'use client';

import React from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  User as UserIcon,
  Tag
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const InventoryStats = ({ stats }: { stats: any }) => {
  const { formatPrice } = useLanguage();
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
      {[
        { label: 'Valor de Inventario', value: formatPrice(stats.totalValue || 0), icon: TrendingUp, color: '#E0F2F1', textColor: '#00695C' },
        { label: 'Suministros Críticos', value: stats.lowStockCount || 0, icon: AlertCircle, color: '#FFF3E0', textColor: '#E65100' },
        { label: 'Total Árticulos', value: stats.totalItems || 0, icon: Package, color: '#F1F5F9', textColor: '#475569' }
      ].map((card, i) => (
        <div key={i} style={{ 
          background: 'white', padding: '1.25rem', borderRadius: '20px', border: '1px solid #E2E8F0',
          display: 'flex', alignItems: 'center', gap: '1rem'
        }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: card.color }}>
            <card.icon size={20} style={{ color: card.textColor }} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>{card.label}</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export const KardexTimeline = ({ transactions }: { transactions: any[] }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {transactions.map((t, i) => (
        <div key={t.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
          {i !== transactions.length - 1 && (
            <div style={{ position: 'absolute', left: '12px', top: '24px', bottom: '-24px', width: '2px', background: '#E2E8F0' }} />
          )}
          <div style={{ 
            width: '26px', height: '26px', borderRadius: '50%', 
            background: t.type === 'IN' ? '#DCFCE7' : t.type === 'OUT' ? '#FEE2E2' : '#F1F5F9',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1,
            border: '2px solid white'
          }}>
            {t.type === 'IN' ? <ArrowUpRight size={14} color="#166534" /> : t.type === 'OUT' ? <ArrowDownRight size={14} color="#991B1B" /> : <Clock size={14} color="#475569" />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{t.reason}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: 600 }}>{new Date(t.createdAt).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem' }}>
              <span style={{ 
                fontWeight: 900, 
                color: t.type === 'IN' ? '#166534' : t.type === 'OUT' ? '#991B1B' : '#475569' 
              }}>
                {t.type === 'IN' ? '+' : t.type === 'OUT' ? '-' : ''}{t.quantity} unidades
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--secondary)' }}>
                <UserIcon size={12} />
                <span>Sistema</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

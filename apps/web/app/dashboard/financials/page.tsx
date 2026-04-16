'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { DollarSign, Download, TrendingUp, ArrowRight, Wallet } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function FinancialsPage() {
  const { formatPrice, exchangeRate } = useLanguage();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats/admin');
        setStats(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="animate-in" style={{ display: 'grid', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Control Financiero</h2>
          <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Balance general de ingresos, conversiones y reportes fiscales.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => window.open(`${api.defaults.baseURL}/stats/export-revenue`, '_blank')}
            style={{ 
              background: 'var(--primary)', color: 'white', border: 'none', 
              padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 800, 
              display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' 
            }}
          >
            <Download size={18} /> Exportar Ingresos
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Revenue Summaries */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--dominant)', borderRadius: '12px' }}>
              <Wallet size={24} style={{ color: 'var(--primary)' }} />
            </div>
            <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>Balance Total (USD)</h4>
          </div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 900 }}>{formatPrice(stats?.totalRevenue || 0).split(' / ')[0]}</h3>
          <p style={{ color: '#166534', fontWeight: 700, fontSize: '0.9rem', marginTop: '0.5rem' }}>+12.5% vs mes anterior</p>
        </div>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.75rem', background: '#FEF3C7', borderRadius: '12px' }}>
              <DollarSign size={24} style={{ color: '#92400E' }} />
            </div>
            <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>Balance Estimado (Bs)</h4>
          </div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 900 }}>{((stats?.totalRevenue || 0) * exchangeRate).toLocaleString()} Bs</h3>
          <p style={{ color: 'var(--secondary)', fontWeight: 600, fontSize: '0.8rem', marginTop: '0.5rem' }}>Tasa configurada: {exchangeRate} Bs/$</p>
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
        <h3 style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: '2rem' }}>Distribución Mensual de Ingresos</h3>
        <div style={{ height: '400px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.revenueChart || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
              <XAxis dataKey="name" fontSize={12} fontWeight={700} stroke="#718096" axisLine={false} tickLine={false} />
              <YAxis fontSize={12} fontWeight={700} stroke="#718096" axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(46, 196, 182, 0.05)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="total" fill="var(--primary)" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

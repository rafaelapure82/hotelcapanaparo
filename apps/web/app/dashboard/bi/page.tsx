'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  BarChart3, 
  Activity, 
  ArrowUpRight,
  Download,
  Filter
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

export default function BIPage() {
  const { formatPrice } = useLanguage();
  const [data, setData] = useState<any>({ 
    projections: { weekly: [], monthly: [], yearly: [] },
    profitability: [],
    occupancyPulse: [],
    operational: { efficiencyScore: '...', avgCleaningTime: 0, tasksCompleted: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetchBI();
  }, []);

  const fetchBI = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stats/bi');
      setData(res.data);
    } catch (error) {
      console.error('Error fetching BI data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', fontWeight: 800 }}>Sincronizando Cerebro BI...</div>;

  const chartData = data.projections[timeframe];

  return (
    <div className="animate-in" style={{ display: 'grid', gap: '2.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-1px' }}>
            Inteligencia <span style={{ color: 'var(--primary)' }}>Estratégica</span>
          </h2>
          <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Proyecciones financieras y optimización operativa del Hotel</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={async () => {
                const { generateBIReport } = await import('@/lib/reports');
                generateBIReport(data, timeframe);
              }}
              style={{ padding: '0.75rem 1.25rem', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <Download size={18} /> Exportar Reporte
            </button>
            <button style={{ padding: '0.75rem 1.25rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <Target size={18} /> Metas 2026
            </button>
        </div>
      </header>

      {/* Primary KPI Grid */}
      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <StatCard 
            title="Proyección Próximos 30 Días" 
            value={formatPrice(data.projections.monthly[0]?.total || 0)} 
            icon={<TrendingUp />} 
            trend="+12.4% vs Mes Anterior"
            color="var(--primary)"
        />
        <StatCard 
            title="Salud Operativa" 
            value={data.operational.efficiencyScore} 
            icon={<Zap />} 
            trend={`Limpieza avg: ${data.operational.avgCleaningTime} min`}
            color="#3B82F6"
        />
        <StatCard 
            title="Eficiencia de Inventario" 
            value="88.2%" 
            icon={<Activity />} 
            trend="Costo bajo control"
            color="#22C55E"
        />
      </div>

      {/* main BI Charts Area */}
      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1.6fr 1fr' }}>
        
        {/* Revenue Projection Card */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontWeight: 900, fontSize: '1.2rem' }}>Proyección de Ingresos Brutos</h3>
                <div style={{ display: 'flex', background: '#F1F5F9', padding: '0.3rem', borderRadius: '10px' }}>
                    <button 
                        onClick={() => setTimeframe('weekly')}
                        style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', background: timeframe === 'weekly' ? 'white' : 'transparent', boxShadow: timeframe === 'weekly' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>Semanal</button>
                    <button 
                        onClick={() => setTimeframe('monthly')}
                        style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', background: timeframe === 'monthly' ? 'white' : 'transparent', boxShadow: timeframe === 'monthly' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>Mensual</button>
                    <button 
                        onClick={() => setTimeframe('yearly')}
                        style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', background: timeframe === 'yearly' ? 'white' : 'transparent', boxShadow: timeframe === 'yearly' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>Anual</button>
                </div>
            </div>
            <div style={{ height: '350px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fontWeight: 700, fill: '#64748B' }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fontWeight: 700, fill: '#64748B' }}
                            tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 800 }}
                            formatter={(value) => formatPrice(value as number)}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="total" 
                            stroke="var(--primary)" 
                            strokeWidth={4}
                            fillOpacity={1} 
                            fill="url(#colorTotal)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Profitability Index Card */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '32px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: '1.5rem' }}>Índice de Rentabilidad</h3>
            <div style={{ display: 'grid', gap: '1.25rem' }}>
                {data.profitability.map((item: any, idx: number) => (
                    <div key={idx} style={{ 
                        padding: '1.25rem', 
                        background: 'var(--dominant)', 
                        borderRadius: '20px',
                        border: '1px solid rgba(46, 196, 182, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{item.name}</span>
                            <span style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '0.95rem' }}>{item.margen.toFixed(1)}% margen</span>
                        </div>
                        <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${item.margen}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
                            <span>Costo: {formatPrice(item.costos)}</span>
                            <span>Ingreso: {formatPrice(item.ingresos)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Secondary Pulse area */}
      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 2fr' }}>
          <div style={{ background: '#1E293B', color: 'white', padding: '2rem', borderRadius: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <Activity color="var(--primary)" />
                  <h3 style={{ fontWeight: 900, fontSize: '1.2rem' }}>Pulso de Ocupación</h3>
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                  {data.occupancyPulse.map((p: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: i === 0 ? 'var(--primary)' : '#475569' }} />
                          <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600 }}>{p.name}</span>
                          <span style={{ fontWeight: 800 }}>{p.active} reservas</span>
                      </div>
                  ))}
              </div>
          </div>

          <div style={{ background: 'white', padding: '2rem', borderRadius: '32px', border: '1px solid #E2E8F0', display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Salud Operativa Global</h3>
                  <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem' }}>Relación entre limpieza y satisfacción garantizada.</p>
                  
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                      <div>
                          <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{data.operational.avgCleaningTime}</p>
                          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Minutos de Limpieza</p>
                      </div>
                      <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '1.5rem' }}>
                          <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#22C55E' }}>{data.operational.tasksCompleted}</p>
                          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Suites Listas Hoy</p>
                      </div>
                  </div>
              </div>
              <div style={{ width: '200px', height: '150px', background: 'var(--dominant)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <BarChart3 size={40} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                  <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.1rem' }}>KPI: {data.operational.efficiencyScore}</span>
              </div>
          </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: any) {
    return (
        <div style={{ 
            background: 'white', 
            padding: '1.75rem', 
            borderRadius: '28px', 
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: color }}>{icon}</div>
                <div style={{ padding: '0.35rem 0.6rem', background: '#F0FDF4', color: '#166534', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <ArrowUpRight size={12} /> {trend.split(' ')[0]}
                </div>
            </div>
            <div>
                <h4 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.25rem' }}>{value}</h4>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>{title}</p>
            </div>
        </div>
    );
}

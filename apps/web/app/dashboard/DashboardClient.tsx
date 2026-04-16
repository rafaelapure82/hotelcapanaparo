'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  FileText,
  MessageCircle,
  Filter
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/lib/api';
import { generateInvoicePDF, generateInventoryReport } from '@/lib/reports';
import ChatModal from '@/components/ChatModal';
import { useAuth } from '@/context/AuthContext';

const COLORS = ['#2EC4B6', '#FF9F1C', '#CBF3F0', '#022B3A'];

export default function DashboardPage() {
  const { formatPrice, t, exchangeRate } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    newBookings: 0,
    checkIn: 0,
    checkOut: 0,
    revenueChart: [],
    platforms: []
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [activeChat, setActiveChat] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, bookingsRes, homesRes] = await Promise.all([
          api.get('/stats/admin'),
          api.get('/bookings/manage'),
          api.get('/homes')
        ]);
        setStats({
          totalRevenue: statsRes.data?.totalRevenue ?? 0,
          newBookings: statsRes.data?.newBookings ?? 0,
          checkIn: statsRes.data?.checkIn ?? 0,
          checkOut: statsRes.data?.checkOut ?? 0,
          revenueChart: statsRes.data?.revenueChart ?? [],
          platforms: statsRes.data?.platforms ?? []
        });
        setRecentBookings(bookingsRes.data.slice(0, 5));
        setProperties(homesRes.data);
      } catch (e) {
        console.error('Failed to fetch dashboard data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontWeight: 800, color: 'var(--secondary)' }}>Sincronizando datos de inteligencia...</p>
      </div>
    );
  }

  return (
    <div className="animate-in" style={{ display: 'grid', gap: '2rem' }}>
      
      {/* Top Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
        {[
          { label: 'New Bookings', value: stats.newBookings, icon: Calendar, color: '#F1F5F9', growth: '+8.7%' },
          { label: 'Check-In Today', value: stats.checkIn, icon: Users, color: '#E0F2F1', growth: '+3.5%' },
          { label: 'Check-Out Today', value: stats.checkOut, icon: ArrowDownRight, color: '#FEE2E2', growth: '-1.2%' },
          { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: '#FEF3C7', growth: '+5.7%' }
        ].map((card, i) => (
          <div key={i} style={{ 
            background: 'white', padding: '1.5rem', borderRadius: '24px', 
            border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '1rem',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: card.color }}>
                <card.icon size={20} style={{ color: 'var(--primary)' }} />
              </div>
              <span style={{ 
                fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.5rem', borderRadius: '8px',
                background: card.growth.startsWith('+') ? '#DCFCE7' : '#FEE2E2',
                color: card.growth.startsWith('+') ? '#166534' : '#991B1B'
              }}>
                {card.growth}
              </span>
            </div>
            <div>
              <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>{card.label}</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }}>
        
        {/* Revenue Chart */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontWeight: 900, fontSize: '1.1rem' }}>Revenue Evolution</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>Crecimiento mensual acumulado</p>
            </div>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button 
                onClick={() => generateInventoryReport(properties)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '12px', background: 'var(--dominant)', color: 'var(--primary)', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '0.75rem' }}
              >
                <Download size={14} /> Export Inventory
              </button>
              <button 
                onClick={() => window.open(`${api.defaults.baseURL}/stats/export-revenue`, '_blank')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '12px', background: '#FEF3C7', color: '#92400E', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '0.75rem' }}
              >
                <FileText size={14} /> Export Revenue
              </button>
            </div>
          </div>
          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dashboardMetrics?.revenueChart || stats.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                <XAxis dataKey="name" fontSize={11} stroke="#A0AEC0" axisLine={false} tickLine={false} />
                <YAxis fontSize={11} stroke="#A0AEC0" axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Total Revenue']}
                />
                <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={4} dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Chart */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
          <h3 style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Booking by Platform</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600, marginBottom: '2rem' }}>Distribución de canales de venta</p>
          <div style={{ height: '280px', width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={stats.platforms.length > 0 ? stats.platforms : [{name: 'Direct', value: 100}]} 
                  innerRadius={75} 
                  outerRadius={100} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {(stats.platforms.length > 0 ? stats.platforms : [{name: 'Direct', value: 100}]).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Main Source</p>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>
                {stats.platforms[0]?.name || 'Direct'}
              </h4>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
            {stats.platforms.map((p: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                </div>
                <span style={{ fontWeight: 800 }}>{p.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Booking List Table */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 900, fontSize: '1.1rem' }}>Ultimas Reservas confirmadas</h3>
          <button style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>Ver todas</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #EDF2F7', textAlign: 'left' }}>
                <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Huésped</th>
                <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Propiedad</th>
                <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Fechas</th>
                <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Estado</th>
                <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Origen</th>
                <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((row: any) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #F7FAFC', transition: 'background 0.2s ease' }} className="hover:bg-slate-50">
                  <td style={{ padding: '1.25rem 1rem', fontWeight: 800, fontSize: '0.9rem' }}>{row.firstName} {row.lastName}</td>
                  <td style={{ padding: '1rem', color: 'var(--secondary)', fontWeight: 600, fontSize: '0.85rem' }}>{row.home?.title || 'N/A'}</td>
                  <td style={{ padding: '1rem', fontWeight: 600, fontSize: '0.8rem' }}>
                    {new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800,
                      background: row.status === 'confirmed' ? '#DCFCE7' : row.status === 'pending' ? '#FEF3C7' : '#F1F5F9',
                      color: row.status === 'confirmed' ? '#166534' : row.status === 'pending' ? '#92400E' : '#475569'
                    }}>{row.status.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)' }}>{row.platform || 'Direct'}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => generateInvoicePDF(row, row.home, exchangeRate)}
                        style={{ background: 'transparent', border: '1px solid #E2E8F0', padding: '0.4rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        <FileText size={14} />
                      </button>
                      <button 
                        onClick={() => setActiveChat({
                          bookingId: row.id,
                          receiverName: `${row.firstName} ${row.lastName}`,
                          toUser: row.buyerId
                        })}
                        style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        <MessageCircle size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeChat && (
        <ChatModal
          bookingId={activeChat.bookingId}
          receiverName={activeChat.receiverName}
          toUser={activeChat.toUser}
          onClose={() => setActiveChat(null)}
        />
      )}

    </div>
  );
}

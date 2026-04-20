'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Crown, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Filter,
  UserCheck,
  CreditCard
} from 'lucide-react';
import api from '@/lib/api';

interface Guest {
  id: number;
  email: string;
  documentId: string;
  firstName: string;
  lastName: string;
  phone: string;
  loyaltyStatus: string;
  totalSpentPayed: number;
  totalStays: number;
  createdAt: string;
}

export default function GuestDirectoryPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const { data } = await api.get('/guests'); // I need to create this endpoint in API!
      setGuests(data);
    } catch (err) {
      console.error('Failed to fetch guests', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'platinum': return '#7C3AED'; // Purple
      case 'gold': return '#F59E0B'; // Amber
      case 'silver': return '#64748B'; // Slate
      default: return '#94A3B8';
    }
  };

  const filteredGuests = guests.filter(g => 
    `${g.firstName} ${g.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.documentId.includes(searchTerm)
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--foreground)', marginBottom: '0.5rem' }}>Directorio de Huéspedes de Élite</h2>
          <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Gestión inteligente de lealtad y CRM del Hotel Capanaparo</p>
      </div>

      {/* Stats overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <StatCard icon={<Users color="var(--primary)"/>} title="Total Huéspedes" value={guests.length.toString()} />
          <StatCard icon={<Crown color="#F59E0B"/>} title="Huéspedes Gold/VIP" value={guests.filter(g => g.loyaltyStatus !== 'Regular').length.toString()} />
          <StatCard icon={<TrendingUp color="#10B981"/>} title="LTV Promedio" value={`$${(guests.reduce((acc, g) => acc + g.totalSpentPayed, 0) / (guests.length || 1)).toFixed(2)}`} />
      </div>

      {/* Filter and Search */}
      <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '24px', 
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
          border: '1px solid #E2E8F0',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
      }}>
          <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} size={20} />
              <input 
                  type="text" 
                  placeholder="Buscar por nombre, email o cédula/DNI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 600 }}
              />
          </div>
          <button style={{ padding: '0.85rem 1.25rem', border: '1px solid #E2E8F0', background: 'white', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <Filter size={18} /> Filtros
          </button>
      </div>

      {/* Guest Table */}
      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <tr>
                      <th style={thStyle}>Huésped</th>
                      <th style={thStyle}>Identificación</th>
                      <th style={thStyle}>Nivel</th>
                      <th style={thStyle}>Estancias</th>
                      <th style={thStyle}>Total Gastado</th>
                      <th style={thStyle}>Acciones</th>
                  </tr>
              </thead>
              <tbody>
                  {loading ? (
                      <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Cargando directorio...</td></tr>
                  ) : filteredGuests.map(guest => (
                      <tr key={guest.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }}>
                          <td style={tdStyle}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--dominant)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 800 }}>
                                      {guest.firstName[0]}{guest.lastName[0]}
                                  </div>
                                  <div>
                                      <p style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.9rem' }}>{guest.firstName} {guest.lastName}</p>
                                      <p style={{ fontSize: '0.75rem', color: '#64748B' }}>{guest.email}</p>
                                  </div>
                              </div>
                          </td>
                          <td style={tdStyle}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>
                                  <CreditCard size={14} /> {guest.documentId}
                              </div>
                          </td>
                          <td style={tdStyle}>
                              <span style={{ 
                                  padding: '0.3rem 0.75rem', 
                                  borderRadius: '8px', 
                                  fontSize: '0.7rem', 
                                  fontWeight: 900, 
                                  textTransform: 'uppercase', 
                                  background: `${getStatusColor(guest.loyaltyStatus)}15`, 
                                  color: getStatusColor(guest.loyaltyStatus),
                                  border: `1px solid ${getStatusColor(guest.loyaltyStatus)}30`
                              }}>
                                  {guest.loyaltyStatus}
                              </span>
                          </td>
                          <td style={tdStyle}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1E293B', fontWeight: 700 }}>
                                  <Calendar size={14} color="var(--primary)" /> {guest.totalStays}
                              </div>
                          </td>
                          <td style={tdStyle}>
                              <span style={{ fontWeight: 900, color: '#10B981' }}>${guest.totalSpentPayed.toFixed(2)}</span>
                          </td>
                          <td style={tdStyle}>
                              <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 800, fontSize: '0.8rem' }}>
                                  Ver Perfil <ChevronRight size={14} />
                              </button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
    return (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
            <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B' }}>{value}</p>
            </div>
        </div>
    )
}

const thStyle: React.CSSProperties = { padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' };
const tdStyle: React.CSSProperties = { padding: '1.2rem 1.5rem' };

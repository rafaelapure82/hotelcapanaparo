'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { Search, Filter, Calendar, User, Download } from 'lucide-react';

export default function ReservationsPage() {
  const { formatPrice, formatDate } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings/manage');
        setBookings(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="animate-in" style={{ display: 'grid', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Gestión de Reservas</h2>
          <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Control total de entradas, salidas y estados de pago.</p>
        </div>
        <button style={{ 
          background: 'var(--primary)', color: 'white', border: 'none', 
          padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 800, 
          display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' 
        }}>
          <Download size={18} /> Exportar Reporte
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{ 
        background: 'white', padding: '1rem', borderRadius: '16px', 
        border: '1px solid #E2E8F0', display: 'flex', gap: '1rem', alignItems: 'center' 
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input 
            type="text" 
            placeholder="Buscar por huésped, ID o propiedad..." 
            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 600 }}
          />
        </div>
        <select style={{ padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 700, outline: 'none' }}>
          <option>Todos los Estados</option>
          <option>Confirmadas</option>
          <option>Pendientes</option>
          <option>Canceladas</option>
        </select>
        <div style={{ padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} /> Fecha
        </div>
      </div>

      {/* Bookings Table */}
      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)' }}>ID</th>
              <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)' }}>HUÉSPED</th>
              <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)' }}>PROPIEDAD</th>
              <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)' }}>FECHAS</th>
              <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)' }}>TOTAL</th>
              <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)' }}>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking: any) => (
              <tr key={booking.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>#{booking.id}</td>
                <td style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--dominant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={16} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 800 }}>{booking.firstName} {booking.lastName}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: 600 }}>{booking.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.2rem', fontSize: '0.85rem', fontWeight: 600 }}>{booking.home?.title || 'Suite'}</td>
                <td style={{ padding: '1.2rem', fontSize: '0.85rem', fontWeight: 700 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{formatDate(booking.startDate)}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>{formatDate(booking.endDate)}</span>
                  </div>
                </td>
                <td style={{ padding: '1.2rem', fontWeight: 800 }}>{formatPrice(booking.total)}</td>
                <td style={{ padding: '1.2rem' }}>
                  <span style={{ 
                    padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900,
                    background: booking.status === 'confirmed' ? '#DCFCE7' : booking.status === 'pending' ? '#FEF3C7' : '#F1F5F9',
                    color: booking.status === 'confirmed' ? '#166534' : booking.status === 'pending' ? '#B45309' : '#475569'
                  }}>
                    {booking.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && !loading && (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <p style={{ fontWeight: 700, color: 'var(--secondary)' }}>No se encontraron reservas.</p>
          </div>
        )}
      </div>
    </div>
  );
}

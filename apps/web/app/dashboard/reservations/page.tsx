'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { Search, Filter, Calendar, User, Download, Package, Eye, Check, X, ExternalLink } from 'lucide-react';

export default function ReservationsPage() {
  const { formatPrice, formatDate } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedExtraBooking, setSelectedExtraBooking] = useState<any>(null);
  const [viewingBooking, setViewingBooking] = useState<any>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/bookings/manage');
      setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      fetchBookings();
      if (viewingBooking?.id === id) setViewingBooking(null);
    } catch (err) {
      console.error('Update failed', err);
      alert('Error actualizando el estado');
    }
  };

  useEffect(() => {
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
              <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textAlign: 'right' }}>ACCIONES</th>
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
                <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => setViewingBooking(booking)}
                        style={{ 
                          background: 'var(--primary)', color: 'white', border: 'none',
                          padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.7rem', 
                          fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem'
                        }}>
                        <Eye size={14} /> Gestionar
                      </button>

                      {booking.status === 'confirmed' && (
                        <button 
                          onClick={() => setSelectedBooking(booking)}
                          style={{ 
                            background: 'var(--dominant)', color: 'var(--primary)', border: 'none',
                            padding: '0.5rem 0.8rem', borderRadius: '10px', fontSize: '0.7rem', 
                            fontWeight: 900, cursor: 'pointer', display: 'flex'
                          }}
                          title="Suministros"
                        >
                          <Package size={14} />
                        </button>
                      )}
                    </div>
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

      {selectedBooking && (
        <ConsumptionModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
          onConfirm={() => setSelectedBooking(null)} 
        />
      )}

      {selectedExtraBooking && (
        <ExtrasModal 
          booking={selectedExtraBooking} 
          onClose={() => setSelectedExtraBooking(null)} 
          onSuccess={() => setSelectedExtraBooking(null)}
        />
      )}

      {viewingBooking && (
        <BookingDetailsModal 
          booking={viewingBooking}
          onClose={() => setViewingBooking(null)}
          onUpdateStatus={updateStatus}
          formatPrice={formatPrice}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}

function BookingDetailsModal({ booking, onClose, onUpdateStatus, formatPrice, formatDate }: any) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const proofUrl = booking.paymentProofUrl ? (booking.paymentProofUrl.startsWith('http') ? booking.paymentProofUrl : `${apiBase}${booking.paymentProofUrl}`) : null;

    return (
        <div style={{ 
            position: 'fixed', inset: 0, 
            background: 'rgba(241, 245, 249, 0.8)', // Fondo claro y suave, nada de negro
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' 
        }}>
            <div style={{ 
                background: '#FFFFFF', borderRadius: '32px', width: '900px', 
                maxWidth: '100%', maxHeight: '90vh', overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 70px -15px rgba(0,0,0,0.15)',
                border: '1px solid #E2E8F0',
                position: 'relative'
            }}>
                
                {/* Header Compacto y Elegante */}
                <div style={{ 
                    padding: '1.5rem 2.5rem', borderBottom: '1px solid #F1F5F9',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#FFFFFF'
                }}>
                    <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Reserva #RE-{booking.id}
                        </span>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', marginTop: '0.2rem' }}>
                            {booking.home?.title || 'Suite Principal'}
                        </h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        style={{ 
                            background: '#F8FAFC', border: '1px solid #E2E8F0', width: '40px', height: '40px', 
                            borderRadius: '12px', cursor: 'pointer', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', color: '#64748B',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#64748B'; }}
                    >
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>

                {/* Body: Dos Columnas Balanceadas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', overflowY: 'auto', flex: 1 }}>
                    
                    {/* Detalles del Cliente y Estadía */}
                    <div style={{ padding: '2.5rem', borderRight: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'grid', gap: '2.5rem' }}>
                            
                            <div>
                                <h4 style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' }}>Información del Huésped</h4>
                                <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--dominant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={26} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>{booking.firstName} {booking.lastName}</p>
                                        <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>{booking.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ background: '#F8FAFC', padding: '1.2rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Check-in</span>
                                    <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', marginTop: '0.3rem' }}>{formatDate(booking.startDate)}</p>
                                </div>
                                <div style={{ background: '#F8FAFC', padding: '1.2rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Huéspedes</span>
                                    <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', marginTop: '0.3rem' }}>{booking.numberOfGuests} Personas</p>
                                </div>
                            </div>

                            <div style={{ background: 'var(--primary)', padding: '2rem', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.9 }}>INVERSIÓN TOTAL</span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
                                    <span style={{ fontSize: '2.8rem', fontWeight: 900 }}>{formatPrice(booking.total)}</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>USD</span>
                                </div>
                                <Check size={120} style={{ position: 'absolute', right: '-5%', bottom: '-15%', opacity: 0.1 }} />
                            </div>
                        </div>
                    </div>

                    {/* Pago y Acciones */}
                    <div style={{ padding: '2.5rem', background: '#F8FAFC' }}>
                        <h4 style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '1.2rem', letterSpacing: '1px' }}>Comprobante de Pago</h4>
                        
                        <div style={{ marginBottom: '2rem' }}>
                            {proofUrl ? (
                                <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', border: '4px solid white', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}>
                                    <img src={proofUrl} alt="Documento" style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                                    <a href={proofUrl} target="_blank" rel="noreferrer" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s', textDecoration: 'none', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                                        <Eye size={30} />
                                    </a>
                                </div>
                            ) : (
                                <div style={{ height: '240px', background: 'white', borderRadius: '24px', border: '2px dashed #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Package size={40} color="#CBD5E1" />
                                    <p style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.8rem' }}>Sin archivo adjunto</p>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gap: '0.8rem' }}>
                            {booking.status !== 'confirmed' && (
                                <button 
                                    onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                                    style={{ padding: '1.2rem', borderRadius: '18px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
                                >
                                    <Check size={20} /> Aprobar Operación
                                </button>
                            )}
                            <button 
                                onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                                style={{ padding: '1rem', borderRadius: '18px', background: 'white', color: '#EF4444', border: '2px solid #FEE2E2', fontWeight: 800, cursor: 'pointer' }}
                            >
                                Rechazar Reserva
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Minimalista */}
                <div style={{ padding: '1.2rem 2.5rem', background: 'white', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
                        Cerrar Ventana
                    </button>
                </div>
            </div>
        </div>
    );
}

function ExtrasModal({ booking, onClose, onSuccess }: any) {
    const [items, setItems] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [qty, setQty] = useState(1);
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const { data } = await api.get('/inventory');
                setItems(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchInventory();
    }, []);

    const handleAdd = async () => {
        try {
            await api.post(`/bookings/${booking.id}/extras`, {
                recordId: selectedItem?.id,
                name: selectedItem?.item || 'Servicio Extra',
                quantity: qty,
                amount: amount || selectedItem?.salePrice || 0
            });
            onSuccess();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', width: '500px', maxWidth: '90%' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem' }}>Agregar Cargo Extra</h3>
                
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Seleccionar Producto (Stock)</label>
                        <select 
                            onChange={(e) => {
                                const item = items.find(i => i.id === +e.target.value);
                                setSelectedItem(item);
                                if (item) setAmount(item.salePrice || 0);
                            }}
                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 700 }}
                        >
                            <option value="">Servicio Manual / No Inventariado</option>
                            {items.map(i => <option key={i.id} value={i.id}>{i.item} - ${i.salePrice || 0}</option>)}
                        </select>
                    </div>

                    {!selectedItem && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Nombre del Servicio</label>
                            <input type="text" placeholder="Ej: Tour Guía" style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 700 }} />
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Cantidad</label>
                            <input type="number" value={qty} onChange={(e) => setQty(+e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 700 }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Precio ($)</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 700 }} />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '1rem', borderRadius: '16px', background: '#F1F5F9', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Cerrar</button>
                    <button onClick={handleAdd} style={{ flex: 1, padding: '1rem', borderRadius: '16px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer' }}>Agregar a Reserva</button>
                </div>
            </div>
        </div>
    );
}

function ConsumptionModal({ booking, onClose, onConfirm }: any) {
    const [consumption, setConsumption] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                const { data } = await api.get(`/inventory/bookings/${booking.id}/consumption`);
                setConsumption(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchPreview();
    }, [booking.id]);

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            await api.post(`/inventory/bookings/${booking.id}/confirm-consumption`);
            onConfirm();
        } catch (e) {
            console.error(e);
        } finally {
            setConfirming(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', width: '500px', maxWidth: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Salida de Suministros</h3>
                <p style={{ color: 'var(--secondary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '2rem' }}>Confirma los artículos consumidos para la reserva <span style={{ color: 'var(--primary)' }}>#{booking.id}</span>.</p>
                
                <div style={{ background: '#F8FAFC', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #E2E8F0' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.5px' }}>Proyección de Consumo</h4>
                    {loading ? <p>Calculando...</p> : consumption.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic' }}>No hay reglas de consumo definidas.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {consumption.map(item => (
                                <div key={item.recordId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{item.item}</span>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 900 }}>{item.sku}</span>
                                    </div>
                                    <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--foreground)' }}>
                                        -{item.estimatedQty} <span style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>{item.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '1rem', borderRadius: '16px', background: '#F1F5F9', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Cancelar</button>
                    <button 
                        onClick={handleConfirm}
                        disabled={confirming || loading}
                        style={{ flex: 1, padding: '1rem', borderRadius: '16px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(46, 196, 182, 0.4)' }}>
                        {confirming ? 'Procesando...' : 'Confirmar Salida'}
                    </button>
                </div>
            </div>
        </div>
    );
}

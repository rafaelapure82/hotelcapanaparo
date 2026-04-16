'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/lib/api';

interface SuiteDetailModalProps {
  suite: any;
  onClose: () => void;
}

export default function SuiteDetailModal({ suite, onClose }: SuiteDetailModalProps) {
  const { t, formatPrice, exchangeRate } = useLanguage();
  const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Success
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    guests: 1,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const amenitiesMap: Record<string, { icon: string; label: string }> = {
    wifi: { icon: '📶', label: t('wifi') },
    ac: { icon: '❄️', label: t('ac') },
    pool: { icon: '🏊', label: t('pool') },
    parking: { icon: '🚗', label: t('parking') },
    kitchen: { icon: '🍳', label: t('kitchen') },
    tv: { icon: '📺', label: t('tv') },
  };

  const parseAmenities = (amenities: any) => {
    if (!amenities) return [];
    try {
      const parsed = JSON.parse(amenities);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return amenities.split(',').map((a: string) => a.trim().toLowerCase());
    }
  };

  const suiteAmenities = parseAmenities(suite.amenities);

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const calculateTotal = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const nights = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    return (suite.basePrice || 0) * nights;
  };

  const handleBookInitiate = () => {
    if (!bookingData.startDate || !bookingData.endDate) {
      alert('Por favor selecciona las fechas');
      return;
    }
    setStep(2);
  };

  const handleFinalBooking = async () => {
    if (!proofFile) {
      alert('Por favor sube el comprobante de pago');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload proof
      const formData = new FormData();
      formData.append('file', proofFile);
      const uploadRes = await api.post('/uploads', formData);
      const proofUrl = uploadRes.data.url;

      // 2. Create booking
      await api.post('/bookings', {
        ...bookingData,
        serviceId: suite.id,
        paymentProofUrl: proofUrl,
        numberOfGuests: bookingData.guests,
      });

      setStep(3);
    } catch (err) {
      console.error('Booking failed', err);
      alert('Error al procesar la reserva. Por favor intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(2, 43, 58, 0.4)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }} onClick={onClose}>
      
      <div className="animate-in" style={{
        background: 'white',
        width: '100%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        borderRadius: '40px',
        overflow: 'hidden',
        display: 'flex',
        boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '1.5rem', right: '1.5rem', width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, fontSize: '1.5rem'
        }}>×</button>

        {/* Left: Room Showcase */}
        <div style={{ flex: 1, position: 'relative', background: '#022b3a' }}>
          <img 
            src={getImageUrl(suite.gallery?.split(',')[0]) || ''} 
            alt={suite.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
          />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '4rem 3rem',
            background: 'linear-gradient(to top, rgba(2, 43, 58, 0.9), transparent)', color: 'white'
          }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>{suite.title}</h2>
            <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>📍 {suite.city}, {suite.country}</p>
          </div>
        </div>

        {/* Right: Steps */}
        <div style={{ width: '500px', padding: '4rem 3rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          
          {step === 1 && (
            <>
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>A HOME AWAY FROM HOME</h3>
                <p style={{ color: 'var(--secondary)', lineHeight: 1.6 }}>{suite.description || 'Disfruta de la máxima exclusividad en esta suite única.'}</p>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ fontWeight: 800, marginBottom: '1rem' }}>Comodidades</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {Object.keys(amenitiesMap).map((key) => {
                    const isOffered = suiteAmenities.some(a => a.toLowerCase().includes(key.toLowerCase()));
                    return (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isOffered ? 1 : 0.3 }}>
                        <span>{amenitiesMap[key].icon}</span>
                        <span style={{ fontSize: '0.9rem' }}>{amenitiesMap[key].label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'var(--dominant)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 800 }}>{formatPrice(suite.basePrice)}</span>
                  <span style={{ fontSize: '0.8rem' }}>/ noche</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input type="date" value={bookingData.startDate} onChange={e => setBookingData(d => ({ ...d, startDate: e.target.value }))} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <input type="date" value={bookingData.endDate} onChange={e => setBookingData(d => ({ ...d, endDate: e.target.value }))} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                </div>
                <button onClick={handleBookInitiate} className="btn-primary" style={{ width: '100%', background: 'var(--accent)' }}>Continuar a Pago</button>
              </div>
            </>
          )}

          {step === 2 && (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '2rem' }}>Información de Pago</h3>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', textAlign: 'left' }}>
                <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Monto a Transferir:</p>
                <p style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 900 }}>{formatPrice(calculateTotal())}</p>
                <hr style={{ margin: '1rem 0', borderColor: '#eee' }} />
                <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Cuentas de Pago Móvil:</p>
                <p style={{ fontSize: '0.9rem' }}>Banesco (0134) - 0412-1234567 - V-12.345.678</p>
                <p style={{ fontSize: '0.8rem', marginTop: '1rem', color: 'var(--secondary)' }}>Una vez realizada, sube la captura aquí:</p>
              </div>

              <input 
                type="file" 
                onChange={e => setProofFile(e.target.files?.[0] || null)}
                style={{ marginBottom: '2rem', width: '100%' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button onClick={() => setStep(1)} style={{ background: '#eee', padding: '1rem', borderRadius: '12px' }}>Atrás</button>
                <button 
                  onClick={handleFinalBooking} 
                  disabled={uploading}
                  className="btn-primary" 
                  style={{ background: 'var(--accent)' }}
                >
                  {uploading ? 'Procesando...' : 'Confirmar Reserva'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>✅</div>
              <h2 style={{ fontWeight: 900, marginBottom: '1rem' }}>Solicitud Recibida</h2>
              <p style={{ color: 'var(--secondary)', lineHeight: 1.6 }}>Tu comprobante está siendo validado por nuestro equipo. Te contactaremos pronto.</p>
              <button onClick={onClose} className="btn-primary" style={{ marginTop: '2rem' }}>Cerrar</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Star, MessageSquare, Quote, User, Filter } from 'lucide-react';

export default function ReviewsPage() {
  const mockReviews = [
    { id: 1, guest: 'Juan Pérez', property: 'Capanaparo Suite Deluxe', rating: 5, comment: 'Increíble experiencia, la atención fue de primera y la habitación impecable.', date: '2026-04-10' },
    { id: 2, guest: 'Maria Garcia', property: 'Suite Presidencial', rating: 4, comment: 'Muy buena ubicación y comodidad. Solo faltó un poco más de presión en el agua.', date: '2026-04-12' },
    { id: 3, guest: 'Carlos Ruiz', property: 'Estudio Ejecutivo', rating: 5, comment: 'Excelente para viajes de negocios. El WiFi es súper rápido.', date: '2026-04-15' },
  ];

  return (
    <div className="animate-in" style={{ display: 'grid', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Reseñas y Calificaciones</h2>
        <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Escucha lo que dicen tus huéspedes sobre su estadía.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Promedio General</p>
          <h3 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' }}>4.8</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', color: '#FFD700' }}>
            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} fill="#FFD700" />)}
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #E2E8F0', cursor: 'not-allowed', opacity: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '100%', justifyContent: 'center' }}>
            <MessageSquare size={24} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 800 }}>IA: Generar Respuesta (Próximamente)</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {mockReviews.map((review) => (
          <div key={review.id} style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', gap: '2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'var(--dominant)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={30} style={{ color: 'var(--primary)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h4 style={{ fontWeight: 900, fontSize: '1.1rem' }}>{review.guest}</h4>
                <div style={{ display: 'flex', gap: '0.1rem', color: '#FFD700' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill={i < review.rating ? '#FFD700' : 'none'} stroke={i < review.rating ? '#FFD700' : '#CBD5E1'} />
                  ))}
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800, marginBottom: '0.5rem' }}>{review.property}</p>
              <div style={{ position: 'relative' }}>
                <Quote size={20} style={{ position: 'absolute', top: '-10px', left: '-10px', opacity: 0.1, color: 'var(--primary)' }} />
                <p style={{ fontSize: '0.95rem', color: 'var(--secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>"{review.comment}"</p>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginTop: '1rem' }}>Recibida el {review.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

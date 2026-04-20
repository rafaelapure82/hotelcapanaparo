'use client';

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Quote, User, Send, Eye } from 'lucide-react';
import api from '@/lib/api';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get('/reviews');
      setReviews(data);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (reviewId: number) => {
    if (!responseText.trim()) return;
    setSubmitting(true);
    try {
      await api.patch(`/reviews/${reviewId}/respond`, { response: responseText });
      setRespondingTo(null);
      setResponseText('');
      fetchReviews();
    } catch (err) {
      console.error('Failed to respond', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Computed stats
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
  const avgCleanliness = reviews.length > 0 ? (reviews.filter(r => r.cleanliness > 0).reduce((a, r) => a + (r.cleanliness || 0), 0) / Math.max(1, reviews.filter(r => r.cleanliness > 0).length)).toFixed(1) : '-';
  const distribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => Math.round(r.rating / 2) === star).length;
    return { star, count, pct: reviews.length > 0 ? (count / reviews.length) * 100 : 0 };
  });

  return (
    <div className="animate-in" style={{ display: 'grid', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Reseñas y Calificaciones</h2>
        <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Reseñas verificadas de huéspedes que se hospedaron en tus suites.</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Promedio General</p>
          <h3 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' }}>{avgRating}</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', color: '#FFD700', marginTop: '0.5rem' }}>
            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill={i <= Math.round(+avgRating / 2) ? '#FFD700' : 'none'} stroke={i <= Math.round(+avgRating / 2) ? '#FFD700' : '#CBD5E1'} />)}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.5rem', fontWeight: 600 }}>{reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</p>
        </div>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Distribución</p>
          {distribution.map(d => (
            <div key={d.star} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, width: '1rem' }}>{d.star}</span>
              <Star size={12} fill="#FFD700" stroke="#FFD700" />
              <div style={{ flex: 1, height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${d.pct}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px', transition: 'width 0.5s' }} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)', width: '2rem', textAlign: 'right' }}>{d.count}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Categorías</p>
          {[
            { label: 'Limpieza', key: 'cleanliness' },
            { label: 'Ubicación', key: 'location' },
            { label: 'Relación Calidad-Precio', key: 'value' },
            { label: 'Confort', key: 'comfort' },
            { label: 'Personal', key: 'staff' },
          ].map(cat => {
            const vals = reviews.filter(r => (r as any)[cat.key] > 0).map(r => (r as any)[cat.key]);
            const avg = vals.length > 0 ? (vals.reduce((a: number, b: number) => a + b, 0) / vals.length).toFixed(1) : '-';
            return (
              <div key={cat.key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600 }}>{cat.label}</span>
                <span style={{ fontWeight: 900, color: 'var(--primary)' }}>{avg}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', fontWeight: 700, color: 'var(--secondary)' }}>Cargando reseñas...</div>
        ) : reviews.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
            <MessageSquare size={48} style={{ color: '#CBD5E1', marginBottom: '1rem' }} />
            <h3 style={{ fontWeight: 800 }}>Sin reseñas todavía</h3>
            <p style={{ color: 'var(--secondary)' }}>Las reseñas aparecerán aquí cuando los huéspedes las dejen después de su estadía.</p>
          </div>
        ) : reviews.map((review) => (
          <div key={review.id} style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'var(--dominant)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={28} style={{ color: 'var(--primary)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 900, fontSize: '1.05rem' }}>{review.user.firstName} {review.user.lastName}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800 }}>{review.home?.title || 'Suite'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.15rem', color: '#FFD700', marginBottom: '0.25rem' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} fill={i < Math.round(review.rating / 2) ? '#FFD700' : 'none'} stroke={i < Math.round(review.rating / 2) ? '#FFD700' : '#CBD5E1'} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)' }}>{review.rating}/10</span>
                  </div>
                </div>
                {review.title && <p style={{ fontWeight: 800, marginBottom: '0.5rem' }}>{review.title}</p>}
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <Quote size={18} style={{ position: 'absolute', top: '-8px', left: '-4px', opacity: 0.08, color: 'var(--primary)' }} />
                  <p style={{ fontSize: '0.95rem', color: 'var(--secondary)', lineHeight: 1.7, fontStyle: 'italic' }}>"{review.content}"</p>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                  {new Date(review.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                {/* Owner Response */}
                {review.ownerResponse && (
                  <div style={{ marginTop: '1rem', padding: '1.25rem', background: '#F0FDF9', borderRadius: '16px', borderLeft: '3px solid var(--primary)' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>RESPUESTA DEL HOTEL</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--foreground)', lineHeight: 1.6 }}>{review.ownerResponse}</p>
                  </div>
                )}

                {/* Respond Action */}
                {!review.ownerResponse && (
                  <>
                    {respondingTo === review.id ? (
                      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <input type="text" value={responseText} onChange={e => setResponseText(e.target.value)} placeholder="Escribe tu respuesta..."
                          style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.9rem', fontWeight: 600, outline: 'none' }} />
                        <button onClick={() => handleRespond(review.id)} disabled={submitting}
                          style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Send size={16} /> {submitting ? '...' : 'Enviar'}
                        </button>
                        <button onClick={() => { setRespondingTo(null); setResponseText(''); }}
                          style={{ padding: '0.75rem', borderRadius: '12px', background: '#F1F5F9', border: 'none', fontWeight: 700, cursor: 'pointer' }}>✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setRespondingTo(review.id)}
                        style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '10px', background: 'var(--dominant)', color: 'var(--primary)', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MessageSquare size={14} /> Responder
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

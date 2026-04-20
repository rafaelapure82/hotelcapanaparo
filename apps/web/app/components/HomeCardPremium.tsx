'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface HomeCardPremiumProps {
  id: number;
  title: string;
  price: number;
  location: string;
  rating?: number;
  image?: string;
  isFeatured?: boolean;
  viewCount?: number;
  onView?: () => void;
  amenities?: string;
  description?: string;
  country?: string;
}

export default function HomeCardPremium({ id, title, price, location, rating = 9.2, image, isFeatured, viewCount = 0, onView, amenities, description, country }: HomeCardPremiumProps) {
  const { formatPrice, t } = useLanguage();


  const imageUrl = image 
    ? (image.startsWith('/public') ? `http://localhost:3000${image}` : image)
    : null;

  // Rating labels like Trivago
  const getRatingLabel = (score: number) => {
    if (score >= 9.5) return 'Excelente';
    if (score >= 9.0) return 'Excepcional';
    if (score >= 8.5) return 'Muy Bueno';
    return 'Recomendado';
  };

  return (
    <div className="premium-card animate-in" style={{
      borderRadius: '24px',
      overflow: 'hidden',
      background: 'white',
      border: '1px solid var(--border)',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)'
    }}>
      {/* Image Container with Badges */}
      <div style={{ position: 'relative', width: '100%', height: '240px', overflow: 'hidden' }}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} className="card-image" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #eee, #f9f9f9)' }} />
        )}
        
        {/* Badges */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem' }}>
          {isFeatured && (
            <span style={{ background: 'var(--accent)', color: 'white', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800, boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
              ★ {t('featured').toUpperCase()}
            </span>
          )}
          {viewCount > 10 && (
            <span style={{ background: 'white', color: 'var(--foreground)', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
              🔥 {t('popularity').toUpperCase()}
            </span>
          )}
        </div>

        {/* Price Glass Badge (Floating) */}
        <div className="glass" style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          padding: '0.5rem 1rem',
          borderRadius: '12px',
          color: 'var(--foreground)',
          fontWeight: 800,
          fontSize: '1.1rem',
          border: '1px solid rgba(255,255,255,0.4)'
        }}>
          {formatPrice(price)}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--foreground)', lineHeight: 1.2 }}>{title}</h3>
            <div style={{ textAlign: 'right' }}>
              <div style={{ background: 'var(--primary)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '8px 8px 8px 0', fontSize: '1rem', fontWeight: 900 }}>
                {rating.toFixed(1)}
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                {getRatingLabel(rating)}
              </span>
            </div>
          </div>
          <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            📍 {location}
          </p>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>{t('freeCancellation') || 'Cancelación Gratuita'}</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link 
              href={`/homes/${id}`}
              className="btn-primary" 
              style={{ padding: '0.5rem 1.25rem', borderRadius: '12px', fontSize: '0.9rem' }}
            >
              {t('viewSuite')}
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .premium-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15);
          border-color: var(--primary);
        }
        .premium-card:hover .card-image {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}

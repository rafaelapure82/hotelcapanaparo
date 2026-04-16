'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface HomeCardProps {
  id?: number;
  title: string;
  price: number;
  location: string;
  rating?: number;
  image?: string;
}

export default function HomeCard({ title, price, location, rating = 4.8, image }: HomeCardProps) {
  const { formatPrice } = useLanguage();

  const imageUrl = image 
    ? (image.startsWith('/public') ? `http://localhost:3000${image}` : image)
    : null;

  return (
    <div className="card animate-in" style={{
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      border: '1px solid var(--border)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      background: 'white'
    }}>
      <div style={{ 
        width: '100%', 
        height: '250px', 
        backgroundColor: '#f1f5f9',
        overflow: 'hidden'
      }}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'linear-gradient(45deg, #eee 25%, #f9f9f9 25%, #f9f9f9 50%, #eee 50%, #eee 75%, #f9f9f9 75%, #f9f9f9 100%)',
            backgroundSize: '20px 20px'
          }} />
        )}
      </div>
      
      <div style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{title}</h3>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>★ {rating}</span>
        </div>
        
        <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>{location}</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>
            {formatPrice(price)}
          </p>
        </div>
      </div>

      <style jsx>{`
        .card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
}

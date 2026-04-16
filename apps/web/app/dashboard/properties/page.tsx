'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

export default function PropertiesListPage() {
  const { t, formatPrice } = useLanguage();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const { data } = await api.get('/homes');
      setProperties(data);
    } catch (err) {
      console.error('Failed to fetch properties', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm(t('deleteConfirm'))) return;
    try {
      await api.delete(`/homes/${id}`);
      setProperties(properties.filter(p => p.id !== id));
    } catch (err) {
      alert('Error deleting property');
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>{t('loading')}</div>;

  return (
    <div className="animate-in" style={{ padding: '3rem', minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{t('myProperties')}</h1>
          <p style={{ color: 'var(--secondary)' }}>Manage your hotel inventory and suites.</p>
        </div>
        <Link href="/dashboard/properties/manage" className="btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px' }}>
          + {t('addSuite')}
        </Link>
      </header>

      <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.85rem' }}>{t('property')}</th>
              <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.85rem' }}>{t('city')}</th>
              <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.85rem' }}>{t('basePrice')}</th>
              <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.85rem' }}>{t('status')}</th>
              <th style={{ padding: '1rem', color: 'var(--secondary)', fontSize: '0.85rem' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '50px', 
                      height: '50px', 
                      borderRadius: '8px', 
                      background: '#e2e8f0', 
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {property.gallery && (
                        <img 
                          src={property.gallery.split(',')[0].startsWith('/public') ? `http://localhost:3000${property.gallery.split(',')[0]}` : property.gallery.split(',')[0]} 
                          alt="" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      )}
                    </div>
                    <span style={{ fontWeight: 700 }}>{property.title}</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem', color: 'var(--secondary)' }}>{property.city || 'N/A'}</td>
                <td style={{ padding: '1.25rem', fontWeight: 700 }}>{formatPrice(property.basePrice || 0)}</td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '50px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    background: property.status === 'publish' ? '#d1fae5' : '#e2e8f0',
                    color: property.status === 'publish' ? '#065f46' : '#64748b'
                  }}>
                    {t(`status_${property.status}`)}
                  </span>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/dashboard/properties/manage/${property.id}`} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(property.id)}
                      style={{ 
                        padding: '0.4rem 0.8rem', 
                        fontSize: '0.8rem', 
                        borderRadius: '8px', 
                        border: '1px solid #fecaca', 
                        color: '#ef4444',
                        background: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {properties.length === 0 && (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--secondary)' }}>
            No properties found. Start by adding your first suite!
          </div>
        )}
      </div>
    </div>
  );
}

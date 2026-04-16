'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

export default function ManagePropertyPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, formatPrice } = useLanguage();
  
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    basePrice: 0,
    city: '',
    address: '',
    status: 'publish',
    amenities: [] as string[],
    gallery: ''
  });

  const amenitiesList = [
    { id: 'wifi', label: t('wifi') },
    { id: 'ac', label: t('ac') },
    { id: 'pool', label: t('pool') },
    { id: 'parking', label: t('parking') },
    { id: 'kitchen', label: t('kitchen') },
    { id: 'tv', label: t('tv') },
  ];

  useEffect(() => {
    if (id) {
      const fetchProperty = async () => {
        try {
          const { data } = await api.get(`/homes/${id}`);
          setFormData({
            ...data,
            amenities: data.amenities ? JSON.parse(data.amenities) : [],
          });
        } catch (err) {
          console.error('Failed to fetch property', err);
        } finally {
          setLoading(false);
        }
      };
      fetchProperty();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'basePrice' ? parseFloat(value) : value }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const { data } = await api.post('/uploads', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, gallery: data.url }));
    } catch (err) {
      alert('Error uploading file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const payload = {
      ...formData,
      amenities: JSON.stringify(formData.amenities),
    };

    try {
      if (id) {
        await api.put(`/homes/${id}`, payload);
      } else {
        await api.post('/homes', payload);
      }
      router.push('/dashboard/properties');
    } catch (err) {
      alert('Error saving property');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>{t('loading')}</div>;

  return (
    <div className="animate-in" style={{ padding: '3rem', maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{id ? t('editSuite') : t('addSuite')}</h1>
        <p style={{ color: 'var(--secondary)' }}>Fill in the details to list your luxury suite.</p>
      </header>

      <form onSubmit={handleSubmit} className="glass" style={{ padding: '3rem', borderRadius: '32px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gap: '2rem' }}>
          
          {/* Main Info */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{t('title')}</label>
            <input 
              required
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="glass"
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{t('description')}</label>
            <textarea 
              required
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="glass"
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{t('basePrice')}</label>
              <input 
                required
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleInputChange}
                className="glass"
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 700 }}>
                {formatPrice(formData.basePrice || 0)}
              </p>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{t('city')}</label>
              <input 
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="glass"
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{t('address')}</label>
            <input 
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="glass"
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Suite Photos</label>
            <div style={{ 
              border: '2px dashed var(--border)', 
              borderRadius: '16px', 
              padding: '2rem', 
              textAlign: 'center',
              background: 'rgba(0,0,0,0.02)'
            }}>
              {formData.gallery ? (
                <div style={{ position: 'relative', width: '200px', height: '150px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={formData.gallery.startsWith('/public') ? `http://localhost:3000${formData.gallery}` : formData.gallery} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => setFormData(p => ({ ...p, gallery: '' }))} style={{ position: 'absolute', top: '5px', right: '5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer' }}>×</button>
                </div>
              ) : (
                <>
                  <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} id="photo-upload" accept="image/*" />
                  <label htmlFor="photo-upload" style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 700 }}>Click to upload photo</label>
                </>
              )}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>{t('wifi')}, {t('ac')}, etc.</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {amenitiesList.map((amenity) => (
                <label key={amenity.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.amenities.includes(amenity.id)} 
                    onChange={() => handleAmenityToggle(amenity.id)}
                  />
                  <span style={{ fontSize: '0.9rem' }}>{amenity.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{t('otherDetails')}</label>
            <textarea 
              name="content"
              rows={2}
              value={formData.content}
              onChange={handleInputChange}
              className="glass"
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="submit" 
              disabled={saving}
              className="btn-primary" 
              style={{ flex: 1, padding: '1rem', fontSize: '1rem', borderRadius: '12px' }}
            >
              {saving ? '...' : t('saveChanges')}
            </button>
            <Link 
              href="/dashboard/properties" 
              className="btn-secondary" 
              style={{ padding: '1rem 2rem', borderRadius: '12px' }}
            >
              Cancel
            </Link>
          </div>

        </div>
      </form>
    </div>
  );
}

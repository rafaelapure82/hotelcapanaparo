'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import HomeCard from '../components/HomeCard';
import { useLanguage } from '@/context/LanguageContext';

function ExploreContent() {
  const searchParams = useSearchParams();
  const { t, exchangeRate } = useLanguage();
  
  const [homes, setHomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    minPrice: '',
    maxPrice: '',
    orderBy: 'popular',
    featured: searchParams.get('featured') || 'false'
  });

  const fetchHomes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/homes', {
        params: {
          city: filters.city,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          orderBy: filters.orderBy,
          featured: filters.featured
        }
      });
      setHomes(data);
    } catch (err) {
      console.error('Failed to fetch homes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomes();
  }, [filters]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar Filters */}
      <aside style={{ width: '320px', padding: '3rem 2rem', borderRight: '1px solid var(--border)', background: 'white' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>{t('filterBy')}</h2>
        
        <div style={{ marginBottom: '2.5rem' }}>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>{t('priceRange')}</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              type="number" 
              placeholder="Min $" 
              value={filters.minPrice}
              onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
            />
            <span>-</span>
            <input 
              type="number" 
              placeholder="Max $" 
              value={filters.maxPrice}
              onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
            />
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
            Prices in USD. Conversion to VES: {exchangeRate}
          </p>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>{t('sortBy')}</label>
          <select 
            value={filters.orderBy}
            onChange={(e) => setFilters(f => ({ ...f, orderBy: e.target.value }))}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'white' }}
          >
            <option value="popular">{t('popularity')}</option>
            <option value="price_asc">{t('priceLowHigh')}</option>
            <option value="price_desc">{t('priceHighLow')}</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
            <input 
              type="checkbox" 
              checked={filters.featured === 'true'}
              onChange={(e) => setFilters(f => ({ ...f, featured: e.target.checked ? 'true' : 'false' }))}
            />
            {t('featured')}
          </label>
        </div>

        <button 
          onClick={() => setFilters({ city: '', minPrice: '', maxPrice: '', orderBy: 'popular', featured: 'false' })}
          style={{ width: '100%', marginTop: '3rem', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}
        >
          Reset Filters
        </button>
      </aside>

      {/* Main Grid */}
      <main style={{ flex: 1, padding: '3rem' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
            {filters.featured === 'true' ? t('featured') : t('allProperties')}
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            {homes.length} {homes.length === 1 ? 'result' : 'results'} found {filters.city && `in ${filters.city}`}
          </p>
        </header>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>{t('loading')}</div>
        ) : (
          <>
            {homes.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                {homes.map((home) => (
                  <HomeCard 
                    key={home.id}
                    id={home.id}
                    title={home.title}
                    location={`${home.city}, ${home.country}`}
                    price={home.basePrice}
                    image={home.gallery?.split(',')[0]}
                  />
                ))}
              </div>
            ) : (
              <div className="glass" style={{ padding: '6rem', textAlign: 'center', borderRadius: '32px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🔍</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>{t('noResults')}</h3>
                <button 
                  onClick={() => setFilters(f => ({ ...f, featured: 'false', minPrice: '', maxPrice: '', city: '' }))}
                  className="btn-primary"
                  style={{ padding: '0.75rem 2rem' }}
                >
                  {t('viewSuite')}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExploreContent />
    </Suspense>
  );
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import HomeCardPremium from '../components/HomeCardPremium';
import SuiteDetailModal from '../components/SuiteDetailModal';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Search, MapPin, Calendar, Users, SlidersHorizontal, X, 
  Wifi, Snowflake, Car, Tv, ChefHat, Waves 
} from 'lucide-react';

const AMENITY_FILTERS = [
  { key: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { key: 'ac', label: 'A/C', icon: Snowflake },
  { key: 'parking', label: 'Parking', icon: Car },
  { key: 'tv', label: 'TV', icon: Tv },
  { key: 'kitchen', label: 'Cocina', icon: ChefHat },
  { key: 'pool', label: 'Piscina', icon: Waves },
  { key: 'jacuzzi', label: 'Jacuzzi', icon: Waves },
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const { t, exchangeRate } = useLanguage();
  
  const [homes, setHomes] = useState<any[]>([]);
  const [filteredHomes, setFilteredHomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuite, setSelectedSuite] = useState<any>(null);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    minPrice: '',
    maxPrice: '',
    orderBy: 'popular',
    featured: searchParams.get('featured') || 'false',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    guests: searchParams.get('guests') || '',
    amenities: [] as string[],
    homeType: '',
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
  }, [filters.city, filters.minPrice, filters.maxPrice, filters.orderBy, filters.featured]);

  // Client-side filtering for amenities, guests, homeType, and date-based availability
  useEffect(() => {
    let result = [...homes];

    // Filter by guests capacity
    if (filters.guests) {
      result = result.filter(h => (h.maxGuests || 1) >= +filters.guests);
    }

    // Filter by home type
    if (filters.homeType) {
      result = result.filter(h => h.homeType?.toLowerCase() === filters.homeType.toLowerCase());
    }

    // Filter by amenities
    if (filters.amenities.length > 0) {
      result = result.filter(h => {
        const homeAmenityList = Array.isArray(h.amenities) 
          ? h.amenities.map(a => a.toLowerCase())
          : (typeof h.amenities === 'string' ? h.amenities.toLowerCase().split(',') : []);
          
        return filters.amenities.every(a => 
          homeAmenityList.some(item => item.includes(a.toLowerCase()))
        );
      });
    }

    setFilteredHomes(result);
  }, [homes, filters.guests, filters.homeType, filters.amenities]);

  // Check availability for date-filtered results
  useEffect(() => {
    if (!filters.startDate || !filters.endDate || filteredHomes.length === 0) return;
    
    const checkAll = async () => {
      const checks = await Promise.all(
        filteredHomes.map(async (home) => {
          try {
            const { data } = await api.get(`/homes/${home.id}/availability`, {
              params: { start: filters.startDate, end: filters.endDate }
            });
            return { ...home, isAvailable: data };
          } catch {
            return { ...home, isAvailable: true };
          }
        })
      );
      setFilteredHomes(checks);
    };
    checkAll();
  }, [filters.startDate, filters.endDate, homes]);

  const toggleAmenity = (key: string) => {
    setFilters(f => ({
      ...f,
      amenities: f.amenities.includes(key) ? f.amenities.filter(a => a !== key) : [...f.amenities, key]
    }));
  };

  const clearFilters = () => {
    setFilters({ city: '', minPrice: '', maxPrice: '', orderBy: 'popular', featured: 'false', startDate: '', endDate: '', guests: '', amenities: [], homeType: '' });
  };

  const activeFiltersCount = [filters.city, filters.minPrice, filters.maxPrice, filters.startDate, filters.endDate, filters.guests, filters.homeType, ...(filters.amenities.length > 0 ? ['x'] : [])].filter(Boolean).length;

  // Get unique home types for filter
  const homeTypes = [...new Set(homes.map(h => h.homeType).filter(Boolean))];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* ========== SIDEBAR FILTERS ========== */}
      <aside style={{ width: '340px', padding: '2rem', borderRight: '1px solid #E2E8F0', background: 'white', overflowY: 'auto', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={20} /> Filtros
            {activeFiltersCount > 0 && (
              <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>{activeFiltersCount}</span>
            )}
          </h2>
          {activeFiltersCount > 0 && (
            <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Limpiar</button>
          )}
        </div>

        {/* Dates */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--foreground)' }}>
            <Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} /> Fechas
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="date" placeholder="Check-in" value={filters.startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
              style={{ width: '100%', padding: '0.7rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 600, outline: 'none' }} />
            <input type="date" placeholder="Check-out" value={filters.endDate}
              min={filters.startDate || new Date().toISOString().split('T')[0]}
              onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
              style={{ width: '100%', padding: '0.7rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 600, outline: 'none' }} />
          </div>
        </div>

        {/* Guests */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.75rem', fontSize: '0.85rem' }}>
            <Users size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} /> Huéspedes
          </label>
          <select value={filters.guests} onChange={e => setFilters(f => ({ ...f, guests: e.target.value }))}
            style={{ width: '100%', padding: '0.7rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 600, outline: 'none' }}>
            <option value="">Cualquier cantidad</option>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>{n}+ huéspedes</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.75rem', fontSize: '0.85rem' }}>{t('priceRange')} (USD)</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="number" placeholder="Min" value={filters.minPrice}
              onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
              style={{ width: '100%', padding: '0.7rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.85rem', fontWeight: 600, outline: 'none' }} />
            <span style={{ color: 'var(--secondary)' }}>—</span>
            <input type="number" placeholder="Max" value={filters.maxPrice}
              onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
              style={{ width: '100%', padding: '0.7rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.85rem', fontWeight: 600, outline: 'none' }} />
          </div>
        </div>

        {/* Sort */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.75rem', fontSize: '0.85rem' }}>{t('sortBy')}</label>
          <select value={filters.orderBy} onChange={e => setFilters(f => ({ ...f, orderBy: e.target.value }))}
            style={{ width: '100%', padding: '0.7rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 600, outline: 'none' }}>
            <option value="popular">{t('popularity')}</option>
            <option value="price_asc">{t('priceLowHigh')}</option>
            <option value="price_desc">{t('priceHighLow')}</option>
          </select>
        </div>

        {/* Home Type */}
        {homeTypes.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.75rem', fontSize: '0.85rem' }}>Tipo</label>
            <select value={filters.homeType} onChange={e => setFilters(f => ({ ...f, homeType: e.target.value }))}
              style={{ width: '100%', padding: '0.7rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 600, outline: 'none' }}>
              <option value="">Todos los tipos</option>
              {homeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        )}

        {/* Amenities */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.75rem', fontSize: '0.85rem' }}>Comodidades</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {AMENITY_FILTERS.map(amenity => {
              const isActive = filters.amenities.includes(amenity.key);
              return (
                <button key={amenity.key} onClick={() => toggleAmenity(amenity.key)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    background: isActive ? 'var(--primary)' : '#F1F5F9',
                    color: isActive ? 'white' : 'var(--foreground)',
                    border: isActive ? '1px solid var(--primary)' : '1px solid #E2E8F0'
                  }}>
                  <amenity.icon size={14} />
                  {amenity.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
          <input type="checkbox" checked={filters.featured === 'true'} onChange={e => setFilters(f => ({ ...f, featured: e.target.checked ? 'true' : 'false' }))} />
          Solo Destacados
        </label>
      </aside>

      {/* ========== MAIN GRID ========== */}
      <main style={{ flex: 1, padding: '2rem 3rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem' }}>
            {filters.featured === 'true' ? t('featured') : t('allProperties')}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
            <span>{filteredHomes.length} resultado{filteredHomes.length !== 1 ? 's' : ''}</span>
            {filters.city && <span>en <strong>{filters.city}</strong></span>}
            {filters.startDate && filters.endDate && (
              <span style={{ background: '#F1F5F9', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                📅 {new Date(filters.startDate + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} → {new Date(filters.endDate + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </header>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: '380px', borderRadius: '24px', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : filteredHomes.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {filteredHomes.map((home) => (
              <div key={home.id} style={{ position: 'relative' }}>
                {/* Availability badge when date-filtering */}
                {filters.startDate && filters.endDate && home.isAvailable !== undefined && (
                  <div style={{ 
                    position: 'absolute', top: '1rem', right: '1rem', zIndex: 5, padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900,
                    background: home.isAvailable ? '#DCFCE7' : '#FEE2E2',
                    color: home.isAvailable ? '#166534' : '#991B1B'
                  }}>
                    {home.isAvailable ? '✓ Disponible' : '✕ No disponible'}
                  </div>
                )}
                <HomeCardPremium 
                  key={home.id}
                  id={home.id}
                  title={home.title} 
                  location={`${home.city}, ${home.country}`} 
                  price={home.basePrice} 
                  image={(() => {
                    if (!home.gallery) return null;
                    try {
                      const parsed = JSON.parse(home.gallery);
                      const first = Array.isArray(parsed) ? parsed[0] : parsed;
                      if (!first) return null;
                      if (first.startsWith('http')) return first;
                      const path = first.startsWith('/') ? first : `/${first}`;
                      return `http://localhost:3000${path}`;
                    } catch {
                      const first = home.gallery.split(',')[0]?.trim();
                      if (!first) return null;
                      if (first.startsWith('http')) return first;
                      const path = first.startsWith('/') ? first : `/${first}`;
                      return `http://localhost:3000${path}`;
                    }
                  })()}
                  isFeatured={home.isFeatured}
                  viewCount={home.viewCount}
                  amenities={home.amenities}
                  description={home.description}
                  country={home.country}
                  onView={() => setSelectedSuite(home)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '6rem 2rem', textAlign: 'center', background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.75rem' }}>No se encontraron resultados</h3>
            <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>Intenta ajustar tus filtros o limpiar la búsqueda.</p>
            <button onClick={clearFilters} className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
              Limpiar Filtros
            </button>
          </div>
        )}
      </main>

      {selectedSuite && <SuiteDetailModal suite={selectedSuite} onClose={() => setSelectedSuite(null)} />}

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><p style={{ fontWeight: 800, color: 'var(--secondary)' }}>Cargando suites...</p></div>}>
      <ExploreContent />
    </Suspense>
  );
}

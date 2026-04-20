'use client';

import React, { useState, useEffect } from 'react';
import Hero from "./components/Hero";
import HomeCardPremium from "./components/HomeCardPremium";

import SuiteDetailModal from "./components/SuiteDetailModal";
import api from '@/lib/api';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  const [featuredHomes, setFeaturedHomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuite, setSelectedSuite] = useState<any>(null);


  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Fetch properties sorted by viewCount (Popularity)
        const { data } = await api.get('/homes', { 
          params: { orderBy: 'popular', take: 3 } 
        });
        setFeaturedHomes(data);
      } catch (err) {
        console.error('Failed to fetch featured homes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="animate-in" style={{ background: 'white' }}>
      <Hero />
      
      {/* Featured / Most Visited Section */}
      <section style={{ 
        padding: '6rem 2rem', 
        maxWidth: '1300px', 
        margin: '0 auto' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'baseline',
          marginBottom: '3rem'
        }}>
          <div>
            <span style={{ 
              color: 'var(--primary)', 
              fontWeight: 800, 
              fontSize: '0.9rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em',
              display: 'block',
              marginBottom: '0.5rem'
            }}>
              {t('featured')} Selection
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--foreground)', letterSpacing: '-0.03em' }}>
              {t('popularity')} en Capanaparo
            </h2>
            <p style={{ color: 'var(--secondary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
              Descubre las suites más reservadas y valoradas por nuestros huéspedes globales.
            </p>
          </div>
          <Link href="/homes" style={{ 
            color: 'var(--primary)', 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            background: 'var(--dominant)',
            fontSize: '0.95rem'
          }}>
            Ver todas las suites ({featuredHomes.length}) →
          </Link>

        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ height: '400px', borderRadius: '24px', background: '#f1f5f9', animation: 'pulse 1.5s infinite' }}></div>
            ))}
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '2.5rem' 
          }}>
            {featuredHomes.map((home) => (
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
            ))}
          </div>
        )}
      </section>

      {/* Suite Detail Modal */}
      {selectedSuite && (
        <SuiteDetailModal 
          suite={selectedSuite} 
          onClose={() => setSelectedSuite(null)} 
        />
      )}


      {/* Trust / Features Section con los nuevos colores */}
      <section style={{ 
        padding: '8rem 2rem', 
        backgroundColor: 'var(--dominant)',
        borderRadius: '60px 60px 0 0',
        marginTop: '4rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '5rem', color: 'var(--foreground)' }}>¿Por qué Hotel Capanaparo?</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '4rem'
          }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: '32px', border: 'none', background: 'white' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))' }}>🛡️</div>
              <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>Seguridad Premium</h3>
              <p style={{ color: 'var(--secondary)', lineHeight: 1.6 }}>Propiedades verificadas y pagos protegidos para tu total tranquilidad.</p>
            </div>
            <div className="glass" style={{ padding: '3rem', borderRadius: '32px', border: 'none', background: 'white' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))' }}>✨</div>
              <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>Experiencias Únicas</h3>
              <p style={{ color: 'var(--secondary)', lineHeight: 1.6 }}>Más que una cama: habitaciones con historia y carácter inigualable.</p>
            </div>
            <div className="glass" style={{ padding: '3rem', borderRadius: '32px', border: 'none', background: 'white' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))' }}>🤝</div>
              <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>Atención 24/7</h3>
              <p style={{ color: 'var(--secondary)', lineHeight: 1.6 }}>Soporte dedicado para que tu estancia sea perfecta de principio a fin.</p>
            </div>
          </div>
        </div>
      </section>

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

'use client';

import React from 'react';
import Link from 'next/link';

export default function HomeDetailPage({ params }: { params: { id: string } }) {
  // Mock data for the demonstration
  const home = {
    title: "Presidential Suite Capanaparo",
    location: "Apure, Venezuela",
    price: 350,
    rating: 4.9,
    description: "Experience the ultimate in luxury and comfort in our Presidential Suite. With breathtaking views of the Capanaparo River and world-class amenities, this is the perfect destination for those seeking the exceptional.",
    features: ["Private Terrace", "24/7 Butler Service", "Gourmet Kitchen", "High-speed Wi-Fi"]
  };

  return (
    <div className="animate-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <nav style={{ marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
        <Link href="/">Home</Link> / <Link href="/homes">Explore</Link> / <span>{home.title}</span>
      </nav>

      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{home.title}</h1>
      <p style={{ marginBottom: '2rem', color: 'var(--secondary)' }}>★ {home.rating} · {home.location}</p>

      {/* Gallery Mockup */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '1rem', 
        height: '500px', 
        marginBottom: '3rem',
        borderRadius: 'var(--radius)',
        overflow: 'hidden'
      }}>
        <div style={{ backgroundColor: '#eee', backgroundImage: 'linear-gradient(45deg, #ddd, #eee)' }} />
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '1rem' }}>
          <div style={{ backgroundColor: '#f5f5f5' }} />
          <div style={{ backgroundColor: '#f0f0f0' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>Overview</h2>
          <p style={{ lineHeight: 1.8, color: 'var(--secondary)', marginBottom: '2rem' }}>
            {home.description}
          </p>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>What this place offers</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {home.features.map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>✓</span> {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Booking Sidebar */}
        <aside>
          <div className="glass" style={{ 
            padding: '2rem', 
            borderRadius: 'var(--radius)', 
            boxShadow: 'var(--shadow-lg)',
            position: 'sticky',
            top: '120px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>${home.price} <span style={{ fontWeight: 400, fontSize: '1rem', color: 'var(--secondary)' }}>/ night</span></p>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, padding: '1rem', borderRight: '1px solid var(--border)' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Check-in</label>
                  <div style={{ fontSize: '0.9rem' }}>Add date</div>
                </div>
                <div style={{ flex: 1, padding: '1rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Checkout</label>
                  <div style={{ fontSize: '0.9rem' }}>Add date</div>
                </div>
              </div>
              <div style={{ padding: '1rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Guests</label>
                <div style={{ fontSize: '0.9rem' }}>1 guest</div>
              </div>
            </div>

            <Link href={`/bookings/checkout?id=${params.id}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '1.5rem' }}>
              Book Appointment
            </Link>

            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--secondary)' }}>
              You won't be charged yet
            </p>
          </div>
        </aside>
      </div>

      <style jsx>{`
        @media (max-width: 968px) {
          div { grid-template-columns: 1fr !important; }
          aside { margin-top: 2rem; }
        }
      `}</style>
    </div>
  );
}

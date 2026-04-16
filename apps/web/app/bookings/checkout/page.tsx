'use client';

import React from 'react';
import Link from 'next/link';

export default function CheckoutPage() {
  return (
    <div className="animate-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '4rem' }}>
        <div>
          <Link href="/" style={{ color: 'var(--primary)', fontWeight: 600, display: 'block', marginBottom: '2rem' }}>← Back</Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Confirm and Pay</h1>
          
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Your trip</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontWeight: 700 }}>Dates</p>
                <p style={{ color: 'var(--secondary)' }}>Oct 24 – 29, 2026</p>
              </div>
              <button style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 700 }}>Guests</p>
                <p style={{ color: 'var(--secondary)' }}>1 guest</p>
              </div>
              <button style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
            </div>
          </section>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '3rem' }} />

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Pay with</h2>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--primary)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem' }}>💳</span>
                <span style={{ fontWeight: 600 }}>Credit or Debit Card</span>
              </div>
            </div>
            
            <button className="btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', justifyContent: 'center' }}>
              Confirm and Pay
            </button>
          </section>
        </div>

        {/* Price Detail Sidebar */}
        <aside>
          <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '100px', height: '80px', backgroundColor: '#eee', borderRadius: '8px' }} />
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Presidential Suite</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Hotel Capanaparo Suites</p>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '1.5rem' }} />

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Price details</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span>$350 x 5 nights</span>
              <span>$1,750</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span>Service fee</span>
              <span>$0</span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
              <span>Total (USD)</span>
              <span>$1,750</span>
            </div>
          </div>
        </aside>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          div { grid-template-columns: 1fr !important; }
          aside { order: -1; }
        }
      `}</style>
    </div>
  );
}

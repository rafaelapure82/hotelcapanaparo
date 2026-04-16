'use client';

import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="glass animate-in" style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 1000,
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
        Hotel Capanaparo Suites<span style={{ color: 'var(--foreground)' }}>.</span>
      </Link>
      
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link href="/homes">Explore</Link>
        <Link href="/become-a-host">Become a Host</Link>
        <button className="btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
          Sign In
        </button>
      </div>
      
      <style jsx>{`
        nav {
          border-bottom: 1px solid var(--border);
        }
        @media (max-width: 768px) {
          div { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

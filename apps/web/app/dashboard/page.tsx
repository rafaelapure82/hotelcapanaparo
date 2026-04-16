'use client';

import dynamic from 'next/dynamic';

const DashboardClient = dynamic(() => import('./DashboardClient'), { 
  ssr: false,
  loading: () => <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '60vh', 
    fontSize: '1.2rem', 
    fontWeight: 800,
    color: 'var(--primary)'
  }}>Cargando Dashboard Nivel Dios...</div>
});

export default function Page() {
  return <DashboardClient />;
}

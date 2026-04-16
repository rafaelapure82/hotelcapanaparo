'use client';

import React, { useState } from 'react';
import { Package, Plus, AlertTriangle, CheckCircle2, History } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { generateInventoryReport } from '@/lib/reports';

export default function InventoryPage() {
  const { formatPrice } = useLanguage();
  
  // Mock inventory data
  const [items, setItems] = useState([
    { id: 1, item: 'Toallas Premium (White)', qty: 45, status: 'ok', category: 'Housekeeping' },
    { id: 2, item: 'Amenities Set (Champú/Jabón)', qty: 12, status: 'low', category: 'Amenities' },
    { id: 3, item: 'Lencería King Size', qty: 20, status: 'ok', category: 'Housekeeping' },
    { id: 4, item: 'Minibar: Agua Mineral', qty: 5, status: 'out', category: 'Food & Beverage' },
  ]);

  return (
    <div className="animate-in" style={{ display: 'grid', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Gestión de Inventario</h2>
          <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Control de suministros y estado de habitaciones</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button onClick={() => generateInventoryReport([])} style={{ background: 'white', border: '1px solid #E2E8F0', padding: '0.8rem 1.5rem', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} /> Historial
           </button>
           <button className="btn-primary" style={{ background: 'var(--primary)', padding: '0.8rem 1.5rem', borderRadius: '14px', fontWeight: 800, color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Nuevo Item
           </button>
        </div>
      </div>

      {/* Inventory Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {items.map((item) => (
          <div key={item.id} style={{
            background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #E2E8F0',
            display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--dominant)' }}>
                  <Package size={24} style={{ color: 'var(--primary)' }} />
               </div>
               <span style={{
                 padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 900,
                 background: item.status === 'ok' ? '#DCFCE7' : item.status === 'low' ? '#FEF3C7' : '#FEE2E2',
                 color: item.status === 'ok' ? '#166534' : item.status === 'low' ? '#92400E' : '#991B1B',
                 textTransform: 'uppercase'
               }}>
                  {item.status}
               </span>
            </div>
            <div>
              <h4 style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{item.item}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>{item.category}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto' }}>
               <span style={{ fontSize: '2rem', fontWeight: 900 }}>{item.qty}</span>
               <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)' }}>unidades</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--dominant)', padding: '2rem', borderRadius: '30px', border: '2px dashed var(--primary)', textAlign: 'center' }}>
         <AlertTriangle size={32} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
         <h3 style={{ fontWeight: 900, marginBottom: '0.5rem' }}>Suministros Críticos</h3>
         <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Hay 2 items con stock bajo que requieren atención inmediata para no afectar el servicio.</p>
      </div>

    </div>
  );
}

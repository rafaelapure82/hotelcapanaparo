'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Settings2, 
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  Download
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/lib/api';
import { InventoryStats } from './components/InventoryComponents';
import { InventoryDetailModal, AdjustStockModal, NewItemModal } from './components/InventoryModals';
import { ConsumptionRuleModal } from './components/ConsumptionRuleModal';

export default function InventoryPage() {
  const { formatPrice } = useLanguage();
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [adjustingItem, setAdjustingItem] = useState<any>(null);
  const [rulingItem, setRulingItem] = useState<any>(null);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, statsRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/inventory/stats')
      ]);
      setItems(itemsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in" style={{ display: 'grid', gap: '2.5rem' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Gestión de Inventario <span style={{ color: 'var(--primary)', fontSize: '0.9rem', verticalAlign: 'middle', background: 'var(--dominant)', padding: '0.3rem 0.8rem', borderRadius: '12px', marginLeft: '0.5rem' }}>LEGACY PRO</span></h2>
          <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Administración centralizada de suministros y activos operativos</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              onClick={async () => {
                const { exportInventoryToExcel } = await import('@/lib/reports');
                exportInventoryToExcel(items);
              }}
              style={{ background: 'white', border: '1px solid #E2E8F0', padding: '0.8rem 1.5rem', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', height: '48px' }}
            >
              <Download size={18} /> Exportar Reporte
            </button>
            <button 
              onClick={() => setIsNewItemModalOpen(true)}
              style={{ background: 'var(--primary)', padding: '0.8rem 1.5rem', borderRadius: '16px', fontWeight: 900, color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', height: '48px', boxShadow: '0 10px 15px -3px rgba(46, 196, 182, 0.4)' }}>
              <Plus size={18} /> Nuevo Artículo
            </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <InventoryStats stats={stats} />

      {/* Main Control Bar */}
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '14px', border: '1px solid #F1F5F9',
              fontSize: '0.95rem', fontWeight: 600, outline: 'none', background: '#F8FAFC'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{ background: '#F1F5F9', border: 'none', padding: '0.8rem 1rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} /> Filtros
            </button>
            <div style={{ width: '1px', background: '#E2E8F0', margin: '0 0.5rem' }} />
            <button style={{ padding: '0.8rem', borderRadius: '12px', border: 'none', background: 'var(--dominant)', color: 'var(--primary)', cursor: 'pointer' }}><ListIcon size={18} /></button>
            <button style={{ padding: '0.8rem', borderRadius: '12px', border: 'none', background: 'transparent', color: 'var(--secondary)', cursor: 'pointer' }}><LayoutGrid size={18} /></button>
        </div>
      </div>

      {/* High Density Data Table */}
      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Imagen</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Artículo / SKU</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Categoría</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Proveedor</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Precio Costo</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Existencia</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: '4rem', textAlign: 'center', fontWeight: 700, color: 'var(--secondary)' }}>Sincronizando registros con el servidor...</td></tr>
            ) : filteredItems.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                <td style={{ padding: '1.25rem 1.5rem' }}>
                   <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F1F5F9', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.item} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <LayoutGrid size={20} color="#CBD5E1" />
                        </div>
                      )}
                   </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem' }}>{item.item}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 900, letterSpacing: '0.5px' }}>{item.sku}</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                   <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0.3rem 0.6rem', borderRadius: '8px', background: '#F1F5F9' }}>{item.category?.name || 'Suministro'}</span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)' }}>
                  {item.supplier || 'N/A'}
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                  ${item.costPrice.toFixed(2)}
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>{item.quantity}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 700 }}>{item.unit}</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{
                    padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 900,
                    background: item.status === 'ok' ? '#DCFCE7' : item.status === 'low' ? '#FEF3C7' : '#FEE2E2',
                    color: item.status === 'ok' ? '#166534' : item.status === 'low' ? '#92400E' : '#991B1B',
                    textTransform: 'uppercase'
                  }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                     <button onClick={() => setSelectedItem(item)} style={{ padding: '0.6rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', cursor: 'pointer', color: '#64748B' }} title="Ver Kardex"><Eye size={18} /></button>
                     <button onClick={() => setAdjustingItem(item)} style={{ padding: '0.6rem 1rem', background: 'var(--primary)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Settings2 size={16} /> Ajustar
                     </button>
                     <button onClick={() => setRulingItem(item)} style={{ padding: '0.6rem', background: 'var(--dominant)', border: '1px solid var(--primary-light)', borderRadius: '10px', cursor: 'pointer', color: 'var(--primary)' }} title="Reglas de Consumo">
                        <ListIcon size={18} />
                     </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedItem && (
        <InventoryDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {adjustingItem && (
        <AdjustStockModal item={adjustingItem} onClose={() => setAdjustingItem(null)} onUpdate={fetchData} />
      )}

      {isNewItemModalOpen && (
        <NewItemModal onClose={() => setIsNewItemModalOpen(false)} onCreated={fetchData} />
      )}

      {rulingItem && (
        <ConsumptionRuleModal item={rulingItem} onClose={() => setRulingItem(null)} />
      )}

    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, Settings2, Info, Package } from 'lucide-react';
import { KardexTimeline } from './InventoryComponents';
import api from '@/lib/api';

export const InventoryDetailModal = ({ item, onClose }: { item: any, onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState('history');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get(`/inventory/${item.id}/transactions`);
        setHistory(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [item.id]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1.5rem' }}>
      <div style={{ background: 'white', width: '100%', maxWidth: '600px', borderRadius: '30px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 900, background: 'var(--dominant)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>{item.sku}</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{item.item}</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>{item.category?.name || 'Sin Categoría'} • {item.unit}</p>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #F1F5F9' }}>
           <button onClick={() => setActiveTab('history')} style={{ flex: 1, padding: '1rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'history' ? '3px solid var(--primary)' : '3px solid transparent', fontWeight: 800, color: activeTab === 'history' ? 'var(--primary)' : 'var(--secondary)', cursor: 'pointer' }}>Historial (Kardex)</button>
           <button onClick={() => setActiveTab('details')} style={{ flex: 1, padding: '1rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'details' ? '3px solid var(--primary)' : '3px solid transparent', fontWeight: 800, color: activeTab === 'details' ? 'var(--primary)' : 'var(--secondary)', cursor: 'pointer' }}>Detalles Técnicos</button>
        </div>

        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'history' ? (
            loading ? <p>Cargando Kardex...</p> : <KardexTimeline transactions={history} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1.5rem', alignItems: 'center', background: '#F8FAFC', padding: '1.5rem', borderRadius: '20px', marginBottom: '1rem' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '16px', background: 'white', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                     {item.imageUrl ? (
                       <img src={item.imageUrl} alt={item.item} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     ) : (
                       <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Package size={40} color="#CBD5E1" />
                       </div>
                     )}
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Proveedor</label>
                    <p style={{ fontSize: '1.1rem', fontWeight: 900 }}>{item.supplier || 'No especificado'}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>SKU: {item.sku}</p>
                  </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Existencia Actual</label>
                <p style={{ fontSize: '1.25rem', fontWeight: 900 }}>{item.quantity} {item.unit}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Stock Mínimo</label>
                <p style={{ fontSize: '1.25rem', fontWeight: 900 }}>{item.minStock} {item.unit}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Costo Unitario</label>
                <p style={{ fontSize: '1.25rem', fontWeight: 900 }}>${(item.costPrice || 0).toFixed(2)}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Valor Total</label>
                <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>${((item.quantity || 0) * (item.costPrice || 0)).toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AdjustStockModal = ({ item, onClose, onUpdate }: { item: any, onClose: () => void, onUpdate: () => void }) => {
  const [type, setType] = useState('IN');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (quantity <= 0 || !reason) return;
    setSubmitting(true);
    try {
      await api.patch(`/inventory/${item.id}/stock`, {
          adjustment: type === 'IN' ? quantity : -quantity,
          type: type,
          reason: reason
      });
      onUpdate();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '1.5rem' }}>
      <div style={{ background: 'white', width: '100%', maxWidth: '450px', borderRadius: '30px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Ajustar Stock</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        <div style={{ display: 'flex', padding: '0.5rem', background: '#F1F5F9', borderRadius: '14px', gap: '0.5rem' }}>
          <button onClick={() => setType('IN')} style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', background: type === 'IN' ? 'white' : 'transparent', fontWeight: 800, color: type === 'IN' ? '#166534' : 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: type === 'IN' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none' }}>
            <ArrowUpCircle size={18} /> Entrada
          </button>
          <button onClick={() => setType('OUT')} style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', background: type === 'OUT' ? 'white' : 'transparent', fontWeight: 800, color: type === 'OUT' ? '#991B1B' : 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: type === 'OUT' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none' }}>
            <ArrowDownCircle size={18} /> Salida
          </button>
        </div>

        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>Cantidad a ajustar ({item.unit})</label>
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(+e.target.value)}
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '1.1rem', fontWeight: 900 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>Razón del movimiento</label>
            <select 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '1rem', fontWeight: 700, appearance: 'none', background: 'white' }}
            >
              <option value="">Seleccionar motivo...</option>
              {type === 'IN' ? (
                <>
                  <option value="Compra">Compra de mercancia</option>
                  <option value="Devolución">Devolución de cliente</option>
                  <option value="Ajuste">Ajuste de inventario</option>
                </>
              ) : (
                <>
                  <option value="Uso">Uso/Consumo interno</option>
                  <option value="Daño">Dañado/Vencido</option>
                  <option value="Pérdida">Extravío/Pérdida</option>
                  <option value="Venta">Venta a cliente</option>
                </>
              )}
            </select>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={submitting || quantity <= 0 || !reason}
          style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', marginTop: '1rem', boxShadow: '0 10px 15px -3px rgba(46, 196, 182, 0.4)' }}
        >
          {submitting ? 'Registrando...' : `Confirmar ${type === 'IN' ? 'Entrada' : 'Salida'}`}
        </button>
      </div>
    </div>
  );
};

export const NewItemModal = ({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) => {
  const [formData, setFormData] = useState({
    item: '',
    quantity: 0,
    unit: 'und',
    minStock: 5,
    costPrice: 0,
    categoryId: '',
    supplier: '',
    imageUrl: ''
  });
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get('/inventory/categories');
        setCategories(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCats();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const { data } = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, imageUrl: data.url }));
    } catch (err) {
      console.error('Error uploading file:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item) return;
    setSubmitting(true);
    try {
      await api.post('/inventory', {
        ...formData,
        categoryId: formData.categoryId ? +formData.categoryId : null
      });
      onCreated();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '1.5rem' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', width: '100%', maxWidth: '550px', borderRadius: '30px', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Nuevo Artículo</h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
             <div style={{ width: '100px', height: '100px', borderRadius: '20px', background: '#F1F5F9', border: '2px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                {formData.imageUrl ? (
                   <img src={formData.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                   <div style={{ textAlign: 'center' }}>
                      <Info size={20} style={{ color: '#94A3B8', marginBottom: '4px' }} />
                      <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8' }}>FOTO</p>
                   </div>
                )}
                <input type="file" onChange={handleFileUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} disabled={uploading} />
             </div>
             <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 700 }}>Nombre del Artículo</label>
                <input 
                  required
                  value={formData.item}
                  onChange={(e) => setFormData({...formData, item: e.target.value})}
                  placeholder="Ej. Sábanas King Size"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600 }}
                />
             </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 700 }}>Proveedor</label>
            <input 
              value={formData.supplier}
              onChange={(e) => setFormData({...formData, supplier: e.target.value})}
              placeholder="Nombre del distribuidor o fabrica"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600 }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 700 }}>Categoría</label>
              <select 
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600, background: 'white' }}
              >
                <option value="">General</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 700 }}>Unidad</label>
              <input 
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                placeholder="und, kg, caja..."
                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 700 }}>Stock Inicial</label>
              <input 
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: +e.target.value})}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 800 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 700 }}>Min. Stock</label>
              <input 
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({...formData, minStock: +e.target.value})}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 800 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 700 }}>Costo ($)</label>
              <input 
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => setFormData({...formData, costPrice: +e.target.value})}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 800 }}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={submitting || uploading}
          style={{ width: '100%', padding: '1.1rem', borderRadius: '16px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer', marginTop: '0.5rem', opacity: (submitting || uploading) ? 0.7 : 1 }}
        >
          {uploading ? 'Subiendo imagen...' : submitting ? 'Creando...' : 'Crear Artículo'}
        </button>
      </form>
    </div>
  );
};

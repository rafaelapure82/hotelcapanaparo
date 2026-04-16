'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { Home, Plus, Edit, Trash2, Eye, Save, X, MapPin } from 'lucide-react';

export default function RoomsPage() {
  const { formatPrice } = useLanguage();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    basePrice: '',
    city: 'Apure',
    status: 'publish',
    content: ''
  });

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/homes?take=100');
      setRooms(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleOpenModal = (room: any = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        title: room.title,
        basePrice: room.basePrice.toString(),
        city: room.city,
        status: room.status,
        content: room.content || ''
      });
    } else {
      setEditingRoom(null);
      setFormData({
        title: '',
        basePrice: '',
        city: 'Apure',
        status: 'publish',
        content: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice)
      };

      if (editingRoom) {
        await api.put(`/homes/${editingRoom.id}`, payload);
      } else {
        await api.post('/homes', payload);
      }
      
      setIsModalOpen(false);
      fetchRooms();
    } catch (err) {
      console.error('Error saving suite', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta suite permanentemente?')) return;
    try {
      await api.delete(`/homes/${id}`);
      fetchRooms();
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>
      <div className="loader">Cargando habitaciones...</div>
    </div>
  );

  return (
    <div className="animate-in" style={{ display: 'grid', gap: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Mis Propiedades</h2>
          <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Administra tus Suites, precios y disponibilidad en tiempo real.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          style={{ 
            background: 'var(--primary)', color: 'white', border: 'none', 
            padding: '1rem 2rem', borderRadius: '16px', fontWeight: 900, 
            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
          }}
        >
          <Plus size={20} /> Añadir Suite
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
        {rooms.map((room: any) => (
          <div key={room.id} style={{ 
            background: 'white', borderRadius: '32px', overflow: 'hidden', 
            border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease'
          }}>
            <div style={{ height: '220px', background: '#F1F5F9', position: 'relative' }}>
              <img 
                src={(() => {
                  if (!room.gallery) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800';
                  try {
                    const parsed = JSON.parse(room.gallery);
                    return Array.isArray(parsed) ? parsed[0] : room.gallery;
                  } catch (e) {
                    return room.gallery;
                  }
                })()}
                alt={room.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ 
                position: 'absolute', top: '1.25rem', right: '1.25rem', 
                background: room.status === 'publish' ? 'var(--primary)' : '#475569',
                color: 'white', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                {room.status.toUpperCase()}
              </div>
            </div>
            
            <div style={{ padding: '2rem' }}>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '0.5rem' }}>{room.title}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', marginBottom: '1.5rem', height: '40px', overflow: 'hidden', fontWeight: 600 }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {room.city}
              </p>
              
              <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{formatPrice(room.basePrice)}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 700 }}> / noche</span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                <button 
                  onClick={() => handleOpenModal(room)}
                  style={{ 
                    flex: 1, background: 'var(--dominant)', color: 'var(--primary)', 
                    border: 'none', padding: '1rem', borderRadius: '14px', 
                    fontWeight: 800, cursor: 'pointer', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', gap: '0.5rem' 
                  }}
                >
                  <Edit size={18} /> Editar
                </button>
                <button 
                  onClick={() => handleDelete(room.id)}
                  style={{ 
                    width: '50px', background: '#FFF1F2', border: 'none', 
                    borderRadius: '14px', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', cursor: 'pointer' 
                  }}
                >
                  <Trash2 size={18} style={{ color: '#EF4444' }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL SUITE */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="animate-in" style={{ 
            background: 'white', padding: '3rem', borderRadius: '40px', 
            width: '100%', maxWidth: '550px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 900 }}>
                {editingRoom ? 'Editar Suite' : 'Nueva Suite'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.8rem' }}>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>Nombre de la Suite</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', fontWeight: 700 }}
                  placeholder="Ej: Suite Presidencial Sabana"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="input-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>Precio USD</label>
                  <input 
                    type="number" 
                    value={formData.basePrice}
                    onChange={e => setFormData({...formData, basePrice: e.target.value})}
                    style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', fontWeight: 700 }}
                    placeholder="95.00"
                    step="0.01"
                    required
                  />
                </div>
                <div className="input-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>Estado</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', fontWeight: 700, appearance: 'none', background: 'white' }}
                  >
                    <option value="publish">Publicado</option>
                    <option value="draft">Borrador</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>Ciudad / Ubicación</label>
                <input 
                  type="text" 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', fontWeight: 700 }}
                />
              </div>

              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>Descripción Corta</label>
                <textarea 
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  rows={3}
                  style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', fontWeight: 700, resize: 'none' }}
                  placeholder="Detalles sobre la suite..."
                />
              </div>

              <button 
                type="submit" 
                disabled={saving}
                style={{ 
                  background: 'var(--primary)', color: 'white', border: 'none', 
                  padding: '1.2rem', borderRadius: '18px', fontWeight: 900, fontSize: '1.1rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  marginTop: '1rem', boxShadow: '0 10px 15px -3px var(--primary-light)'
                }}
              >
                <Save size={22} />
                {saving ? 'Guardando...' : 'Confirmar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

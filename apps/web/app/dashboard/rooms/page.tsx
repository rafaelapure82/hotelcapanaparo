'use client';

import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Plus, Edit, Trash2, MapPin, Save, X, 
  Wifi, Tv, Coffee, Wind, Waves, Car, 
  Bed, Users, Maximize, Calendar, Image as ImageIcon,
  Upload, CheckCircle2
} from 'lucide-react';

const AMENITY_OPTIONS = [
  { id: 'wifi', name: 'WiFi Gratis', icon: Wifi },
  { id: 'tv', name: 'Smart TV', icon: Tv },
  { id: 'ac', name: 'Aire Acondicionado', icon: Wind },
  { id: 'pool', name: 'Piscina', icon: Waves },
  { id: 'breakfast', name: 'Desayuno Incluido', icon: Coffee },
  { id: 'parking', name: 'Estacionamiento', icon: Car },
  { id: 'hot_water', name: 'Agua Caliente', icon: Waves },
  { id: 'minibar', name: 'Mini Bar', icon: Coffee },
];

export default function RoomsPage() {
  const { formatPrice } = useLanguage();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<any>({
    title: '',
    basePrice: '',
    city: 'Apure',
    status: 'publish',
    content: '',
    maxGuests: 2,
    bedType: 'King Size',
    size: 35,
    amenities: [],
    gallery: []
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
    setActiveTab('basic');
    if (room) {
      setEditingRoom(room);
      setFormData({
        title: room.title || '',
        basePrice: (room.basePrice || '').toString(),
        city: room.city || 'Apure',
        status: room.status || 'publish',
        content: room.content || '',
        maxGuests: room.maxGuests || 2,
        bedType: room.bedType || 'King Size',
        size: room.size || 35,
        amenities: Array.isArray(room.amenities) ? room.amenities : [],
        gallery: (() => {
          if (!room.gallery) return [];
          try {
            const parsed = typeof room.gallery === 'string' ? JSON.parse(room.gallery) : room.gallery;
            return Array.isArray(parsed) ? parsed : [];
          } catch(e) { return []; }
        })()
      });
    } else {
      setEditingRoom(null);
      setFormData({
        title: '',
        basePrice: '',
        city: 'Apure',
        status: 'publish',
        content: '',
        maxGuests: 2,
        bedType: 'King Size',
        size: 35,
        amenities: [],
        gallery: []
      });
    }
    setIsModalOpen(true);
  };

  const toggleAmenity = (id: string) => {
    const current = [...formData.amenities];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    setFormData({ ...formData, amenities: current });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newGallery = [...formData.gallery];

    for (let i = 0; i < files.length; i++) {
      const fData = new FormData();
      fData.append('file', files[i]);
      try {
        const { data } = await api.post('/uploads', fData);
        newGallery.push(data.url);
      } catch (err) {
        console.error('Error uploading file', err);
      }
    }

    setFormData({ ...formData, gallery: newGallery });
    setUploading(false);
  };

  const removePhoto = (index: number) => {
    const g = [...formData.gallery];
    g.splice(index, 1);
    setFormData({ ...formData, gallery: g });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        size: parseFloat(formData.size),
        maxGuests: parseInt(formData.maxGuests),
        gallery: JSON.stringify(formData.gallery)
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
          <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Gestión integral de suites, amenidades y multimedia estilo Booking.</p>
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
          <Plus size={20} /> Nueva Propiedad
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
        {rooms.map((room: any) => (
          <div key={room.id} style={{ 
            background: 'white', borderRadius: '32px', overflow: 'hidden', 
            border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease', position: 'relative'
          }}>
            <div style={{ height: '240px', background: '#F1F5F9' }}>
               <img 
                src={(() => {
                  try {
                    const g = typeof room.gallery === 'string' ? JSON.parse(room.gallery) : room.gallery;
                    const first = (Array.isArray(g) && g.length > 0) ? g[0] : null;
                    if (!first) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800';
                    if (first.startsWith('http')) return first;
                    const path = first.startsWith('/') ? first : `/${first}`;
                    return `http://localhost:3000${path}`;
                  } catch(e) { return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800'; }
                })()}
                alt={room.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 900 }}>{room.title}</h4>
                <div style={{ color: 'var(--primary)', fontWeight: 800 }}>{formatPrice(room.basePrice)}</div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--secondary)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14}/> {room.maxGuests} pers.</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Bed size={14}/> {room.bedType}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Maximize size={14}/> {room.size}m²</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                {Array.isArray(room.amenities) && room.amenities.slice(0, 4).map((a: string) => {
                  const opt = AMENITY_OPTIONS.find(o => o.id === a);
                  if (!opt) return null;
                  const Icon = opt.icon;
                  return <div key={a} title={opt.name} style={{ background: 'var(--dominant)', padding: '6px', borderRadius: '8px', color: 'var(--primary)' }}><Icon size={14}/></div>
                })}
                {Array.isArray(room.amenities) && room.amenities.length > 4 && (
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', alignSelf: 'center' }}>+{room.amenities.length - 4}</div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleOpenModal(room)} className="btn-secondary" style={{ flex: 1, padding: '0.75rem' }}>Editar</button>
                <button onClick={() => handleDelete(room.id)} className="btn-danger" style={{ padding: '0.75rem' }}><Trash2 size={18}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL PREMIUM */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div className="animate-in" style={{ 
            background: 'white', borderRadius: '40px', overflow: 'hidden',
            width: '100%', maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            {/* Header Modal */}
            <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{editingRoom ? 'Actualizar Propiedad' : 'Nueva Propiedad'}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>Completa todos los detalles para publicar en los canales.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '12px' }}>
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', padding: '0 2.5rem', background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
              {[
                { id: 'basic', label: 'Básico', icon: Edit },
                { id: 'details', label: 'Detalles', icon: Bed },
                { id: 'amenities', label: 'Amenidades', icon: CheckCircle2 },
                { id: 'photos', label: 'Multimedia', icon: ImageIcon },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ 
                    padding: '1.25rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px',
                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--secondary)',
                    borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <tab.icon size={18} /> {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ padding: '2.5rem', flex: 1, overflowY: 'auto' }}>
              <form onSubmit={handleSubmit} id="suite-form" style={{ display: 'grid', gap: '2rem' }}>
                
                {activeTab === 'basic' && (
                  <div className="animate-in" style={{ display: 'grid', gap: '1.5rem' }}>
                    <div className="input-group">
                      <label className="label">Título de la Suite / Habitación</label>
                      <input 
                        type="text" className="input" value={formData.title} required
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        placeholder="Ej: Master Suite con Vista al Río"
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div className="input-group">
                        <label className="label">Precio Base (USD)</label>
                        <input 
                          type="number" className="input" value={formData.basePrice} required
                          onChange={e => setFormData({...formData, basePrice: e.target.value})}
                        />
                      </div>
                      <div className="input-group">
                        <label className="label">Ubicación</label>
                        <input 
                          type="text" className="input" value={formData.city}
                          onChange={e => setFormData({...formData, city: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="label">Descripción Detallada</label>
                      <textarea 
                        className="input" value={formData.content} rows={4}
                        onChange={e => setFormData({...formData, content: e.target.value})}
                        style={{ resize: 'none' }}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="input-group">
                      <label className="label">Huéspedes Máximos</label>
                      <input 
                        type="number" className="input" value={formData.maxGuests}
                        onChange={e => setFormData({...formData, maxGuests: e.target.value})}
                      />
                    </div>
                    <div className="input-group">
                      <label className="label">Tipo de Cama</label>
                      <select 
                        className="input" value={formData.bedType}
                        onChange={e => setFormData({...formData, bedType: e.target.value})}
                      >
                        <option value="King Size">King Size</option>
                        <option value="Queen Size">Queen Size</option>
                        <option value="2 Twin Beds">2 Camas Twin</option>
                        <option value="Sofa Cama">Sofá Cama</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="label">Tamaño (m²)</label>
                      <input 
                        type="number" className="input" value={formData.size}
                        onChange={e => setFormData({...formData, size: e.target.value})}
                      />
                    </div>
                    <div className="input-group">
                      <label className="label">Estado de Publicación</label>
                      <select 
                        className="input" value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="publish">Publicado</option>
                        <option value="draft">Borrador</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'amenities' && (
                  <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {AMENITY_OPTIONS.map(opt => {
                       const Icon = opt.icon;
                       const isSelected = formData.amenities.includes(opt.id);
                       return (
                         <div 
                           key={opt.id}
                           onClick={() => toggleAmenity(opt.id)}
                           style={{ 
                             padding: '1rem', borderRadius: '16px', border: isSelected ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                             background: isSelected ? 'var(--dominant)' : 'white', cursor: 'pointer',
                             display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s',
                             color: isSelected ? 'var(--primary)' : 'var(--secondary)'
                           }}
                         >
                           <Icon size={20} />
                           <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{opt.name}</span>
                         </div>
                       );
                    })}
                  </div>
                )}

                {activeTab === 'photos' && (
                  <div className="animate-in" style={{ display: 'grid', gap: '1.5rem' }}>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      style={{ 
                        border: '2px dashed #CBD5E1', borderRadius: '24px', padding: '3rem',
                        textAlign: 'center', cursor: 'pointer', background: '#F8FAFC',
                        transition: 'border 0.2s'
                      }}
                    >
                      <input type="file" ref={fileInputRef} multiple onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*" />
                      <Upload size={40} style={{ color: 'var(--secondary)', marginBottom: '1rem' }} />
                      <p style={{ fontWeight: 800, marginBottom: '0.25rem' }}>{uploading ? 'Subiendo archivos...' : 'Click para subir fotos'}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>Formatos JPG, PNG. Mínimo 1024px recomendados.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                      {formData.gallery.map((url: string, idx: number) => (
                        <div key={idx} style={{ position: 'relative', height: '100px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                          <img 
                            src={url.startsWith('http') ? url : `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                          <button 
                            type="button" onClick={() => removePhoto(idx)}
                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '6px', padding: '2px', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} style={{ color: '#EF4444' }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer Modal */}
            <div style={{ padding: '2rem 2.5rem', background: '#F8FAFC', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button 
                type="submit" form="suite-form" disabled={saving} 
                className="btn-primary" style={{ padding: '0.75rem 2.5rem' }}
              >
                {saving ? 'Guardando...' : 'Publicar Suite'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STYLES INLINE TO ENSURE UI IS PREMIUM */}
      <style jsx>{`
        .input {
          width: 100%;
          padding: 1rem;
          border-radius: 14px;
          border: 1px solid #E2E8F0;
          font-weight: 700;
          font-size: 0.95rem;
          transition: border 0.2s;
        }
        .input:focus {
          border-color: var(--primary);
          outline: none;
        }
        .label {
          display: block;
          margin-bottom: 0.6rem;
          font-size: 0.85rem;
          font-weight: 900;
          color: #475569;
        }
        .btn-primary {
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 16px;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary {
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          font-weight: 800;
          cursor: pointer;
          color: var(--secondary);
        }
        .btn-danger {
          background: #FFF1F2;
          border: none;
          border-radius: 14px;
          cursor: pointer;
        }
        .animate-in {
          animation: slideUp 0.4s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

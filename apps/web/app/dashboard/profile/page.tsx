'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/lib/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Camera, 
  Save, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    location: user?.location || '',
    description: user?.description || '',
    avatar: user?.avatarUrl || ''
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uplaoding, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const { data } = await api.post('/uploads', uploadData);
      setFormData({ ...formData, avatar: data.url });
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch('/users/profile', formData);
      updateUser(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in" style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gap: '2.5rem' }}>
      
      {/* Header / Avatar */}
      <div style={{ 
        background: 'white', padding: '3rem', borderRadius: '32px', 
        border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '3rem',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', background: 'var(--primary)' 
        }} />
        
        <div style={{ position: 'relative' }}>
          <div style={{ 
            width: '140px', height: '140px', borderRadius: '40px', background: 'var(--dominant)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            border: '4px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}>
            {formData.avatar ? (
              <img src={formData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={60} style={{ color: 'var(--primary)' }} />
            )}
          </div>
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: 'absolute', bottom: '-10px', right: '-10px', 
              background: 'white', border: '1px solid #E2E8F0', padding: '0.6rem',
              borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}
          >
            <Camera size={18} style={{ color: 'var(--primary)' }} />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900 }}>{formData.firstName} {formData.lastName}</h2>
            <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>{user?.roles[0].toUpperCase()} • {formData.location || 'Sin ubicación'}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 700 }}>
              <Mail size={16} /> {formData.email}
            </div>
            {formData.mobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 700 }}>
                <Phone size={16} /> {formData.mobile}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        <div style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1.5rem' }}>Información Personal</h3>
        </div>

        <div className="input-group">
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>Nombre</label>
          <input 
            type="text" 
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 700 }}
            required
          />
        </div>

        <div className="input-group">
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>Apellido</label>
          <input 
            type="text" 
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 700 }}
            required
          />
        </div>

        <div className="input-group">
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>Email de Negocio</label>
          <input 
            type="email" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 700 }}
            required
          />
        </div>

        <div className="input-group">
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>Teléfono / WhatsApp</label>
          <input 
            type="text" 
            value={formData.mobile}
            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
            style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 700 }}
            placeholder="+58 412..."
          />
        </div>

        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>Ubicación</label>
          <input 
            type="text" 
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 700 }}
            placeholder="San Fernando de Apure, Venezuela"
          />
        </div>

        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>Biografía / Perfil Profesional</label>
          <textarea 
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 700, resize: 'none' }}
            placeholder="Cuéntanos sobre tu experiencia gestionando propiedades..."
          />
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 800, fontSize: '0.9rem' }}>
              <CheckCircle2 size={18} /> Perfil actualizado
            </div>
          )}
          <button 
            type="submit" 
            disabled={saving || uplaoding}
            style={{ 
              background: 'var(--primary)', color: 'white', border: 'none', 
              padding: '1rem 2.5rem', borderRadius: '14px', fontWeight: 900, 
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              opacity: saving ? 0.7 : 1
            }}
          >
            <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

      </form>
    </div>
  );
}

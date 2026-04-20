'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCcw,
  MapPin,
  Calendar,
  ClipboardList,
  Camera,
  X,
  Send
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function HousekeepingPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [finalizingTask, setFinalizingTask] = useState<any>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const endpoint = (user?.roles || []).includes('admin') ? '/housekeeping/tasks' : '/housekeeping/my-tasks';
      const res = await api.get(endpoint);
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching housekeeping tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId: number, newStatus: string, notes?: string) => {
    try {
      await api.patch(`/housekeeping/tasks/${taskId}/status`, { 
        status: newStatus,
        notes: notes 
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <div className="animate-in" style={{ display: 'grid', gap: '2rem', padding: '1rem' }}>
      <header>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-1px' }}>
          Gestión Operativa <span style={{ color: 'var(--primary)' }}>Housekeeping</span>
        </h2>
        <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Trazabilidad de mantenimiento y limpieza en tiempo real</p>
      </header>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(100%, 1fr))' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
             <RefreshCcw className="animate-spin" size={40} style={{ color: 'var(--primary)', margin: '0 auto' }} />
             <p style={{ marginTop: '1rem', fontWeight: 700 }}>Sincronizando con central...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ background: 'white', padding: '4rem 2rem', borderRadius: '32px', textAlign: 'center', border: '2px dashed #E2E8F0' }}>
            <ClipboardList size={64} style={{ color: '#CBD5E1', marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Todo al día</h3>
            <p style={{ color: 'var(--secondary)', fontSize: '1.1rem' }}>No tienes tareas de limpieza asignadas para hoy.</p>
          </div>
        ) : tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onStart={() => updateStatus(task.id, 'cleaning')}
            onFinalize={() => setFinalizingTask(task)} 
          />
        ))}
      </div>

      {finalizingTask && (
        <FinalizeTaskModal 
          task={finalizingTask} 
          onClose={() => setFinalizingTask(null)}
          onConfirm={(notes) => {
             updateStatus(finalizingTask.id, 'ready', notes);
             setFinalizingTask(null);
          }}
        />
      )}
    </div>
  );
}

function TaskCard({ task, onStart, onFinalize }: any) {
    const statusConfig: any = {
        ready: { icon: <CheckCircle2 size={22} />, color: '#22C55E', bg: '#DCFCE7', text: 'LISTO' },
        cleaning: { icon: <RefreshCcw size={22} className="animate-spin" />, color: '#3B82F6', bg: '#DBEAFE', text: 'LIMPIANDO' },
        dirty: { icon: <AlertCircle size={22} />, color: '#EF4444', bg: '#FEE2E2', text: 'SUCIO' }
    };

    const config = statusConfig[task.status] || statusConfig.dirty;

    return (
        <div style={{ 
            background: 'white', 
            borderRadius: '28px', 
            padding: '1.5rem', 
            border: `1px solid ${config.bg}`,
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: config.color }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: config.color, background: config.bg, padding: '0.3rem 0.8rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                        {config.icon} {config.text}
                    </span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1E293B', lineHeight: 1.2 }}>{task.home.title}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8' }}>#{task.id}</span>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748B', fontSize: '0.95rem', fontWeight: 600 }}>
                    <MapPin size={18} /> <span>{task.home.city}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748B', fontSize: '0.95rem', fontWeight: 600 }}>
                    <Calendar size={18} /> <span>Asignada: {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            {task.notes && task.status !== 'ready' && (
                <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '16px', fontSize: '0.9rem', color: '#64748B', fontStyle: 'italic', borderLeft: '3px solid #CBD5E1' }}>
                    "{task.notes}"
                </div>
            )}

            <div style={{ marginTop: '0.5rem' }}>
                 {task.status === 'dirty' && (
                    <button 
                        onClick={onStart}
                        style={{ width: '100%', padding: '1.1rem', background: '#1E293B', color: 'white', borderRadius: '18px', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <RefreshCcw size={20} /> Iniciar Limpieza
                    </button>
                 )}
                 {task.status === 'cleaning' && (
                    <button 
                        onClick={onFinalize}
                        style={{ width: '100%', padding: '1.1rem', background: '#22C55E', color: 'white', borderRadius: '18px', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.3)' }}>
                        <CheckCircle2 size={20} /> Finalizar y Entregar
                    </button>
                 )}
                 {task.status === 'ready' && (
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#F0FDF4', color: '#166534', borderRadius: '18px', fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid #BBF7D0' }}>
                        <CheckCircle2 size={20} /> Operativa para Chek-in
                    </div>
                 )}
            </div>
        </div>
    );
}

function FinalizeTaskModal({ task, onClose, onConfirm }: any) {
    const [notes, setNotes] = useState('');
    const [photo, setPhoto] = useState<any>(null);
    const [uploading, setUploading] = useState(false);

    const handlePhoto = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const { data } = await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPhoto(data.url);
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div className="animate-in-up" style={{ 
                background: 'white', 
                width: '100%', 
                maxWidth: '500px', 
                borderRadius: '32px 32px 0 0', 
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                boxShadow: '0 -20px 25px -5px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Entrega de Habitación</h2>
                    <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ position: 'relative', height: '180px', background: '#F8FAFC', borderRadius: '24px', border: '2px dashed #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {photo ? (
                            <img src={photo} alt="Work Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                                <Camera size={40} style={{ marginBottom: '0.5rem' }} />
                                <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>TOMAR FOTO DE EVIDENCIA</p>
                            </div>
                        )}
                        <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            onChange={handlePhoto}
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                        />
                        {uploading && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <RefreshCcw className="animate-spin" />
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.5rem' }}>Notas de mantenimiento</label>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej: Todo limpio, se repuso café y amenities..."
                            style={{ width: '100%', padding: '1rem', borderRadius: '18px', border: '1px solid #E2E8F0', fontSize: '1rem', minHeight: '100px', outline: 'none' }}
                        />
                    </div>
                </div>

                <button 
                    disabled={!photo || !notes || uploading}
                    onClick={() => onConfirm(`[EVIDENCIA FOTO: ${photo}] ${notes}`)}
                    style={{ 
                        width: '100%', 
                        padding: '1.25rem', 
                        background: (photo && notes) ? 'var(--primary)' : '#CBD5E1', 
                        color: 'white', 
                        borderRadius: '20px', 
                        border: 'none', 
                        fontWeight: 900, 
                        fontSize: '1.1rem', 
                        cursor: (photo && notes) ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.3s ease'
                    }}>
                    <Send size={20} /> Enviar a Central
                </button>
            </div>
        </div>
    );
}

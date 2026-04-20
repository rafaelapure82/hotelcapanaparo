'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  History, 
  User as UserIcon, 
  Database,
  Search,
  Eye
} from 'lucide-react';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function AuditPage() {
  const { user } = useAuth();
  const { formatDate } = useLanguage();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit');
      setLogs(res.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('DELETE')) return '#EF4444';
    if (action.includes('CREATE')) return '#22C55E';
    if (action.includes('UPDATE')) return '#3B82F6';
    return 'var(--primary)';
  };

  if (user && !(user.roles || []).includes('admin')) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '32px' }}>
          <ShieldAlert size={64} style={{ color: '#EF4444', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Acceso Restringido</h2>
          <p style={{ color: 'var(--secondary)' }}>Solo los administradores pueden visualizar la bitácora de auditoría legal.</p>
      </div>
    );
  }

  return (
    <div className="animate-in" style={{ display: 'grid', gap: '2rem' }}>
      <header>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>
          Auditoría de Actividad <span style={{ color: 'var(--primary)', fontSize: '0.9rem', verticalAlign: 'middle', background: 'var(--dominant)', padding: '0.3rem 0.8rem', borderRadius: '12px', marginLeft: '0.5rem' }}>LEGAL & SECURITY</span>
        </h2>
        <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Trazabilidad completa de cambios administrativos y operativos.</p>
      </header>

      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Fecha y Hora</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Usuario</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Acción</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Entidad</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', fontWeight: 700, color: 'var(--secondary)' }}>Sincronizando registros con el servidor...</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                    <History size={14} style={{ color: 'var(--secondary)' }} />
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--dominant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserIcon size={16} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 800 }}>{log.user.firstName} {log.user.lastName}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: 600 }}>{log.user.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ 
                    fontSize: '0.7rem', fontWeight: 900, padding: '0.3rem 0.6rem', borderRadius: '8px', 
                    background: getActionColor(log.action) + '15',
                    color: getActionColor(log.action),
                    border: `1px solid ${getActionColor(log.action)}30`
                  }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                    <Database size={14} style={{ color: '#94A3B8' }} />
                    {log.entity} <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>#{log.entityId}</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  <button 
                    onClick={() => setSelectedLog(log)}
                    style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedLog && (
        <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}

function AuditDetailModal({ log, onClose }: any) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', width: '700px', maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Detalle de Auditoría</h3>
        <p style={{ color: 'var(--secondary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '2rem' }}>ID Registro: #{log.id} - {log.action}</p>
        
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ background: '#F8FAFC', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Datos Previos</h4>
            <pre style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'pre-wrap' }}>{JSON.stringify(log.prevData, null, 2) || 'Sin datos previos'}</pre>
          </div>

          <div style={{ background: '#DCFCE7', borderRadius: '20px', padding: '1.5rem', border: '1px solid #BBF7D0' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '1rem' }}>Nuevos Datos</h4>
            <pre style={{ fontSize: '0.8rem', color: '#166534', whiteSpace: 'pre-wrap' }}>{JSON.stringify(log.newData, null, 2) || 'Sin cambios en datos'}</pre>
          </div>
        </div>

        <button 
          onClick={onClose}
          style={{ width: '100%', marginTop: '2rem', padding: '1rem', borderRadius: '16px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer' }}>
          Cerrar Detalle
        </button>
      </div>
    </div>
  );
}

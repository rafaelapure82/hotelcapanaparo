'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  FileText, 
  Table, 
  TrendingUp, 
  Search,
  Filter,
  Package,
  Home,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2
} from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('income');
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]); // Start of month
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/stats/reports', {
        params: { startDate, endDate, type: reportType }
      });
      setData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const handleExport = (format: string) => {
    setExporting(format);
    const url = `${api.defaults.baseURL}/stats/reports/export?startDate=${startDate}&endDate=${endDate}&type=${reportType}&format=${format}`;
    window.open(url, '_blank');
    setTimeout(() => setExporting(null), 2000);
  };

  const getTypeIcon = () => {
    switch (reportType) {
      case 'income': return <TrendingUp size={20} />;
      case 'inventory': return <Package size={20} />;
      case 'occupancy': return <Home size={20} />;
      default: return <BarChart3 size={20} />;
    }
  };

  const getTypeLabel = () => {
    switch (reportType) {
      case 'income': return 'Reporte de Ingresos';
      case 'inventory': return 'Consumo de Inventario';
      case 'occupancy': return 'Ocupación de Suites';
      default: return 'Reporte';
    }
  };

  return (
    <div className="animate-in" style={{ display: 'grid', gap: '2rem' }}>
      {/* Header & Controls */}
      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '24px', 
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BarChart3 className="text-primary" /> Módulo de Reportes
            </h2>
            <p style={{ color: '#64748B', fontWeight: 600, marginTop: '0.25rem' }}>Análisis profundo de la operación hotelera.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => handleExport('pdf')}
              disabled={data.length === 0 || !!exporting}
              style={{ 
                background: '#F1F5F9', color: '#0F172A', border: 'none', padding: '0.75rem 1.25rem', 
                borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                opacity: data.length === 0 ? 0.5 : 1
              }}
            >
              <FileText size={18} /> PDF
            </button>
            <button 
              onClick={() => handleExport('excel')}
              disabled={data.length === 0 || !!exporting}
              style={{ 
                background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', padding: '0.75rem 1.25rem', 
                borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                opacity: data.length === 0 ? 0.5 : 1
              }}
            >
              <Table size={18} /> Excel
            </button>
            <button 
              onClick={() => handleExport('csv')}
              disabled={data.length === 0 || !!exporting}
              style={{ 
                background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', 
                borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                opacity: data.length === 0 ? 0.5 : 1
              }}
            >
              <Download size={18} /> CSV
            </button>
          </div>
        </div>

        <hr style={{ margin: '1.5rem 0', border: '0', borderTop: '1px solid #F1F5F9' }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#475569' }}>Tipo de Reporte</label>
            <div style={{ position: 'relative' }}>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{ 
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', border: '1px solid #E2E8F0',
                  fontSize: '1rem', fontWeight: 600, appearance: 'none', background: 'white'
                }}
              >
                <option value="income">Financiero (Ingresos)</option>
                <option value="inventory">Operativo (Consumo Inventario)</option>
                <option value="occupancy">Ocupación (Estado de Suites)</option>
              </select>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }}>
                {getTypeIcon()}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#475569' }}>Desde</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ 
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0',
                  fontSize: '1rem', fontWeight: 600
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#475569' }}>Hasta</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ 
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0',
                  fontSize: '1rem', fontWeight: 600
                }}
              />
            </div>
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <button 
              onClick={fetchReportData}
              disabled={loading}
              style={{ 
                background: '#0F172A', color: 'white', padding: '0.75rem 2rem', borderRadius: '12px', 
                fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />} Procesar
            </button>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div style={{ 
        background: 'white', 
        borderRadius: '24px', 
        border: '1px solid #E2E8F0', 
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
      }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>{getTypeLabel()}</h3>
          <span style={{ 
            background: '#F1F5F9', padding: '0.4rem 0.8rem', borderRadius: '8px', 
            fontSize: '0.8rem', fontWeight: 700, color: '#475569' 
          }}>
            {data.length} registros encontrados
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8' }}>
              <Loader2 size={40} className="animate-spin text-primary" style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 600 }}>Cargando datos del servidor...</p>
            </div>
          ) : data.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {Object.keys(data[0]).map(key => (
                    <th key={key} style={{ padding: '1rem 2rem', fontSize: '0.85rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 15).map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }}>
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} style={{ padding: '1.25rem 2rem', fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                        {val === 'confirmed' || val === 'paid' ? (
                          <span style={{ color: '#16A34A', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={14} /> {val}
                          </span>
                        ) : val === 'pending' ? (
                          <span style={{ color: '#D97706', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={14} /> {val}
                          </span>
                        ) : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8' }}>
              <AlertCircle size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ fontWeight: 600 }}>No hay datos disponibles para el rango seleccionado.</p>
            </div>
          )}
        </div>
        
        {data.length > 15 && (
          <div style={{ padding: '1.5rem', textAlign: 'center', background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>
              Mostrando solo los primeros 15 registros. Descarga el reporte completo para ver todos los datos.
            </p>
          </div>
        )}
      </div>

      {/* Analytics Summary Tip */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0F172A, #1E293B)', 
        padding: '2rem', 
        borderRadius: '24px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem'
      }}>
        <div style={{ 
          background: 'rgba(46, 196, 182, 0.2)', 
          padding: '1rem', 
          borderRadius: '16px' 
        }}>
          <Filter size={32} className="text-primary" />
        </div>
        <div>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Consejo de Análisis</h4>
          <p style={{ opacity: 0.8, fontWeight: 500, maxWidth: '600px', lineHeight: '1.6' }}>
            Utiliza el reporte de <strong>Consumo de Inventario</strong> para predecir cuándo abastecer shampoo, jabón y lencería basándote en la tasa de ocupación actual. Esto reduce costos operativos un 12%.
          </p>
        </div>
      </div>
    </div>
  );
}

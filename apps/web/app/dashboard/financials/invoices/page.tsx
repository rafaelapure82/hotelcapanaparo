'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { FileText, Download, Search, Filter, ArrowLeft, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { generateInvoicePDF } from '@/lib/reports';

export default function InvoicesPage() {
  const { formatPrice, exchangeRate } = useLanguage();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { data } = await api.get('/invoices');
        setInvoices(data);
      } catch (err) {
        console.error('Failed to fetch invoices', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(inv => 
    inv.number.toLowerCase().includes(search.toLowerCase()) ||
    inv.booking.firstName.toLowerCase().includes(search.toLowerCase()) ||
    inv.booking.lastName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in" style={{ display: 'grid', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard/financials" style={{ 
            padding: '0.5rem', borderRadius: '10px', background: 'white', border: '1px solid #E2E8F0', color: 'var(--secondary)'
          }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Libro de Facturación</h2>
            <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Registro histórico de fiscalidad y cobros realizados.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ 
          flex: 1, minWidth: '300px', background: 'white', display: 'flex', alignItems: 'center', 
          padding: '0 1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <Search size={20} color="#94A3B8" />
          <input 
            type="text" 
            placeholder="Buscar por número o cliente..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '1.25rem', border: 'none', outline: 'none', 
              fontSize: '0.95rem', fontWeight: 600, color: 'var(--foreground)'
            }}
          />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Factura / Fecha</th>
              <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Cliente</th>
              <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Monto (Venta)</th>
              <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--secondary)', fontWeight: 600 }}>Cargando registros fiscales...</td>
              </tr>
            ) : filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--secondary)', fontWeight: 600 }}>No se encontraron facturas emitidas.</td>
              </tr>
            ) : filteredInvoices.map((inv) => (
              <tr key={inv.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }}>
                <td style={{ padding: '1.5rem 2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--dominant)' }}>
                      <FileText size={20} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, color: 'var(--foreground)' }}>#{inv.number}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>{new Date(inv.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.5rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{inv.booking.firstName} {inv.booking.lastName}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>{inv.booking.email}</p>
                </td>
                <td style={{ padding: '1.5rem' }}>
                  <p style={{ fontWeight: 900, color: '#0f172a' }}>${inv.amountUSD.toFixed(2)}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>{inv.amountVES.toLocaleString()} Bs.</p>
                </td>
                <td style={{ padding: '1.5rem' }}>
                  <span style={{ 
                    padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800,
                    background: '#DCFCE7', color: '#166534', textTransform: 'uppercase'
                  }}>
                    {inv.status}
                  </span>
                </td>
                <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                   <button 
                    onClick={() => generateInvoicePDF(inv.booking, inv.booking.home, exchangeRate, inv)}
                    style={{ 
                      padding: '0.6rem 1.25rem', borderRadius: '10px', background: 'white', 
                      border: '1px solid #E2E8F0', display: 'inline-flex', alignItems: 'center', 
                      gap: '0.5rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                   >
                     <Download size={16} /> PDF
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

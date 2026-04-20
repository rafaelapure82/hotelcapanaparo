'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { 
  MapPin, Star, Users, BedDouble, Bath, Maximize2, 
  Wifi, Snowflake, Car, Tv, ChefHat, Waves,
  ChevronLeft, ChevronRight, X, Calendar, Upload, CheckCircle,
  Quote, User, Send
} from 'lucide-react';

const AMENITY_MAP: Record<string, { icon: any; label: string }> = {
  wifi: { icon: Wifi, label: 'Wi-Fi' },
  ac: { icon: Snowflake, label: 'Aire Acondicionado' },
  'a/c': { icon: Snowflake, label: 'Aire Acondicionado' },
  parking: { icon: Car, label: 'Estacionamiento' },
  tv: { icon: Tv, label: 'TV' },
  kitchen: { icon: ChefHat, label: 'Cocina' },
  pool: { icon: Waves, label: 'Piscina' },
  jacuzzi: { icon: Waves, label: 'Jacuzzi' },
  breakfast: { icon: ChefHat, label: 'Desayuno' },
  desk: { icon: Maximize2, label: 'Escritorio' },
  workstation: { icon: Maximize2, label: 'Estación de Trabajo' },
};

export default function HomeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { formatPrice, t } = useLanguage();
  
  const [home, setHome] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [availabilityChecked, setAvailabilityChecked] = useState<boolean | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  // Booking state
  const [bookingStep, setBookingStep] = useState(0); // 0: dates, 1: payment, 2: success
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    guests: 1,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Reviews + Calendar state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [bookedRanges, setBookedRanges] = useState<any[]>([]);
  const [calMonth, setCalMonth] = useState(new Date());
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    title: '', content: '', rating: 8, cleanliness: 8, location: 8, value: 8, comfort: 8, staff: 8
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const [homeRes, reviewsRes, statsRes, calRes] = await Promise.all([
          api.get(`/homes/${id}`),
          api.get(`/reviews/home/${id}`),
          api.get(`/reviews/home/${id}/stats`),
          api.get(`/homes/${id}/calendar`),
        ]);
        setHome(homeRes.data);
        setReviews(reviewsRes.data);
        setReviewStats(statsRes.data);
        setBookedRanges(calRes.data);
      } catch (err) {
        console.error('Failed to fetch home', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchHome();
  }, [id]);

  const submitReview = async () => {
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { serviceId: +id!, ...reviewForm });
      const [r, s] = await Promise.all([
        api.get(`/reviews/home/${id}`),
        api.get(`/reviews/home/${id}/stats`),
      ]);
      setReviews(r.data);
      setReviewStats(s.data);
      setShowReviewForm(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error al enviar reseña');
    } finally {
      setSubmittingReview(false);
    }
  };

  const isDateBooked = (date: Date) => {
    return bookedRanges.some((r: any) => {
      const s = new Date(r.startDate); s.setHours(0,0,0,0);
      const e = new Date(r.endDate); e.setHours(23,59,59,999);
      const d = new Date(date); d.setHours(12,0,0,0);
      return d >= s && d <= e;
    });
  };

  const getImages = () => {
    if (!home?.gallery) return ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200']; // Premium Fallback
    
    let rawImages = [];
    try {
      rawImages = JSON.parse(home.gallery);
      if (!Array.isArray(rawImages)) rawImages = [rawImages];
    } catch {
      rawImages = home.gallery.split(',').map((img: string) => img.trim());
    }

    return rawImages.map((img: string) => {
      if (img.startsWith('http')) return img;
      const path = img.startsWith('/') ? img : `/${img}`;
      return `http://localhost:3000${path}`;
    }).filter(Boolean);
  };

  const images = home ? getImages() : [];

  const parseAmenities = () => {
    if (!home?.amenities) return [];
    if (Array.isArray(home.amenities)) return home.amenities;
    
    try {
      const parsed = typeof home.amenities === 'string' ? JSON.parse(home.amenities) : home.amenities;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return typeof home.amenities === 'string' ? home.amenities.split(',').map((a: string) => a.trim().toLowerCase()) : [];
    }
  };

  const checkAvailability = async () => {
    if (!bookingData.startDate || !bookingData.endDate) return;
    setCheckingAvailability(true);
    try {
      const { data } = await api.get(`/homes/${id}/availability`, {
        params: { start: bookingData.startDate, end: bookingData.endDate }
      });
      setAvailabilityChecked(data);
    } catch {
      setAvailabilityChecked(false);
    } finally {
      setCheckingAvailability(false);
    }
  };

  useEffect(() => {
    if (bookingData.startDate && bookingData.endDate) {
      setAvailabilityChecked(null);
      checkAvailability();
    }
  }, [bookingData.startDate, bookingData.endDate]);

  const calculateNights = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    return Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
  };

  const calculateTotal = () => (home?.basePrice || 0) * calculateNights();

  const handleBooking = async () => {
    if (!proofFile) { alert('Sube el comprobante de pago'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', proofFile);
      const uploadRes = await api.post('/uploads', formData);
      const { firstName, lastName, email, phone, startDate, endDate } = bookingData;
      await api.post('/bookings', {
        serviceId: +id!,
        startDate,
        endDate,
        numberOfGuests: bookingData.guests,
        firstName,
        lastName,
        email,
        phone,
        paymentProofUrl: uploadRes.data.url,
      });
      setBookingStep(2);
    } catch (err) {
      console.error('Booking failed', err);
      alert('Error al procesar la reserva.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <p style={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '1.1rem' }}>Cargando suite...</p>
    </div>
  );

  if (!home) return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <h2 style={{ fontWeight: 800 }}>Suite no encontrada</h2>
      <Link href="/homes" className="btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>Explorar Suites</Link>
    </div>
  );

  const amenities = parseAmenities();

  return (
    <div className="animate-in" style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem' }}>
      {/* Breadcrumbs */}
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>
        <Link href="/" style={{ color: 'var(--primary)' }}>Inicio</Link>
        {' / '}
        <Link href="/homes" style={{ color: 'var(--primary)' }}>Suites</Link>
        {' / '}
        <span>{home.title}</span>
      </nav>

      {/* Title Block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{home.title}</h1>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', color: 'var(--secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={16} /> {home.city}, {home.country}</span>
            {home.viewCount > 0 && <span>👁 {home.viewCount} visitas</span>}
            {home.homeType && <span style={{ background: 'var(--dominant)', color: 'var(--primary)', padding: '0.2rem 0.8rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem' }}>{home.homeType}</span>}
          </div>
        </div>
      </div>

      {/* ======================== GALLERY ======================== */}
      {images.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: images.length > 1 ? '2fr 1fr' : '1fr', gap: '0.5rem', height: '480px', marginBottom: '3rem', borderRadius: '24px', overflow: 'hidden', cursor: 'pointer' }}
          onClick={() => setLightboxOpen(true)}>
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <img src={images[0]} alt={home.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
              onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')} />
            <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.4rem 1rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800 }}>
              📷 {images.length} fotos
            </div>
          </div>
          {images.length > 1 && (
            <div style={{ display: 'grid', gridTemplateRows: images.length > 2 ? '1fr 1fr' : '1fr', gap: '0.5rem' }}>
              {images.slice(1, 3).map((img: string, i: number) => (
                <div key={i} style={{ overflow: 'hidden' }}>
                  <img src={img} alt={`${home.title} ${i + 2}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                    onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ height: '400px', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', borderRadius: '24px', marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', fontWeight: 700 }}>
          Sin imágenes disponibles
        </div>
      )}

      {/* ======================== MAIN CONTENT ======================== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '4rem' }}>
        
        {/* Left Column - Info */}
        <div>
          {/* Quick Facts */}
          <div style={{ display: 'flex', gap: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #E2E8F0', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {home.maxGuests && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <Users size={20} style={{ color: 'var(--primary)' }} /> {home.maxGuests} huéspedes
              </div>
            )}
            {home.numberOfBedrooms && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <BedDouble size={20} style={{ color: 'var(--primary)' }} /> {home.numberOfBedrooms} habitación(es)
              </div>
            )}
            {home.numberOfBathrooms && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <Bath size={20} style={{ color: 'var(--primary)' }} /> {home.numberOfBathrooms} baño(s)
              </div>
            )}
            {home.size && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <Maximize2 size={20} style={{ color: 'var(--primary)' }} /> {home.size} m²
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>Acerca de esta suite</h2>
            <p style={{ lineHeight: 1.8, color: 'var(--secondary)', fontSize: '1rem' }}>
              {home.description || 'Disfruta de la máxima exclusividad en esta suite única.'}
            </p>
            {home.content && (
              <p style={{ lineHeight: 1.8, color: 'var(--secondary)', fontSize: '0.95rem', marginTop: '1rem' }}>
                {home.content}
              </p>
            )}
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>Comodidades</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {amenities.map((raw: string, i: number) => {
                  const key = raw.toLowerCase().replace(/\s/g, '');
                  const mapped = Object.entries(AMENITY_MAP).find(([k]) => key.includes(k));
                  const Icon = mapped ? mapped[1].icon : CheckCircle;
                  const label = mapped ? mapped[1].label : raw;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '14px', fontWeight: 600, fontSize: '0.95rem' }}>
                      <Icon size={20} style={{ color: 'var(--primary)' }} />
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stay Policy */}
          <div style={{ marginBottom: '2.5rem', padding: '2rem', background: '#F8FAFC', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Políticas de Estancia</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
              <div><strong>Estancia mínima:</strong> {home.minStay || 1} noche(s)</div>
              <div><strong>Estancia máxima:</strong> {home.maxStay || 30} noche(s)</div>
              <div><strong>Check-in:</strong> 14:00</div>
              <div><strong>Check-out:</strong> 12:00</div>
              <div><strong>Cancelación:</strong> Gratuita hasta 48h antes</div>
              <div><strong>Pago:</strong> Transferencia / Pago Móvil</div>
            </div>
          </div>

          {/* ============ AVAILABILITY CALENDAR ============ */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>Disponibilidad</h2>
            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1))} style={{ background: '#F1F5F9', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800 }}>←</button>
                <span style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'capitalize' }}>
                  {calMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1))} style={{ background: '#F1F5F9', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800 }}>→</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                {['Lu','Ma','Mi','Ju','Vi','Sa','Do'].map(d => (
                  <div key={d} style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', padding: '0.5rem 0' }}>{d}</div>
                ))}
                {(() => {
                  const year = calMonth.getFullYear();
                  const month = calMonth.getMonth();
                  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const today = new Date(); today.setHours(0,0,0,0);
                  const cells = [];
                  for (let i = 0; i < firstDay; i++) cells.push(<div key={`e-${i}`} />);
                  for (let d = 1; d <= daysInMonth; d++) {
                    const date = new Date(year, month, d);
                    const booked = isDateBooked(date);
                    const past = date < today;
                    cells.push(
                      <div key={d} style={{
                        padding: '0.5rem 0', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700,
                        background: booked ? '#FEE2E2' : past ? '#F8FAFC' : '#DCFCE7',
                        color: booked ? '#991B1B' : past ? '#CBD5E1' : '#166534',
                        cursor: 'default'
                      }}>{d}</div>
                    );
                  }
                  return cells;
                })()}
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#DCFCE7' }} /> Disponible</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#FEE2E2' }} /> Ocupado</span>
              </div>
            </div>
          </div>

          {/* ============ REVIEWS SECTION ============ */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Reseñas de Huéspedes</h2>
              {user && (
                <button onClick={() => setShowReviewForm(!showReviewForm)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '12px', background: showReviewForm ? '#F1F5F9' : 'var(--primary)', color: showReviewForm ? 'var(--foreground)' : 'white', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem' }}>
                  {showReviewForm ? 'Cancelar' : '✍ Dejar Reseña'}
                </button>
              )}
            </div>

            {/* Review Stats */}
            {reviewStats && reviewStats.count > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem', background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{reviewStats.average}</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.15rem', margin: '0.5rem 0' }}>
                    {[1,2,3,4,5].map(i => <Star key={i} size={16} fill={i <= Math.round(reviewStats.average / 2) ? '#FFD700' : 'none'} stroke={i <= Math.round(reviewStats.average / 2) ? '#FFD700' : '#CBD5E1'} />)}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>{reviewStats.count} reseña{reviewStats.count !== 1 ? 's' : ''}</p>
                </div>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {[
                    { label: 'Limpieza', val: reviewStats.categories.cleanliness },
                    { label: 'Ubicación', val: reviewStats.categories.location },
                    { label: 'Valor', val: reviewStats.categories.value },
                    { label: 'Confort', val: reviewStats.categories.comfort },
                    { label: 'Personal', val: reviewStats.categories.staff },
                  ].map(cat => (
                    <div key={cat.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <span style={{ width: '80px', fontWeight: 600 }}>{cat.label}</span>
                      <div style={{ flex: 1, height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${(cat.val / 10) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '0.8rem', width: '2rem', textAlign: 'right' }}>{cat.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review Form */}
            {showReviewForm && (
              <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>Tu Reseña</h3>
                <input type="text" placeholder="Título (opcional)" value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 600, outline: 'none' }} />
                <textarea placeholder="Cuéntanos sobre tu experiencia..." rows={4} value={reviewForm.content} onChange={e => setReviewForm(f => ({ ...f, content: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600, outline: 'none', resize: 'vertical' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {[
                    { key: 'rating', label: 'General' },
                    { key: 'cleanliness', label: 'Limpieza' },
                    { key: 'location', label: 'Ubicación' },
                    { key: 'value', label: 'Valor' },
                    { key: 'comfort', label: 'Confort' },
                    { key: 'staff', label: 'Personal' },
                  ].map(cat => (
                    <div key={cat.key}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)' }}>{cat.label}</label>
                      <select value={(reviewForm as any)[cat.key]} onChange={e => setReviewForm(f => ({ ...f, [cat.key]: +e.target.value }))}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 700, background: 'white', outline: 'none' }}>
                        {[10,9,8,7,6,5,4,3,2,1].map(n => <option key={n} value={n}>{n}/10</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <button onClick={submitReview} disabled={submittingReview || !reviewForm.content}
                  className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', borderRadius: '14px' }}>
                  {submittingReview ? 'Enviando...' : 'Publicar Reseña'}
                </button>
              </div>
            )}

            {/* Review Cards */}
            {reviews.length > 0 ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {reviews.map((rev: any) => (
                  <div key={rev.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--dominant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={20} style={{ color: 'var(--primary)' }} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>{rev.user.firstName} {rev.user.lastName}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{new Date(rev.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</p>
                        </div>
                      </div>
                      <div style={{ background: 'var(--primary)', color: 'white', padding: '0.25rem 0.6rem', borderRadius: '8px 8px 8px 0', fontWeight: 900, fontSize: '0.9rem', height: 'fit-content' }}>
                        {rev.rating.toFixed(1)}
                      </div>
                    </div>
                    {rev.title && <p style={{ fontWeight: 800, marginBottom: '0.4rem' }}>{rev.title}</p>}
                    <p style={{ color: 'var(--secondary)', lineHeight: 1.6, fontSize: '0.9rem', fontStyle: 'italic' }}>"{rev.content}"</p>
                    {rev.ownerResponse && (
                      <div style={{ marginTop: '1rem', padding: '1rem', background: '#F0FDF9', borderRadius: '12px', borderLeft: '3px solid var(--primary)' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.3rem' }}>RESPUESTA DEL HOTEL</p>
                        <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{rev.ownerResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '20px' }}>
                <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Aún no hay reseñas para esta suite. ¡Sé el primero!</p>
              </div>
            )}
          </div>
        </div>

        {/* ======================== RIGHT COLUMN — BOOKING SIDEBAR ======================== */}
        <aside>
          <div style={{ position: 'sticky', top: '100px', background: 'white', padding: '2rem', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}>
            
            {bookingStep === 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '1.75rem', fontWeight: 900 }}>{formatPrice(home.basePrice)} <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--secondary)' }}>/ noche</span></p>
                </div>

                <div style={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0' }}>
                    <div style={{ flex: 1, padding: '1rem', borderRight: '1px solid #E2E8F0' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--secondary)' }}>Check-in</label>
                      <input type="date" value={bookingData.startDate} onChange={e => setBookingData(d => ({ ...d, startDate: e.target.value }))}
                        style={{ display: 'block', width: '100%', border: 'none', fontSize: '0.9rem', fontWeight: 700, outline: 'none', marginTop: '0.25rem' }} />
                    </div>
                    <div style={{ flex: 1, padding: '1rem' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--secondary)' }}>Check-out</label>
                      <input type="date" value={bookingData.endDate} onChange={e => setBookingData(d => ({ ...d, endDate: e.target.value }))}
                        min={bookingData.startDate}
                        style={{ display: 'block', width: '100%', border: 'none', fontSize: '0.9rem', fontWeight: 700, outline: 'none', marginTop: '0.25rem' }} />
                    </div>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--secondary)' }}>Huéspedes</label>
                    <select value={bookingData.guests} onChange={e => setBookingData(d => ({ ...d, guests: +e.target.value }))}
                      style={{ display: 'block', width: '100%', border: 'none', fontSize: '0.9rem', fontWeight: 700, outline: 'none', marginTop: '0.25rem', background: 'transparent' }}>
                      {Array.from({ length: home.maxGuests || 6 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} huésped{n > 1 ? 'es' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Availability indicator */}
                {availabilityChecked !== null && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 800,
                    background: availabilityChecked ? '#DCFCE7' : '#FEE2E2',
                    color: availabilityChecked ? '#166534' : '#991B1B' }}>
                    {availabilityChecked ? '✓ Disponible para las fechas seleccionadas' : '✕ No disponible para esas fechas'}
                  </div>
                )}
                {checkingAvailability && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 700, background: '#F1F5F9', color: 'var(--secondary)' }}>
                    Verificando disponibilidad...
                  </div>
                )}

                {/* Price breakdown with animation */}
                <div style={{ 
                  maxHeight: calculateNights() > 0 ? '500px' : '0',
                  opacity: calculateNights() > 0 ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginBottom: calculateNights() > 0 ? '1.5rem' : '0'
                }}>
                  <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 600 }}>
                      <span>{formatPrice(home.basePrice)} × {calculateNights()} noche(s)</span>
                      <span style={{ fontWeight: 800, color: 'var(--foreground)' }}>{formatPrice(calculateTotal())}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 600 }}>
                      <span>Tasa de servicio</span>
                      <span style={{ fontWeight: 800, color: '#166534' }}>GRATIS</span>
                    </div>
                    <div style={{ margin: '1rem 0', borderTop: '2px dashed #E2E8F0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem' }}>Total estimado</span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontWeight: 900, fontSize: '1.5rem', color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                          {formatPrice(calculateTotal())}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 700 }}>IVA Incluido</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!bookingData.startDate || !bookingData.endDate) { alert('Selecciona las fechas'); return; }
                    if (availabilityChecked === false) { alert('La suite no está disponible para esas fechas'); return; }
                    setBookingStep(1);
                  }}
                  disabled={!availabilityChecked || calculateNights() === 0}
                  className="btn-primary"
                  style={{ 
                    width: '100%', justifyContent: 'center', padding: '1.2rem', fontSize: '1.1rem', 
                    borderRadius: '20px', transition: 'all 0.3s ease',
                    boxShadow: availabilityChecked ? '0 10px 25px -5px rgba(46, 196, 182, 0.4)' : 'none',
                    opacity: (availabilityChecked && calculateNights() > 0) ? 1 : 0.5,
                    cursor: (availabilityChecked && calculateNights() > 0) ? 'pointer' : 'not-allowed'
                  }}>
                  Continuar a Pago
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '1rem' }}>No se realizará ningún cargo todavía</p>
              </>
            )}

            {bookingStep === 1 && (
              <div>
                <button onClick={() => setBookingStep(0)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>← Volver</button>
                <h3 style={{ fontWeight: 900, fontSize: '1.3rem', marginBottom: '2rem' }}>Datos y Comprobante</h3>
                <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <input type="text" placeholder="Nombre" value={bookingData.firstName} onChange={e => setBookingData(d => ({ ...d, firstName: e.target.value }))}
                    style={{ padding: '0.9rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.9rem', fontWeight: 600, outline: 'none' }} />
                  <input type="text" placeholder="Apellido" value={bookingData.lastName} onChange={e => setBookingData(d => ({ ...d, lastName: e.target.value }))}
                    style={{ padding: '0.9rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.9rem', fontWeight: 600, outline: 'none' }} />
                  <input type="email" placeholder="Email" value={bookingData.email} onChange={e => setBookingData(d => ({ ...d, email: e.target.value }))}
                    style={{ padding: '0.9rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.9rem', fontWeight: 600, outline: 'none' }} />
                  <input type="tel" placeholder="Teléfono" value={bookingData.phone} onChange={e => setBookingData(d => ({ ...d, phone: e.target.value }))}
                    style={{ padding: '0.9rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.9rem', fontWeight: 600, outline: 'none' }} />
                </div>

                <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #E2E8F0' }}>
                  <p style={{ fontWeight: 800, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Monto a transferir:</p>
                  <p style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 900 }}>{formatPrice(calculateTotal())}</p>
                  <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #E2E8F0' }} />
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)' }}>Cuentas de Pago Móvil:</p>
                  <p style={{ fontSize: '0.85rem' }}>Banesco (0134) - 0412-1234567</p>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '2px dashed #CBD5E1', borderRadius: '16px', cursor: 'pointer', marginBottom: '1.5rem', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: proofFile ? 'var(--primary)' : 'var(--secondary)' }}>
                  <Upload size={20} />
                  {proofFile ? proofFile.name : 'Subir comprobante de pago'}
                  <input type="file" onChange={e => setProofFile(e.target.files?.[0] || null)} style={{ display: 'none' }} accept="image/*" />
                </label>

                <button onClick={handleBooking} disabled={uploading} className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '1.1rem', fontSize: '1rem', borderRadius: '16px' }}>
                  {uploading ? 'Procesando...' : 'Confirmar Reserva'}
                </button>
              </div>
            )}

            {bookingStep === 2 && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <CheckCircle size={40} style={{ color: '#166534' }} />
                </div>
                <h2 style={{ fontWeight: 900, marginBottom: '0.75rem', fontSize: '1.5rem' }}>¡Solicitud Recibida!</h2>
                <p style={{ color: 'var(--secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>Tu comprobante está siendo validado. Te contactaremos pronto por email.</p>
                <Link href="/portal" className="btn-primary" style={{ marginTop: '2rem', display: 'inline-flex' }}>Ver Mis Reservas</Link>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ======================== LIGHTBOX ======================== */}
      {lightboxOpen && images.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}
          onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={24} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + images.length) % images.length); }}
            style={{ position: 'absolute', left: '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={28} />
          </button>
          <img src={images[lightboxIndex]} alt="" style={{ maxWidth: '85vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '12px' }} onClick={e => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % images.length); }}
            style={{ position: 'absolute', right: '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={28} />
          </button>
          <div style={{ position: 'absolute', bottom: '2rem', color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 968px) {
          div { grid-template-columns: 1fr !important; }
          aside { margin-top: 2rem; }
        }
      `}</style>
    </div>
  );
}

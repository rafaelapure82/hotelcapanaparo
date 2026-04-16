'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

type Language = 'es' | 'en' | 'it' | 'pt' | 'fr' | 'de';

interface Translations {
  [key: string]: {
    [K in Language]: string;
  };
}

const translations: Translations = {
  // Navigation & Auth
  welcome: { es: 'Bienvenido a', en: 'Welcome to', it: 'Benvenuti a', pt: 'Bem-vindo a', fr: 'Bienvenue à', de: 'Willkommen bei' },
  heroTitle: { es: 'Hotel Capanaparo Suites', en: 'Hotel Capanaparo Suites', it: 'Hotel Capanaparo Suites', pt: 'Hotel Capanaparo Suites', fr: 'Hôtel Capanaparo Suites', de: 'Hotel Capanaparo Suites' },
  heroSubtitle: { 
    es: 'Vive la experiencia de las propiedades más exclusivas, diseñadas para quienes buscan lo excepcional.', 
    en: 'Experience the world\'s most unique properties, curated for travelers who seek the exceptional.',
    it: 'Scopri le proprietà più esclusive del mondo, curate per viaggiatori che cercano l\'eccezionale.',
    pt: 'Experimente as propriedades mais exclusivas do mundo, selecionadas para viajantes que buscam o excepcional.',
    fr: 'Découvrez les propriétés les plus uniques au monde, sélectionnées pour les voyageurs en quête d\'exception.',
    de: 'Erleben Sie die weltweit einzigartigsten Immobilien, kuratiert für Reisende, die das Außergewöhnliche suchen.'
  },
  signIn: { es: 'Iniciar Sesión', en: 'Sign In', it: 'Accedi', pt: 'Entrar', fr: 'Connexion', de: 'Anmelden' },
  explore: { es: 'Explorar', en: 'Explore', it: 'Esplora', pt: 'Explorar', fr: 'Explorer', de: 'Erkunden' },
  myPortal: { es: 'Mi Portal', en: 'My Portal', it: 'Il Mio Portale', pt: 'Meu Portal', fr: 'Mon Portail', de: 'Mein Portal' },
  dashboard: { es: 'Panel Control', en: 'Dashboard', it: 'Dashboard', pt: 'Painel', fr: 'Tableau de bord', de: 'Dashboard' },
  logout: { es: 'Cerrar Sesión', en: 'Logout', it: 'Disconnetti', pt: 'Sair', fr: 'Déconnexion', de: 'Abmelden' },
  
  // Dashboard Metrics & Labels
  overview: { es: 'Vista General', en: 'Overview', it: 'Panoramica', pt: 'Visão Geral', fr: 'Aperçu', de: 'Übersicht' },
  myProperties: { es: 'Mis Propiedades', en: 'My Properties', it: 'Le Mie Proprietà', pt: 'Minhas Propriedades', fr: 'Mes Propriétés', de: 'Meine Immobilien' },
  bookings: { es: 'Reservas', en: 'Bookings', it: 'Prenotazioni', pt: 'Reservas', fr: 'Réservations', de: 'Buchungen' },
  earnings: { es: 'Ingresos', en: 'Earnings', it: 'Guadagni', pt: 'Ganhos', fr: 'Gains', de: 'Einnahmen' },
  settings: { es: 'Configuración', en: 'Settings', it: 'Impostazioni', pt: 'Configurações', fr: 'Paramètres', de: 'Einstellungen' },
  
  totalEarnings: { es: 'Ingresos Totales', en: 'Total Earnings', it: 'Guadagni Totali', pt: 'Ganhos Totais', fr: 'Total des Gains', de: 'Gesamteinnahmen' },
  activeBookings: { es: 'Reservas Activas', en: 'Active Bookings', it: 'Prenotazioni Attive', pt: 'Reservas Ativas', fr: 'Réservations Actives', de: 'Aktive Buchungen' },
  totalSuites: { es: 'Suites Totales', en: 'Total Suites', it: 'Suite Totali', pt: 'Suites Totais', fr: 'Total des Suites', de: 'Suiten Gesamt' },
  occupancyRate: { es: 'Tasa Ocupación', en: 'Occupancy Rate', it: 'Tasso di Occupazione', pt: 'Taxa de Ocupação', fr: 'Taux d\'Occupation', de: 'Belegungsrate' },
  
  actionRequired: { es: 'Acción Requerida', en: 'Action Required', it: 'Azione Richiesta', pt: 'Ação Requerida', fr: 'Action Requise', de: 'Handlung Erforderlich' },
  viewTimeline: { es: 'Ver Línea Tiempo', en: 'View Timeline', it: 'Vedi Timeline', pt: 'Ver Linha do Tempo', fr: 'Voir la Timeline', de: 'Zeitplan Anzeigen' },
  addNewProperty: { es: 'Añadir Propiedad', en: 'Add Property', it: 'Aggiungi Proprietà', pt: 'Adicionar Propriedade', fr: 'Ajouter une Propriété', de: 'Immobilie Hinzufügen' },
  manageNow: { es: 'Gestionar Ahora', en: 'Manage Now', it: 'Gestisci Ora', pt: 'Gerenciar Agora', fr: 'Gérer Maintenant', de: 'Jetzt Verwalten' },
  
  // Search & Exploration
  filterBy: { es: 'Filtrar Por', en: 'Filter By', it: 'Filtra Per', pt: 'Filtrar Por', fr: 'Filtrer Par', de: 'Filtern Nach' },
  sortBy: { es: 'Ordenar Por', en: 'Sort By', it: 'Ordina Per', pt: 'Ordenar Por', fr: 'Trier Par', de: 'Sortieren Nach' },
  priceRange: { es: 'Rango de Precio', en: 'Price Range', it: 'Fascia di Prezzo', pt: 'Faixa de Preço', fr: 'Gamme de Prix', de: 'Preisspanne' },
  featured: { es: 'Destacados', en: 'Featured', it: 'Destacati', pt: 'Destaques', fr: 'En Vedette', de: 'Hervorgehoben' },
  popularity: { es: 'Más Visitados', en: 'Popularity', it: 'Popolarità', pt: 'Popularidade', fr: 'Popularité', de: 'Beliebtheit' },
  priceLowHigh: { es: 'Precio: Menor a Mayor', en: 'Price: Low to High', it: 'Prezzo: Crescente', pt: 'Preço: Menor para Maior', fr: 'Prix : Croissant', de: 'Preis: Aufsteigend' },
  priceHighLow: { es: 'Precio: Mayor a Menor', en: 'Price: High to Low', it: 'Prezzo: Decrescente', pt: 'Preço: Maior para Menor', fr: 'Prix : Décroissant', de: 'Preis: Absteigend' },
  noResults: { es: 'No se encontraron habitaciones con estos filtros.', en: 'No results found with these filters.', it: 'Nessun risultato trovato con questi filtri.', pt: 'Nenhum resultado encontrado com esses filtros.', fr: 'Aucun résultat trouvé avec ces filtres.', de: 'Keine Ergebnisse mit diesen Filtern gefunden.' },
  allProperties: { es: 'Todas las Propiedades', en: 'All Properties', it: 'Tutte le Proprietà', pt: 'Todas as Propriedades', fr: 'Toutes les Propriétés', de: 'Alle Immobilien' },
  freeCancellation: { es: 'Cancelación Gratuita', en: 'Free Cancellation', it: 'Cancellazione Gratuita', pt: 'Cancelamento Grátis', fr: 'Annulation Gratuite', de: 'Kostenlose Stornierung' },
  bookNow: { es: 'RESERVAR AHORA', en: 'BOOK NOW', it: 'PRENOTA ORA', pt: 'RESERVAR AGORA', fr: 'RÉSERVER MAINTENANT', de: 'JETZT BUCHEN' },
  checkin: { es: 'ENTRADA', en: 'CHECK-IN', it: 'CHECK-IN', pt: 'ENTRADA', fr: 'ARRIVÉE', de: 'CHECK-IN' },
  checkout: { es: 'SALIDA', en: 'CHECK-OUT', it: 'CHECK-OUT', pt: 'SAÍDA', fr: 'DÉPART', de: 'CHECK-OUT' },
  dashboard: { es: 'Panel de Control', en: 'Dashboard', it: 'Cruscotto', pt: 'Painel', fr: 'Tableau de bord', de: 'Dashboard' },
  totalRevenue: { es: 'Ingresos Totales', en: 'Total Revenue', it: 'Ricavi Totali', pt: 'Receita Total', fr: 'Revenu Total', de: 'Gesamtumsatz' },
  newBookings: { es: 'Nuevas Reservas', en: 'New Bookings', it: 'Nuove Prenotazioni', pt: 'Novas Reservas', fr: 'Nouvelles Réservations', de: 'Neue Buchungen' },
  fromLastWeek: { es: 'desde la semana pasada', en: 'from last week', it: 'dall\'ultima settimana', pt: 'desde a semana passada', fr: 'depuis la semaine dernière', de: 'seit letzter Woche' },
  bookingList: { es: 'Lista de Reservas', en: 'Booking List', it: 'Lista Prenotazioni', pt: 'Lista de Reservas', fr: 'Liste des Réservations', de: 'Buchungsliste' },


  // Table Headers


  guest: { es: 'HUÉSPED', en: 'GUEST', it: 'OSPITE', pt: 'HÓSPEDE', fr: 'INVITÉ', de: 'GAST' },
  property: { es: 'PROPIEDAD', en: 'PROPERTY', it: 'PROPRIETÀ', pt: 'PROPRIEDADE', fr: 'PROPRIÉTÉ', de: 'IMMOBILIE' },
  dates: { es: 'FECHAS', en: 'DATES', it: 'DATE', pt: 'DATAS', fr: 'DATES', de: 'TERMINE' },
  status: { es: 'ESTADO', en: 'STATUS', it: 'STATO', pt: 'STATUS', fr: 'STATUT', de: 'STATUS' },
  total: { es: 'TOTAL', en: 'TOTAL', it: 'TOTALE', pt: 'TOTAL', fr: 'TOTAL', de: 'TOTAL' },
  
  // Exchange Rate
  dailyRate: { es: 'Tasa del Día', en: 'Daily Rate', it: 'Tasso del Giorno', pt: 'Taxa do Dia', fr: 'Taux du Jour', de: 'Tageskurs' },
  updateRate: { es: 'Actualizar Tasa', en: 'Update Rate', it: 'Aggiorna Tasso', pt: 'Atualizar Taxa', fr: 'Mettre à jour le taux', de: 'Kurs Aktualisieren' },
  
  // General UI
  loading: { es: 'Cargando experiencia...', en: 'Loading experience...', it: 'Caricamento esperienza...', pt: 'Carregando experiência...', fr: 'Chargement de l\'expérience...', de: 'Erfahrung wird geladen...' },
  noUpcomingStays: { es: 'No tienes próximas estadías', en: 'No upcoming stays', it: 'Nessun soggiorno imminente', pt: 'Nenhuma estadia futura', fr: 'Aucun séjour à venir', de: 'Keine anstehenden Aufenthalte' },
  myStays: { es: 'Mis Estadías', en: 'My Stays', it: 'I Miei Soggiorni', pt: 'Minhas Estadias', fr: 'Mes Séjours', de: 'Meine Aufenthalte' },
  viewSuite: { es: 'Ver Suite', en: 'View Suite', it: 'Vedi Suite', pt: 'Ver Suíte', fr: 'Voir la Suite', de: 'Suite Anzeigen' },
  exploreSuites: { es: 'Explorar Suites', en: 'Explore Suites', it: 'Esplora le Suite', pt: 'Explorar Suítes', fr: 'Explorer les Suites', de: 'Suiten Erkunden' },

  // Property Management (CRUD)
  addSuite: { es: 'Añadir Suite', en: 'Add Suite', it: 'Aggiungi Suite', pt: 'Adicionar Suíte', fr: 'Ajouter une Suite', de: 'Suite Hinzufügen' },
  editSuite: { es: 'Editar Suite', en: 'Edit Suite', it: 'Modifica Suite', pt: 'Editar Suíte', fr: 'Modifier la Suite', de: 'Suite Bearbeiten' },
  title: { es: 'Título de la Suite', en: 'Suite Title', it: 'Titolo Suite', pt: 'Título da Suíte', fr: 'Titre de la Suite', de: 'Suite-Titel' },
  description: { es: 'Descripción', en: 'Description', it: 'Descrizione', pt: 'Descrição', fr: 'Description', de: 'Beschreibung' },
  basePrice: { es: 'Precio Base (USD)', en: 'Base Price (USD)', it: 'Prezzo Base (USD)', pt: 'Preço Base (USD)', fr: 'Prix de Base (USD)', de: 'Basispreis (USD)' },
  city: { es: 'Ciudad', en: 'City', it: 'Città', pt: 'Cidade', fr: 'Ville', de: 'Stadt' },
  address: { es: 'Dirección Exacta', en: 'Exact Address', it: 'Indirizzo Esatto', pt: 'Endereço Exato', fr: 'Adresse Exacte', de: 'Genaue Adresse' },
  status_publish: { es: 'Publicado', en: 'Published', it: 'Pubblicato', pt: 'Publicado', fr: 'Publié', de: 'Veröffentlicht' },
  status_draft: { es: 'Borrador', en: 'Draft', it: 'Bozza', pt: 'Rascunho', fr: 'Brouillon', de: 'Entwurf' },
  saveChanges: { es: 'Guardar Cambios', en: 'Save Changes', it: 'Salva Modifiche', pt: 'Salvar Alterações', fr: 'Enregistrer les modifications', de: 'Änderungen Speichern' },
  deleteConfirm: { es: '¿Estás seguro de eliminar esta suite?', en: 'Are you sure you want to delete this suite?', it: 'Sei sicuro di voler eliminare questa suite?', pt: 'Tem certeza que deseja excluir esta suíte?', fr: 'Êtes-vous sûr de vouloir supprimer cette suite ?', de: 'Sind Sie sicher, dass Sie diese Suite löschen möchten?' },
  
  // Amenities
  wifi: { es: 'WiFi Gratis', en: 'Free WiFi', it: 'WiFi Gratuito', pt: 'WiFi Grátis', fr: 'WiFi Gratuit', de: 'Gratis WLAN' },
  ac: { es: 'Aire Acondicionado', en: 'Air Conditioning', it: 'Aria Condizionata', pt: 'Ar Condicionado', fr: 'Climatisation', de: 'Klimaanlage' },
  pool: { es: 'Piscina', en: 'Pool', it: 'Piscina', pt: 'Piscina', fr: 'Piscine', de: 'Pool' },
  parking: { es: 'Estacionamiento', en: 'Parking', it: 'Parcheggio', pt: 'Estacionamento', fr: 'Parking', de: 'Parkplatz' },
  kitchen: { es: 'Cocina Equipada', en: 'Full Kitchen', it: 'Cucina Attrezzata', pt: 'Cozinha Completa', fr: 'Cuisine Équipée', de: 'Voll ausgestattete Küche' },
  tv: { es: 'Smart TV', en: 'Smart TV', it: 'Smart TV', pt: 'Smart TV', fr: 'Smart TV', de: 'Smart TV' },
  otherDetails: { es: 'Otros detalles y servicios', en: 'Other details & services', it: 'Altri dettagli e servizi', pt: 'Outros detalhes e serviços', fr: 'Autres détails et services', de: 'Weitere Details & Services' },

  firstName: { es: 'Nombre', en: 'First Name', it: 'Nome', pt: 'Nome', fr: 'Prénom', de: 'Vorname' },

  lastName: { es: 'Apellido', en: 'Last Name', it: 'Cognome', pt: 'Sobrenome', fr: 'Nom', de: 'Nachname' },
  email: { es: 'Correo Electrónico', en: 'Email Address', it: 'Indirizzo Email', pt: 'E-mail', fr: 'Adresse e-mail', de: 'E-Mail-Adresse' },
  password: { es: 'Contraseña', en: 'Password', it: 'Password', pt: 'Senha', fr: 'Mot de passe', de: 'Passwort' },
  createAccount: { es: 'Crear Cuenta', en: 'Create Account', it: 'Crea Account', pt: 'Criar Conta', fr: 'Créer un compte', de: 'Konto erstellen' },
  alreadyHaveAccount: { es: '¿Ya tienes una cuenta?', en: 'Already have an account?', it: 'Hai già un account?', pt: 'Já tem uma conta?', fr: 'Vous avez déjà un compte ?', de: 'Hast du schon ein Konto?' },
  dontHaveAccount: { es: '¿No tienes una cuenta?', en: 'Don\'t have an account?', it: 'Non hai un account?', pt: 'Não tiene una conta?', fr: 'Vous n\'avez pas de compte ?', de: 'Hast du noch kein Konto?' },
  registerTitle: { es: 'Únete a las Suites', en: 'Join the Suites', it: 'Unisciti alle Suites', pt: 'Junte-se às Suites', fr: 'Rejoignez les Suites', de: 'Treten Sie den Suiten bei' },
  loginWelcome: { es: 'Bienvenido de nuevo', en: 'Welcome Back', it: 'Bentornato', pt: 'Bem-vindo de volta', fr: 'Bon retour', de: 'Willkommen zurück' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  exchangeRate: number;
  updateRate: (rate: number) => Promise<void>;
  formatPrice: (usdAmount: number) => string;
  formatDate: (date: string | Date) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');
  const [exchangeRate, setExchangeRate] = useState<number>(36.5);

  // Initialize from storage
  useEffect(() => {
    const savedRate = localStorage.getItem('manual_exchange_rate');
    if (savedRate) {
      setExchangeRate(parseFloat(savedRate));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Global Exchange Rate Sync
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const { data } = await api.get('/settings/exchange-rate');
        if (data.rate) setExchangeRate(data.rate);
      } catch (err) {
        console.error('Failed to sync exchange rate from DB', err);
      }
    };
    fetchRate();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
  };

  const updateRate = async (rate: number) => {
    try {
      await api.patch('/settings/exchange-rate', { rate });
      setExchangeRate(rate);
      localStorage.setItem('manual_exchange_rate', rate.toString());
    } catch (err) {
      console.error('Failed to update rate', err);
      throw err;
    }
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  const formatPrice = (usdAmount: number = 0) => {
    const safeAmount = usdAmount || 0;
    const vesAmount = safeAmount * exchangeRate;
    return `$${safeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} / ${vesAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} Bs.`;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <LanguageContext.Provider value={{ 
      language, setLanguage, t, 
      exchangeRate, updateRate, 
      formatPrice, formatDate 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}

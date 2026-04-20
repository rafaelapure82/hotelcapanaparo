import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hotelcapanaparo.com';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${API_URL}/homes/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return { title: 'Suite no encontrada' };
    const home = await res.json();

    const title = `${home.title} — ${home.city || 'Hotel Capanaparo'}`;
    const description = home.description?.slice(0, 160) || `Reserva ${home.title} en Hotel Capanaparo Suites. Desde $${home.basePrice}/noche.`;
    const image = home.gallery?.split(',')[0]?.trim();
    const imageUrl = image?.startsWith('http') ? image : `${API_URL}${image?.startsWith('/') ? '' : '/'}${image}`;

    return {
      title,
      description,
      keywords: [home.title, home.city, home.country, 'hotel', 'suite', 'reserva', home.homeType].filter(Boolean),
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/homes/${id}`,
        siteName: 'Hotel Capanaparo Suites',
        images: image ? [{ url: imageUrl, width: 1200, height: 630, alt: home.title }] : [],
        locale: 'es_VE',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: image ? [imageUrl] : [],
      },
      alternates: {
        canonical: `${SITE_URL}/homes/${id}`,
      },
      other: {
        'og:price:amount': String(home.basePrice || 0),
        'og:price:currency': 'USD',
      },
    };
  } catch {
    return { title: 'Hotel Capanaparo Suites' };
  }
}

export default function HomeDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

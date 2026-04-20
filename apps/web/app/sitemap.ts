import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hotelcapanaparo.com';

export default async function sitemap(): Promise<MetadataRoute['sitemap']> {
  // Static pages
  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${SITE_URL}/homes`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${SITE_URL}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${SITE_URL}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
  ];

  // Dynamic property pages
  let propertyPages: MetadataRoute['sitemap'] = [];
  try {
    const res = await fetch(`${API_URL}/homes`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const homes = await res.json();
      propertyPages = homes.map((home: any) => ({
        url: `${SITE_URL}/homes/${home.id}`,
        lastModified: new Date(home.updatedAt || home.createdAt),
        changeFrequency: 'weekly' as const,
        priority: home.isFeatured ? 0.9 : 0.8,
      }));
    }
  } catch {
    // Fail silently if API is not available
  }

  return [...staticPages, ...propertyPages];
}

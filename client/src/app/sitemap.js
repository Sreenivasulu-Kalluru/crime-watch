export default function sitemap() {
  const baseUrl = 'http://localhost:3000';

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/map`, lastModified: new Date(), changeFrequency: 'always', priority: 0.9 },
    { url: `${baseUrl}/reports`, lastModified: new Date(), changeFrequency: 'always', priority: 0.8 },
    { url: `${baseUrl}/report`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}

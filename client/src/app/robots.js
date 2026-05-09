export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard'],
      },
    ],
    sitemap: 'http://localhost:3000/sitemap.xml',
  };
}

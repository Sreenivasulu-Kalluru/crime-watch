import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'CrimeWatch — Real-Time Crime Reporting System',
    template: '%s | CrimeWatch',
  },
  description: 'A civic engagement platform for reporting crimes with geolocation tagging, photos, and videos. Authorities respond in real-time to keep communities safe.',
  keywords: ['crime reporting', 'real-time', 'community safety', 'geolocation', 'incident tracking', 'anonymous reporting', 'crime map'],
  authors: [{ name: 'CrimeWatch Team' }],
  creator: 'CrimeWatch',
  publisher: 'CrimeWatch',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'CrimeWatch',
    title: 'CrimeWatch — Real-Time Crime Reporting System',
    description: 'Report crimes anonymously with geolocation, photos and videos. View incidents on a real-time map.',
    images: [{ url: '/favicon.png', width: 512, height: 512, alt: 'CrimeWatch Logo' }],
  },
  twitter: {
    card: 'summary',
    title: 'CrimeWatch — Real-Time Crime Reporting System',
    description: 'Report crimes anonymously with geolocation, photos and videos. View incidents on a real-time map.',
    images: ['/favicon.png'],
  },
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0e1a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="http://localhost:5000" />
      </head>
      <body>
        <AuthProvider>
          <SocketProvider>
            <Navbar />
            <main style={{ paddingTop: '71px' }}>{children}</main>
            <Footer />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

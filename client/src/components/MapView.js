'use client';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues with Leaflet
const MapViewInner = dynamic(() => import('./MapViewInner'), { ssr: false, loading: () => <div className="spinner-overlay"><div className="spinner"></div></div> });

export default function MapView(props) {
  return <MapViewInner {...props} />;
}

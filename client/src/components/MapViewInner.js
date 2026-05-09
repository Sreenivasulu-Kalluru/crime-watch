'use client';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const categoryColors = {
  theft: '#f97316', assault: '#ef4444', vandalism: '#a855f7', fraud: '#eab308',
  drug_activity: '#ec4899', suspicious_activity: '#6366f1', traffic: '#06b6d4',
  murder: '#dc2626', kidnapping: '#b91c1c', cybercrime: '#8b5cf6', other: '#64748b'
};

function createIcon(category) {
  const color = categoryColors[category] || '#64748b';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid rgba(255,255,255,0.9);box-shadow:0 2px 8px ${color}66;"></div>`,
    iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -14]
  });
}

export default function MapViewInner({ reports = [], center = [20.5937, 78.9629], zoom = 5, style = {} }) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', ...style }} scrollWheelZoom={true}>
      <LayersControl position="bottomright">
        <LayersControl.BaseLayer checked name="Dark Map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        </LayersControl.BaseLayer>
        
        <LayersControl.BaseLayer name="Satellite View">
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="Street Map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
      </LayersControl>
      {reports.map((report) => {
        const coords = report.location?.coordinates;
        if (!coords || coords.length < 2) return null;
        return (
          <Marker key={report._id} position={[coords[1], coords[0]]} icon={createIcon(report.category)}>
            <Popup>
              <div style={{minWidth:200, color:'#1e293b'}}>
                <strong style={{fontSize:'0.95rem'}}>{report.title}</strong>
                <p style={{fontSize:'0.8rem', margin:'4px 0', color:'#64748b'}}>{report.description?.substring(0, 100)}...</p>
                <div style={{display:'flex', gap:'6px', marginTop:'6px'}}>
                  <span style={{fontSize:'0.7rem', padding:'2px 6px', borderRadius:'4px', background:'#e0f2fe', color:'#0284c7'}}>{report.category}</span>
                  <span style={{fontSize:'0.7rem', padding:'2px 6px', borderRadius:'4px', background:'#fef3c7', color:'#d97706'}}>{report.status}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

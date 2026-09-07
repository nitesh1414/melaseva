import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import { assetAPI, facilityAPI, complaintAPI } from '../../services/api';
import { useAuthStore } from '../../contexts/AuthContext';
import L from 'leaflet';

const { BaseLayer, Overlay } = LayersControl;

const createIcon = (color) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 3px rgba(0,0,0,0.3);"></div>`,
  iconSize: [14, 14],
});

const typeColors = {
  ELECTRICAL_POLE: '#f59e0b', STREET_LIGHT: '#fbbf24', DISTRIBUTION_BOX: '#ef4444',
  TRANSFORMER: '#dc2626', SUBSTATION: '#b91c1c', WATER_POINT: '#3b82f6',
  TOILET: '#06b6d4', SHELTER: '#8b5cf6', PARKING: '#6366f1', HOSPITAL: '#ef4444',
  POLICE_POST: '#1d4ed8', FIRE_STATION: '#dc2626',
};

const complaintStatusColors = {
  NEW: '#3b82f6', ASSIGNED: '#f59e0b', IN_PROGRESS: '#f97316',
  RESOLVED: '#10b981', CLOSED: '#6b7280', ESCALATED: '#ef4444',
};

export default function AssetMap() {
  const user = useAuthStore((state) => state.user);
  const eventId = user?.event?._id || user?.event;
  const [layers, setLayers] = useState({ assets: true, facilities: true, complaints: false });
  const [assetTypeFilter, setAssetTypeFilter] = useState('');

  const { data: assets } = useQuery({
    queryKey: ['assetMap', eventId, assetTypeFilter],
    queryFn: () => assetAPI.map(eventId, { assetType: assetTypeFilter }).then(res => res.data.data),
    enabled: !!eventId && layers.assets,
  });

  const { data: facilities } = useQuery({
    queryKey: ['facilityMap', eventId],
    queryFn: () => facilityAPI.map(eventId).then(res => res.data.data),
    enabled: !!eventId && layers.facilities,
  });

  const { data: complaints } = useQuery({
    queryKey: ['complaintMap', eventId],
    queryFn: () => complaintAPI.map(eventId).then(res => res.data.data),
    enabled: !!eventId && layers.complaints,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold">GIS Dashboard</h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center text-sm"><input type="checkbox" checked={layers.assets} onChange={(e) => setLayers({...layers, assets: e.target.checked})} className="mr-2" />Assets</label>
          <label className="flex items-center text-sm"><input type="checkbox" checked={layers.facilities} onChange={(e) => setLayers({...layers, facilities: e.target.checked})} className="mr-2" />Facilities</label>
          <label className="flex items-center text-sm"><input type="checkbox" checked={layers.complaints} onChange={(e) => setLayers({...layers, complaints: e.target.checked})} className="mr-2" />Complaints</label>
          <select className="input w-auto text-sm" value={assetTypeFilter} onChange={(e) => setAssetTypeFilter(e.target.value)}>
            <option value="">All Asset Types</option>
            {['ELECTRICAL_POLE', 'STREET_LIGHT', 'DISTRIBUTION_BOX', 'TRANSFORMER'].map(t => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <MapContainer center={[22.7196, 75.8577]} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          
          {layers.assets && (assets || []).map(a => (
            <Marker key={a.id} position={[a.coordinates[1], a.coordinates[0]]} icon={createIcon(typeColors[a.assetType] || '#6b7280')}>
              <Popup><div className="text-sm"><strong>{a.assetId}</strong><br/>Type: {a.assetType?.replace(/_/g, ' ')}<br/>Pole: {a.poleNumber || 'N/A'}<br/>Status: {a.status}</div></Popup>
            </Marker>
          ))}

          {layers.facilities && (facilities || []).map(f => (
            <Marker key={f.id} position={[f.coordinates[1], f.coordinates[0]]} icon={createIcon(typeColors[f.type] || '#06b6d4')}>
              <Popup><div className="text-sm"><strong>{f.name}</strong><br/>Type: {f.type}<br/>{f.contactNumber || ''}</div></Popup>
            </Marker>
          ))}

          {layers.complaints && (complaints || []).map(c => (
            <Marker key={c.id} position={[c.coordinates[1], c.coordinates[0]]} icon={createIcon(complaintStatusColors[c.status] || '#6b7280')}>
              <Popup><div className="text-sm"><strong>{c.complaintNumber}</strong><br/>{c.category}<br/>Status: {c.status}<br/>Priority: {c.priority}</div></Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

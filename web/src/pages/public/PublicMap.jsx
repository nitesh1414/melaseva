import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { facilityAPI } from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiMapPin, FiNavigation, FiPhone } from 'react-icons/fi';

const typeIcons = {
  HOSPITAL: '🏥', POLICE_STATION: '👮', POLICE_POST: '👮', TOILET: '🚻',
  PARKING: '🅿️', GHAT: '🛕', SHELTER: '🏠', FIRE_STATION: '🚒',
  DRINKING_WATER: '💧', HELP_CENTRE: '❓', CONTROL_ROOM: '📡', MEDICAL_CENTRE: '⚕️',
};

const createEmojiIcon = (emoji) => L.divIcon({
  className: 'emoji-marker',
  html: `<div style="font-size:24px;text-align:center;">${emoji}</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function LocateUser() {
  const map = useMap();
  useEffect(() => {
    map.locate({ setView: true, maxZoom: 16 });
  }, [map]);
  return null;
}

export default function PublicMap() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 22.7196, lng: 75.8577 }) // default
      );
    } else {
      setUserLocation({ lat: 22.7196, lng: 75.8577 });
    }
  }, []);

  const { data: facilities } = useQuery({
    queryKey: ['publicFacilities', typeFilter],
    queryFn: () => facilityAPI.map('all', { type: typeFilter }).then(res => res.data.data).catch(() => []),
    enabled: !!userLocation,
  });

  const filteredFacilities = (facilities || []).filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.type.toLowerCase().includes(search.toLowerCase())
  );

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-800 text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-saffron-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold">MS</span>
            </div>
            <h1 className="font-bold text-lg">{t('smartMap')}</h1>
          </div>
          <button onClick={toggleLanguage} className="text-sm bg-primary-700 px-3 py-1 rounded">
            {i18n.language === 'en' ? 'हिन्दी' : 'English'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Search and Filter */}
        <div className="flex space-x-2 mb-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input type="text" className="input pl-10" placeholder="Search facilities..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {['HOSPITAL', 'POLICE_STATION', 'POLICE_POST', 'TOILET', 'PARKING', 'GHAT', 'SHELTER', 'FIRE_STATION', 'DRINKING_WATER', 'HELP_CENTRE', 'CONTROL_ROOM', 'MEDICAL_CENTRE'].map(t => (
              <option key={t} value={t}>{typeIcons[t]} {t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {/* Map */}
        <div className="card p-0 overflow-hidden" style={{ height: '500px' }}>
          <MapContainer center={[userLocation?.lat || 22.7196, userLocation?.lng || 75.8577]} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocateUser />
            
            {filteredFacilities.map(f => (
              <Marker key={f.id} position={[f.coordinates[1], f.coordinates[0]]} icon={createEmojiIcon(typeIcons[f.type] || '📍')}>
                <Popup>
                  <div className="text-sm">
                    <strong>{f.name}</strong><br />
                    <span className="text-gray-500">{f.type?.replace(/_/g, ' ')}</span>
                    {f.contactNumber && <p className="mt-1"><FiPhone className="inline mr-1" size={12} />{f.contactNumber}</p>}
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${f.coordinates[1]},${f.coordinates[0]}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-2 text-primary-600 hover:text-primary-800">
                      <FiNavigation className="mr-1" size={12} /> Get Directions
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Facility List */}
        <div className="mt-4">
          <h3 className="font-semibold text-gray-800 mb-2">{t('nearbyFacilities')} ({filteredFacilities.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredFacilities.slice(0, 10).map(f => (
              <div key={f.id} className="card p-3 flex items-center">
                <span className="text-2xl mr-3">{typeIcons[f.type] || '📍'}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{f.name}</p>
                  <p className="text-xs text-gray-500">{f.type?.replace(/_/g, ' ')}</p>
                </div>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${f.coordinates[1]},${f.coordinates[0]}`} target="_blank" rel="noopener noreferrer" className="text-primary-600">
                  <FiNavigation size={20} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { qrCodeAPI } from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { FiMapPin, FiAlertCircle, FiNavigation, FiCompass, FiInfo } from 'react-icons/fi';

export default function AssetView() {
  const { code } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [assetData, setAssetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const response = await qrCodeAPI.scan(code);
        setAssetData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Asset not found');
      } finally {
        setLoading(false);
      }
    };
    if (code) fetchAsset();
  }, [code]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="text-red-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Asset Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/map" className="btn-primary">View Smart Map</Link>
        </div>
      </div>
    );
  }

  const { asset, event, qrCode } = assetData;
  const lat = asset.location?.coordinates[1];
  const lng = asset.location?.coordinates[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-800 text-white p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-saffron-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold">MS</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">{event?.name || 'Mela Seva'}</h1>
              <p className="text-xs text-primary-200">{t('tagline')}</p>
            </div>
          </div>
          <button onClick={toggleLanguage} className="text-sm bg-primary-700 px-3 py-1 rounded">
            {i18n.language === 'en' ? 'हिन्दी' : 'English'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Asset Info Card */}
        <div className="card">
          <div className="flex items-center mb-3">
            <FiInfo className="text-primary-600 mr-2" size={20} />
            <h2 className="text-lg font-bold text-gray-800">Asset Information</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Asset ID:</span><span className="font-mono font-semibold">{asset.assetId}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Type:</span><span className="font-medium">{asset.assetType?.replace(/_/g, ' ')}</span></div>
            {asset.poleNumber && <div className="flex justify-between"><span className="text-gray-500">Pole #:</span><span className="font-medium">{asset.poleNumber}</span></div>}
            {asset.road && <div className="flex justify-between"><span className="text-gray-500">Road:</span><span className="font-medium">{asset.road?.name}</span></div>}
            {asset.sector && <div className="flex justify-between"><span className="text-gray-500">Sector:</span><span className="font-medium">{asset.sector?.name}</span></div>}
            {asset.department && <div className="flex justify-between"><span className="text-gray-500">Department:</span><span className="font-medium">{asset.department?.name}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Status:</span><span className={`px-2 py-0.5 rounded-full text-xs ${asset.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{asset.status}</span></div>
          </div>
        </div>

        {/* Map */}
        {lat && lng && (
          <div className="card p-0 overflow-hidden" style={{ height: '200px' }}>
            <MapContainer center={[lat, lng]} zoom={17} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[lat, lng]}>
                <Popup>{asset.assetId}</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link to={`/complaint/register?asset=${asset._id}&code=${code}`} className="btn-danger py-3 text-center flex items-center justify-center">
            <FiAlertCircle className="mr-2" /> {t('registerComplaint')}
          </Link>
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} target="_blank" rel="noopener noreferrer" className="btn-primary py-3 text-center flex items-center justify-center">
            <FiNavigation className="mr-2" /> Get Directions
          </a>
          <Link to="/map" className="btn-secondary py-3 text-center flex items-center justify-center col-span-2">
            <FiCompass className="mr-2" /> {t('nearbyFacilities')}
          </Link>
        </div>
      </div>
    </div>
  );
}

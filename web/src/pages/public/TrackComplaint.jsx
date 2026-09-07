import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { complaintAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiCheckCircle, FiClock, FiAlertCircle, FiArrowRight } from 'react-icons/fi';

const statusIcons = {
  NEW: FiClock, RECEIVED: FiClock, VERIFICATION: FiSearch, ASSIGNED: FiAlertCircle,
  IN_PROGRESS: FiClock, RESOLVED: FiCheckCircle, CLOSED: FiCheckCircle,
  ESCALATED: FiAlertCircle, REJECTED: FiAlertCircle, REOPENED: FiClock,
};

const statusColors = {
  NEW: 'bg-blue-500', RECEIVED: 'bg-blue-500', VERIFICATION: 'bg-indigo-500',
  ASSIGNED: 'bg-yellow-500', IN_PROGRESS: 'bg-orange-500', RESOLVED: 'bg-green-500',
  CLOSED: 'bg-gray-500', ESCALATED: 'bg-red-500', REJECTED: 'bg-red-500', REOPENED: 'bg-purple-500',
};

export default function TrackComplaint() {
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const [complaintNumber, setComplaintNumber] = useState(searchParams.get('number') || '');
  const [mobile, setMobile] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!complaintNumber) { setError('Please enter complaint number'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await complaintAPI.track({ complaintNumber, mobile });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Complaint not found');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-800 text-white p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-saffron-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold">MS</span>
            </div>
            <h1 className="font-bold text-lg">{t('trackComplaint')}</h1>
          </div>
          <button onClick={() => { const l = i18n.language === 'en' ? 'hi' : 'en'; i18n.changeLanguage(l); localStorage.setItem('language', l); }} className="text-sm bg-primary-700 px-3 py-1 rounded">
            {i18n.language === 'en' ? 'हिन्दी' : 'English'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        <form onSubmit={handleTrack} className="card space-y-4">
          <div>
            <label className="label">{t('complaintNumber')} *</label>
            <input className="input font-mono" placeholder="e.g. MELA2026-2026-000001" value={complaintNumber} onChange={(e) => setComplaintNumber(e.target.value)} />
          </div>
          <div>
            <label className="label">{t('mobile')} (optional)</label>
            <input className="input" type="tel" maxLength={10} placeholder="Registered mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center disabled:opacity-50">
            <FiSearch className="mr-2" /> {loading ? t('loading') : t('trackComplaint')}
          </button>
        </form>

        {error && <div className="card bg-red-50 border-red-200 text-center"><p className="text-red-600">{error}</p></div>}

        {result && (
          <div className="card">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">Complaint Number</p>
              <p className="text-xl font-mono font-bold text-primary-700">{result.complaintNumber}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium text-white ${statusColors[result.status]}`}>
                {result.status}
              </span>
            </div>

            <div className="text-sm space-y-2 mb-4">
              <div className="flex justify-between"><span className="text-gray-500">Category:</span><span className="font-medium">{result.category}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Department:</span><span className="font-medium">{result.department?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Registered:</span><span className="font-medium">{new Date(result.createdAt).toLocaleString()}</span></div>
            </div>

            {result.resolution && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-green-800">Resolution Details</p>
                {result.resolution.remarks && <p className="text-sm text-green-700 mt-1">{result.resolution.remarks}</p>}
              </div>
            )}

            {/* Timeline */}
            <h3 className="font-semibold text-gray-800 mb-3">Status Timeline</h3>
            <div className="space-y-3">
              {(result.statusHistory || []).map((h, i) => {
                const Icon = statusIcons[h.status] || FiClock;
                return (
                  <div key={i} className="flex items-start">
                    <div className={`w-8 h-8 ${statusColors[h.status] || 'bg-gray-400'} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon className="text-white" size={14} />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{h.status.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-500">{new Date(h.changedAt).toLocaleString()}</p>
                      {h.remarks && <p className="text-xs text-gray-600 mt-1">{h.remarks}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center space-y-2">
          <Link to="/complaint/register" className="block text-sm text-primary-600 hover:text-primary-800">Register New Complaint</Link>
          <Link to="/map" className="block text-sm text-primary-600 hover:text-primary-800">View Smart Map</Link>
        </div>
      </div>
    </div>
  );
}

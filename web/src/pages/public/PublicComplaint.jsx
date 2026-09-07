import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { complaintAPI, qrCodeAPI, mastersAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FiAlertCircle, FiCheckCircle, FiMapPin, FiArrowLeft } from 'react-icons/fi';

export default function PublicComplaint() {
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const assetCode = searchParams.get('code');
  const assetId = searchParams.get('asset');

  const [step, setStep] = useState('form'); // form, success
  const [complaintNumber, setComplaintNumber] = useState('');
  const [formData, setFormData] = useState({
    complainant: { name: '', mobile: '', email: '' },
    department: '', category: '', description: '', priority: 'MEDIUM',
    asset: assetId || '', event: '',
  });

  // Fetch asset info if QR code is present
  const { data: assetData } = useQuery({
    queryKey: ['qrAsset', assetCode],
    queryFn: () => qrCodeAPI.scan(assetCode).then(res => res.data.data),
    enabled: !!assetCode,
  });

  // Set event and pre-fill from asset
  useEffect(() => {
    if (assetData) {
      setFormData(prev => ({
        ...prev,
        event: assetData.event?._id || '',
        department: assetData.asset?.department?._id || '',
        asset: assetData.asset?._id || '',
      }));
    }
  }, [assetData]);

  // Fetch departments and categories
  const { data: departments } = useQuery({
    queryKey: ['publicDepts', formData.event],
    queryFn: () => mastersAPI.listDepartments({ event: formData.event }).then(res => res.data.data),
    enabled: !!formData.event,
  });

  const { data: categories } = useQuery({
    queryKey: ['publicCats', formData.event, formData.department],
    queryFn: () => mastersAPI.listCategories({ event: formData.event, department: formData.department }).then(res => res.data.data),
    enabled: !!formData.event && !!formData.department,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.complainant.name || !formData.complainant.mobile || !formData.category || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!/^[0-9]{10}$/.test(formData.complainant.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      const response = await complaintAPI.create(formData);
      setComplaintNumber(response.data.data.complaintNumber);
      setStep('success');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register complaint');
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Complaint Registered!</h2>
          <p className="text-gray-600 mb-4">Your complaint has been submitted successfully.</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Complaint Number</p>
            <p className="text-xl font-mono font-bold text-primary-700">{complaintNumber}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">You will receive an SMS confirmation shortly. You can track your complaint status using this number.</p>
          <div className="space-y-2">
            <Link to={`/complaint/track?number=${complaintNumber}`} className="btn-primary w-full block text-center">Track Complaint</Link>
            <Link to="/map" className="btn-secondary w-full block text-center">View Smart Map</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-800 text-white p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-saffron-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold">MS</span>
            </div>
            <h1 className="font-bold text-lg">{t('registerComplaint')}</h1>
          </div>
          <button onClick={toggleLanguage} className="text-sm bg-primary-700 px-3 py-1 rounded">
            {i18n.language === 'en' ? 'हिन्दी' : 'English'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {/* Asset Info Banner */}
        {assetData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <FiMapPin className="text-blue-600 mr-2" />
              <span className="font-medium text-blue-800">Location Identified</span>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Asset:</strong> {assetData.asset?.assetId}</p>
              {assetData.asset?.poleNumber && <p><strong>Pole #:</strong> {assetData.asset.poleNumber}</p>}
              {assetData.asset?.road && <p><strong>Road:</strong> {assetData.asset.road?.name}</p>}
              {assetData.asset?.sector && <p><strong>Sector:</strong> {assetData.asset.sector?.name}</p>}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label">{t('name')} *</label>
            <input className="input" placeholder="Enter your name" value={formData.complainant.name} onChange={(e) => setFormData({...formData, complainant: {...formData.complainant, name: e.target.value}})} required />
          </div>
          <div>
            <label className="label">{t('mobile')} *</label>
            <input className="input" type="tel" maxLength={10} placeholder="10-digit mobile number" value={formData.complainant.mobile} onChange={(e) => setFormData({...formData, complainant: {...formData.complainant, mobile: e.target.value}})} required />
          </div>
          <div>
            <label className="label">{t('email')} (optional)</label>
            <input className="input" type="email" placeholder="Email address" value={formData.complainant.email} onChange={(e) => setFormData({...formData, complainant: {...formData.complainant, email: e.target.value}})} />
          </div>
          <div>
            <label className="label">{t('department')} *</label>
            <select className="input" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value, category: ''})} required>
              <option value="">Select Department</option>
              {(departments || []).map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          {categories && categories.length > 0 && (
            <div>
              <label className="label">{t('category')} *</label>
              <select className="input" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">{t('priority')}</label>
            <select className="input" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical (Emergency)</option>
            </select>
          </div>
          <div>
            <label className="label">{t('description')} *</label>
            <textarea className="input" rows={4} placeholder="Describe the issue in detail..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
          </div>
          <button type="submit" className="w-full btn-primary py-3 text-lg">{t('submit')} Complaint</button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center">
            <FiArrowLeft className="mr-1" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

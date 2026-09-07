import { useState } from 'react';
import { feedbackAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FiStar, FiCheckCircle } from 'react-icons/fi';

export default function Feedback() {
  const { t, i18n } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '', mobile: '', service: '', rating: 5, comments: '', complaint: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rating) { toast.error('Please select a rating'); return; }
    try {
      await feedbackAPI.create(formData);
      setSubmitted(true);
    } catch (err) {
      toast.error('Failed to submit feedback');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">Your feedback has been submitted successfully. We appreciate your input.</p>
          <a href="/" className="btn-primary">Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-800 text-white p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="font-bold text-lg">{t('feedback')}</h1>
          <button onClick={() => { const l = i18n.language === 'en' ? 'hi' : 'en'; i18n.changeLanguage(l); }} className="text-sm bg-primary-700 px-3 py-1 rounded">
            {i18n.language === 'en' ? 'हिन्दी' : 'English'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label">How would you rate your experience?</label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" onClick={() => setFormData({...formData, rating: star})}>
                  <FiStar size={32} className={star <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Service</label>
            <select className="input" value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})}>
              <option value="">Select Service</option>
              <option value="Electricity">Electricity</option>
              <option value="Water">Water</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Security">Security</option>
              <option value="Medical">Medical</option>
              <option value="Transport">Transport</option>
              <option value="General">General</option>
            </select>
          </div>
          <div>
            <label className="label">Name (optional)</label>
            <input className="input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="label">Mobile (optional)</label>
            <input className="input" type="tel" maxLength={10} value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
          </div>
          <div>
            <label className="label">Complaint Reference (optional)</label>
            <input className="input font-mono" placeholder="Complaint number" value={formData.complaint} onChange={(e) => setFormData({...formData, complaint: e.target.value})} />
          </div>
          <div>
            <label className="label">Comments</label>
            <textarea className="input" rows={4} placeholder="Share your experience..." value={formData.comments} onChange={(e) => setFormData({...formData, comments: e.target.value})} />
          </div>
          <button type="submit" className="w-full btn-primary py-3">Submit Feedback</button>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [formData, setFormData] = useState({
    mobile: '',
    password: '',
  });
  const [loginMethod, setLoginMethod] = useState('mobile'); // 'mobile' or 'email'

  const handleSubmit = async (e) => {
    e.preventDefault();
    const credentials = loginMethod === 'mobile' 
      ? { mobile: formData.mobile, password: formData.password }
      : { email: formData.email, password: formData.password };
    
    const result = await login(credentials);
    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Login failed');
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 to-primary-900 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleLanguage}
          className="text-white bg-primary-700 hover:bg-primary-600 px-4 py-2 rounded-lg text-sm"
        >
          {i18n.language === 'en' ? 'हिन्दी' : 'English'}
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-saffron-500 rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">MS</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{t('appName')}</h1>
          <p className="text-primary-200 mt-2">{t('tagline')}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('login')}</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="flex mb-4 border-b">
              <button
                type="button"
                onClick={() => setLoginMethod('mobile')}
                className={`flex-1 pb-2 text-sm font-medium ${loginMethod === 'mobile' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
              >
                Mobile
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 pb-2 text-sm font-medium ${loginMethod === 'email' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
              >
                Email
              </button>
            </div>

            {loginMethod === 'mobile' ? (
              <div className="mb-4">
                <label className="label">{t('mobile')}</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="Enter 10-digit mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  maxLength={10}
                  required
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="label">{t('email')}</label>
                <input
                  type="email"
                  className="input"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="mb-6">
              <label className="label">{t('password')}</label>
              <input
                type="password"
                className="input"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50"
            >
              {loading ? t('loading') : t('login')}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-sm text-gray-500">
              Demo: Mobile: 9999999999 / Password: Admin@123
            </p>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-6 text-center space-y-2">
          <a href="/complaint/register" className="block text-primary-200 hover:text-white text-sm">
            Register a Complaint →
          </a>
          <a href="/complaint/track" className="block text-primary-200 hover:text-white text-sm">
            Track Complaint →
          </a>
          <a href="/map" className="block text-primary-200 hover:text-white text-sm">
            View Smart Map →
          </a>
        </div>
      </div>
    </div>
  );
}

import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../contexts/AuthContext';
import { useState } from 'react';
import {
  FiHome, FiAlertCircle, FiMap, FiUsers, FiSettings, FiMenu, FiX,
  FiLogOut, FiGrid, FiMapPin, FiBarChart2, FiBox, FiBell
} from 'react-icons/fi';

const navigation = [
  { name: 'dashboard', path: '/dashboard', icon: FiHome },
  { name: 'controlRoom', path: '/control-room', icon: FiGrid },
  { name: 'complaints', path: '/complaints', icon: FiAlertCircle },
  { name: 'assets', path: '/assets', icon: FiMapPin },
  { name: 'assetsMap', path: '/assets/map', icon: FiMap },
  { name: 'facilities', path: '/facilities', icon: FiMapPin },
  { name: 'users', path: '/users', icon: FiUsers },
  { name: 'events', path: '/events', icon: FiSettings },
  { name: 'qrCodes', path: '/qr-codes', icon: FiBox },
  { name: 'reports', path: '/reports', icon: FiBarChart2 },
];

const navLabels = {
  dashboard: 'Dashboard',
  controlRoom: 'Control Room',
  complaints: 'Complaints',
  assets: 'Assets',
  assetsMap: 'Asset Map',
  facilities: 'Facilities',
  users: 'Users',
  events: 'Events',
  qrCodes: 'QR Codes',
  reports: 'Reports',
};

export default function Layout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 bg-primary-900">
          <Link to="/dashboard" className="flex items-center">
            <div className="w-8 h-8 bg-saffron-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MS</span>
            </div>
            <span className="ml-2 text-white font-semibold text-lg">Mela Seva</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white"
          >
            <FiX size={24} />
          </button>
        </div>

        <nav className="mt-5 px-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {navLabels[item.name]}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-primary-200">{user?.role}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={toggleLanguage}
              className="flex-1 py-1.5 px-2 text-xs text-primary-200 hover:text-white bg-primary-700 rounded"
            >
              {i18n.language === 'en' ? 'हिन्दी' : 'English'}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center py-1.5 px-2 text-xs text-primary-200 hover:text-white bg-primary-700 rounded"
            >
              <FiLogOut className="mr-1" size={14} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FiMenu size={24} />
            </button>
            
            <div className="flex-1 ml-4 lg:ml-0">
              <h1 className="text-lg font-semibold text-gray-800">
                {navLabels[navigation.find(n => location.pathname.startsWith(n.path))?.name] || 'Mela Seva'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative text-gray-500 hover:text-gray-700">
                <FiBell size={20} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

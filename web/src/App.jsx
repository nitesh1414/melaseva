import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';
import ControlRoom from './pages/control-room/ControlRoom';
import ComplaintList from './pages/admin/ComplaintList';
import ComplaintDetail from './pages/admin/ComplaintDetail';
import AssetList from './pages/admin/AssetList';
import AssetMap from './pages/admin/AssetMap';
import FacilityList from './pages/admin/FacilityList';
import UserList from './pages/admin/UserList';
import EventManagement from './pages/admin/EventManagement';
import QRCodeManagement from './pages/admin/QRCodeManagement';
import Reports from './pages/admin/Reports';
import PublicComplaint from './pages/public/PublicComplaint';
import PublicMap from './pages/public/PublicMap';
import TrackComplaint from './pages/public/TrackComplaint';
import AssetView from './pages/public/AssetView';
import Feedback from './pages/public/Feedback';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/complaint/register" element={<PublicComplaint />} />
        <Route path="/complaint/track" element={<TrackComplaint />} />
        <Route path="/map" element={<PublicMap />} />
        <Route path="/asset/:code" element={<AssetView />} />
        <Route path="/feedback" element={<Feedback />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="control-room" element={<ControlRoom />} />
          
          {/* Complaint Management */}
          <Route path="complaints" element={<ComplaintList />} />
          <Route path="complaints/:id" element={<ComplaintDetail />} />
          
          {/* Asset Management */}
          <Route path="assets" element={<AssetList />} />
          <Route path="assets/map" element={<AssetMap />} />
          
          {/* Facility Management */}
          <Route path="facilities" element={<FacilityList />} />
          
          {/* User Management */}
          <Route path="users" element={<UserList />} />
          
          {/* Event Management */}
          <Route path="events" element={<EventManagement />} />
          
          {/* QR Code Management */}
          <Route path="qr-codes" element={<QRCodeManagement />} />
          
          {/* Reports */}
          <Route path="reports" element={<Reports />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;

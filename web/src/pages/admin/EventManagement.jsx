import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventAPI } from '../../services/api';
import { useAuthStore } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiCalendar, FiMapPin } from 'react-icons/fi';

export default function EventManagement() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '', code: '', description: '', startDate: '', endDate: '',
    state: '', district: '', status: 'DRAFT',
    location: { address: '', latitude: '', longitude: '' },
    contactInfo: { phone: '', email: '', emergencyNumbers: [] },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventAPI.list().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => eventAPI.create(data),
    onSuccess: () => { toast.success('Event created'); setShowAddModal(false); queryClient.invalidateQueries(['events']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const events = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Event Management</h2>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center"><FiPlus className="mr-2" /> Create Event</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(isLoading ? [] : events).map(e => (
          <div key={e._id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{e.name}</h3>
                <p className="text-sm text-primary-600 font-mono">{e.code}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                e.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                e.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-600'
              }`}>{e.status}</span>
            </div>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <p className="flex items-center"><FiCalendar className="mr-2 text-gray-400" />{new Date(e.startDate).toLocaleDateString()} - {new Date(e.endDate).toLocaleDateString()}</p>
              <p className="flex items-center"><FiMapPin className="mr-2 text-gray-400" />{e.location?.address || `${e.state}, ${e.district}`}</p>
              {e.description && <p className="text-xs text-gray-500 mt-2">{e.description.substring(0, 100)}...</p>}
            </div>
            <div className="mt-4 flex space-x-2">
              <button className="flex-1 btn-secondary text-sm flex items-center justify-center"><FiEdit className="mr-1" /> Edit</button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Create New Event</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Event Name</label><input className="input" value={newEvent.name} onChange={(e) => setNewEvent({...newEvent, name: e.target.value})} required /></div>
                <div><label className="label">Event Code</label><input className="input" value={newEvent.code} onChange={(e) => setNewEvent({...newEvent, code: e.target.value.toUpperCase()})} required /></div>
              </div>
              <div><label className="label">Description</label><textarea className="input" rows={2} value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Start Date</label><input className="input" type="date" value={newEvent.startDate} onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})} required /></div>
                <div><label className="label">End Date</label><input className="input" type="date" value={newEvent.endDate} onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">State</label><input className="input" value={newEvent.state} onChange={(e) => setNewEvent({...newEvent, state: e.target.value})} /></div>
                <div><label className="label">District</label><input className="input" value={newEvent.district} onChange={(e) => setNewEvent({...newEvent, district: e.target.value})} /></div>
              </div>
              <div><label className="label">Address</label><input className="input" value={newEvent.location.address} onChange={(e) => setNewEvent({...newEvent, location: {...newEvent.location, address: e.target.value}})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Latitude</label><input className="input" type="number" step="any" value={newEvent.location.latitude} onChange={(e) => setNewEvent({...newEvent, location: {...newEvent.location, latitude: e.target.value}})} /></div>
                <div><label className="label">Longitude</label><input className="input" type="number" step="any" value={newEvent.location.longitude} onChange={(e) => setNewEvent({...newEvent, location: {...newEvent.location, longitude: e.target.value}})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Contact Phone</label><input className="input" value={newEvent.contactInfo.phone} onChange={(e) => setNewEvent({...newEvent, contactInfo: {...newEvent.contactInfo, phone: e.target.value}})} /></div>
                <div><label className="label">Contact Email</label><input className="input" type="email" value={newEvent.contactInfo.email} onChange={(e) => setNewEvent({...newEvent, contactInfo: {...newEvent.contactInfo, email: e.target.value}})} /></div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={() => createMutation.mutate(newEvent)} disabled={!newEvent.name || !newEvent.code || !newEvent.startDate || !newEvent.endDate} className="btn-primary disabled:opacity-50">Create Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

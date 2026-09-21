import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventAPI } from '../../services/api';
import { useAuthStore } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiCalendar, FiMapPin, FiX } from 'react-icons/fi';

const emptyEvent = {
  name: '', code: '', description: '', startDate: '', endDate: '',
  state: '', district: '', status: 'DRAFT',
  location: { address: '', latitude: '', longitude: '' },
  contactInfo: { phone: '', email: '', emergencyNumbers: [] },
};

export default function EventManagement() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({ ...emptyEvent });

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventAPI.list().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => eventAPI.create(data),
    onSuccess: () => {
      toast.success('Event created');
      closeModal();
      queryClient.invalidateQueries(['events']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create event'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => eventAPI.update(id, data),
    onSuccess: () => {
      toast.success('Event updated');
      closeModal();
      queryClient.invalidateQueries(['events']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update event'),
  });

  const events = data?.data || [];

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({ ...emptyEvent });
    setShowModal(true);
  };

  const openEditModal = (e) => {
    setEditingEvent(e);
    setFormData({
      name: e.name || '',
      code: e.code || '',
      description: e.description || '',
      startDate: e.startDate ? new Date(e.startDate).toISOString().slice(0, 10) : '',
      endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 10) : '',
      state: e.state || '',
      district: e.district || '',
      status: e.status || 'DRAFT',
      location: {
        address: e.location?.address || '',
        latitude: e.location?.latitude?.toString() || '',
        longitude: e.location?.longitude?.toString() || '',
      },
      contactInfo: {
        phone: e.contactInfo?.phone || '',
        email: e.contactInfo?.email || '',
        emergencyNumbers: e.contactInfo?.emergencyNumbers || [],
      },
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code || !formData.startDate || !formData.endDate) {
      toast.error('Name, code, start date and end date are required');
      return;
    }
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Event Management</h2>
        <button onClick={openCreateModal} className="btn-primary flex items-center"><FiPlus className="mr-2" /> Create Event</button>
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
              <p className="flex items-center"><FiMapPin className="mr-2 text-gray-400" />{e.location?.address || `${e.state || ''}, ${e.district || ''}`.replace(/^,\s|,$/g, '') || 'No location'}</p>
              {e.description && <p className="text-xs text-gray-500 mt-2">{e.description.substring(0, 100)}{e.description.length > 100 ? '...' : ''}</p>}
            </div>
            <div className="mt-4 flex space-x-2">
              <button onClick={() => openEditModal(e)} className="flex-1 btn-secondary text-sm flex items-center justify-center">
                <FiEdit className="mr-1" /> Edit
              </button>
            </div>
          </div>
        ))}
        {events.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No events created yet. Click "Create Event" to start.
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Event Name *</label>
                  <input className="input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Kumbh Mela 2026" />
                </div>
                <div>
                  <label className="label">Event Code *</label>
                  <input className="input" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="e.g., KUMBH26" />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Brief description of the event" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date *</label>
                  <input className="input" type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="label">End Date *</label>
                  <input className="input" type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">State</label>
                  <input className="input" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} placeholder="Maharashtra" />
                </div>
                <div>
                  <label className="label">District</label>
                  <input className="input" value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} placeholder="Nagpur" />
                </div>
              </div>
              <div>
                <label className="label">Address</label>
                <input className="input" value={formData.location.address} onChange={(e) => setFormData({...formData, location: {...formData.location, address: e.target.value}})} placeholder="Full address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Latitude</label>
                  <input className="input" type="number" step="any" value={formData.location.latitude} onChange={(e) => setFormData({...formData, location: {...formData.location, latitude: e.target.value}})} placeholder="21.1458" />
                </div>
                <div>
                  <label className="label">Longitude</label>
                  <input className="input" type="number" step="any" value={formData.location.longitude} onChange={(e) => setFormData({...formData, location: {...formData.location, longitude: e.target.value}})} placeholder="79.0882" />
                </div>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Contact Phone</label>
                  <input className="input" value={formData.contactInfo.phone} onChange={(e) => setFormData({...formData, contactInfo: {...formData.contactInfo, phone: e.target.value}})} />
                </div>
                <div>
                  <label className="label">Contact Email</label>
                  <input className="input" type="email" value={formData.contactInfo.email} onChange={(e) => setFormData({...formData, contactInfo: {...formData.contactInfo, email: e.target.value}})} />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={closeModal} className="btn-secondary">Cancel</button>
              <button onClick={handleSubmit}
                disabled={createMutation.isLoading || updateMutation.isLoading || !formData.name || !formData.code || !formData.startDate || !formData.endDate}
                className="btn-primary disabled:opacity-50">
                {(createMutation.isLoading || updateMutation.isLoading) ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facilityAPI } from '../../services/api';
import { useAuthStore } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiEdit, FiTrash2 } from 'react-icons/fi';

export default function FacilityList() {
  const user = useAuthStore((state) => state.user);
  const eventId = user?.event?._id || user?.event;
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({ page: 1, limit: 20, type: '', search: '' });
  const [newFacility, setNewFacility] = useState({ name: '', type: 'HOSPITAL', latitude: '', longitude: '', description: '', contactNumber: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['facilities', eventId, filters],
    queryFn: () => facilityAPI.list({ event: eventId, ...filters }).then(res => res.data),
    enabled: !!eventId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => facilityAPI.create({ ...data, event: eventId }),
    onSuccess: () => { toast.success('Facility created'); setShowAddModal(false); queryClient.invalidateQueries(['facilities', eventId]); },
    onError: () => toast.error('Failed to create facility'),
  });

  const facilities = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Facility Management</h2>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center"><FiPlus className="mr-2" /> Add Facility</button>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search facilities..." className="input pl-10" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} />
          </div>
          <select className="input" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}>
            <option value="">All Types</option>
            {['HOSPITAL', 'POLICE_STATION', 'POLICE_POST', 'TOILET', 'PARKING', 'GHAT', 'SHELTER', 'FIRE_STATION', 'DRINKING_WATER', 'HELP_CENTRE', 'CONTROL_ROOM', 'MEDICAL_CENTRE'].map(t => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(isLoading ? [] : facilities).map(f => (
          <div key={f._id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{f.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{f.type?.replace(/_/g, ' ')}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${f.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{f.status}</span>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              {f.address?.text && <p>{f.address.text}</p>}
              {f.contactNumber && <p className="mt-1">📞 {f.contactNumber}</p>}
              <p className="mt-1 text-xs text-gray-400">📍 {f.location?.coordinates[1]?.toFixed(4)}, {f.location?.coordinates[0]?.toFixed(4)}</p>
            </div>
            <div className="mt-3 flex space-x-2">
              <button className="text-blue-600 hover:text-blue-800"><FiEdit size={16} /></button>
              <button className="text-red-600 hover:text-red-800"><FiTrash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add Facility</h3>
            <div className="space-y-4">
              <div><label className="label">Name</label><input className="input" value={newFacility.name} onChange={(e) => setNewFacility({...newFacility, name: e.target.value})} required /></div>
              <div><label className="label">Type</label>
                <select className="input" value={newFacility.type} onChange={(e) => setNewFacility({...newFacility, type: e.target.value})}>
                  {['HOSPITAL', 'POLICE_STATION', 'POLICE_POST', 'TOILET', 'PARKING', 'GHAT', 'SHELTER', 'FIRE_STATION', 'DRINKING_WATER', 'HELP_CENTRE', 'CONTROL_ROOM', 'MEDICAL_CENTRE'].map(t => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Latitude</label><input className="input" type="number" step="any" value={newFacility.latitude} onChange={(e) => setNewFacility({...newFacility, latitude: e.target.value})} /></div>
                <div><label className="label">Longitude</label><input className="input" type="number" step="any" value={newFacility.longitude} onChange={(e) => setNewFacility({...newFacility, longitude: e.target.value})} /></div>
              </div>
              <div><label className="label">Contact Number</label><input className="input" value={newFacility.contactNumber} onChange={(e) => setNewFacility({...newFacility, contactNumber: e.target.value})} /></div>
              <div><label className="label">Description</label><textarea className="input" rows={2} value={newFacility.description} onChange={(e) => setNewFacility({...newFacility, description: e.target.value})} /></div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={() => createMutation.mutate(newFacility)} disabled={!newFacility.name || !newFacility.latitude || !newFacility.longitude} className="btn-primary disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

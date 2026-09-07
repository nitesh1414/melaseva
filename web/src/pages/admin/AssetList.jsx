import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetAPI, mastersAPI } from '../../services/api';
import { useAuthStore } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiMapPin, FiEdit, FiTrash2, FiUpload } from 'react-icons/fi';

export default function AssetList() {
  const user = useAuthStore((state) => state.user);
  const eventId = user?.event?._id || user?.event;
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '', assetType: '', status: '' });
  const [newAsset, setNewAsset] = useState({
    assetType: 'ELECTRICAL_POLE', assetNumber: '', poleNumber: '',
    latitude: '', longitude: '', description: '', status: 'UNVERIFIED',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['assets', eventId, filters],
    queryFn: () => assetAPI.list({ event: eventId, ...filters }).then(res => res.data),
    enabled: !!eventId,
  });

  const { data: departments } = useQuery({
    queryKey: ['departments', eventId],
    queryFn: () => mastersAPI.listDepartments({ event: eventId }).then(res => res.data.data),
    enabled: !!eventId,
  });

  const { data: sectors } = useQuery({
    queryKey: ['sectors', eventId],
    queryFn: () => mastersAPI.listSectors({ event: eventId }).then(res => res.data.data),
    enabled: !!eventId,
  });

  const { data: roads } = useQuery({
    queryKey: ['roads', eventId],
    queryFn: () => mastersAPI.listRoads({ event: eventId }).then(res => res.data.data),
    enabled: !!eventId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => assetAPI.create({ ...data, event: eventId }),
    onSuccess: () => {
      toast.success('Asset created');
      setShowAddModal(false);
      queryClient.invalidateQueries(['assets', eventId]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create asset'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => assetAPI.delete(id),
    onSuccess: () => {
      toast.success('Asset deleted');
      queryClient.invalidateQueries(['assets', eventId]);
    },
  });

  const assets = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Asset Management</h2>
        <div className="flex space-x-2">
          <button className="btn-secondary flex items-center"><FiUpload className="mr-2" /> Import</button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center">
            <FiPlus className="mr-2" /> Add Asset
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search assets..." className="input pl-10"
              value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} />
          </div>
          <select className="input" value={filters.assetType} onChange={(e) => setFilters({ ...filters, assetType: e.target.value, page: 1 })}>
            <option value="">All Types</option>
            {['ELECTRICAL_POLE', 'STREET_LIGHT', 'DISTRIBUTION_BOX', 'TRANSFORMER', 'WATER_POINT', 'TOILET', 'SHELTER', 'PARKING'].map(t => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
            <option value="">All Status</option>
            {['ACTIVE', 'INACTIVE', 'DAMAGED', 'UNDER_MAINTENANCE', 'VERIFIED', 'UNVERIFIED'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pole #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sector</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Road</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center">Loading...</td></tr>
              ) : assets.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No assets found</td></tr>
              ) : (
                assets.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-mono font-semibold text-primary-700">{a.assetId}</div>
                      <div className="text-xs text-gray-500">{a.assetNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{a.assetType?.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-sm">{a.poleNumber || '-'}</td>
                    <td className="px-4 py-3 text-sm">{a.sector?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm">{a.road?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        a.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        a.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800' :
                        a.status === 'DAMAGED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{a.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{a.qrCode?.code || 'No QR'}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800"><FiEdit size={16} /></button>
                        <button onClick={() => { if (confirm('Delete this asset?')) deleteMutation.mutate(a._id); }}
                          className="text-red-600 hover:text-red-800"><FiTrash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages} ({pagination.total} total)</p>
            <div className="flex space-x-2">
              <button onClick={() => setFilters({ ...filters, page: filters.page - 1 })} disabled={filters.page <= 1} className="btn-secondary text-sm disabled:opacity-50">Previous</button>
              <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })} disabled={filters.page >= pagination.pages} className="btn-secondary text-sm disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Add New Asset</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Asset Type</label>
                <select className="input" value={newAsset.assetType} onChange={(e) => setNewAsset({ ...newAsset, assetType: e.target.value })}>
                  {['ELECTRICAL_POLE', 'STREET_LIGHT', 'DISTRIBUTION_BOX', 'TRANSFORMER', 'WATER_POINT', 'SUBSTATION', 'GENERATOR'].map(t => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Asset Number</label>
                  <input className="input" value={newAsset.assetNumber} onChange={(e) => setNewAsset({ ...newAsset, assetNumber: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Pole Number</label>
                  <input className="input" value={newAsset.poleNumber} onChange={(e) => setNewAsset({ ...newAsset, poleNumber: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Latitude</label>
                  <input className="input" type="number" step="any" value={newAsset.latitude} onChange={(e) => setNewAsset({ ...newAsset, latitude: e.target.value })} placeholder="22.7196" />
                </div>
                <div>
                  <label className="label">Longitude</label>
                  <input className="input" type="number" step="any" value={newAsset.longitude} onChange={(e) => setNewAsset({ ...newAsset, longitude: e.target.value })} placeholder="75.8577" />
                </div>
              </div>
              <div>
                <label className="label">Sector</label>
                <select className="input" value={newAsset.sector} onChange={(e) => setNewAsset({ ...newAsset, sector: e.target.value })}>
                  <option value="">Select Sector</option>
                  {(sectors || []).map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Road</label>
                <select className="input" value={newAsset.road} onChange={(e) => setNewAsset({ ...newAsset, road: e.target.value })}>
                  <option value="">Select Road</option>
                  {(roads || []).map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={newAsset.description} onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={() => createMutation.mutate(newAsset)} disabled={createMutation.isLoading || !newAsset.assetNumber || !newAsset.latitude || !newAsset.longitude} className="btn-primary disabled:opacity-50">
                {createMutation.isLoading ? 'Creating...' : 'Create Asset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

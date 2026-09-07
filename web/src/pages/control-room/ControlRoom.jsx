import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complaintAPI, mastersAPI } from '../../services/api';
import { useAuthStore } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import {
  FiAlertCircle, FiClock, FiCheckCircle, FiUsers, FiMapPin,
  FiPhone, FiMessageSquare, FiArrowRight
} from 'react-icons/fi';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const statusColors = {
  NEW: '#3b82f6', RECEIVED: '#6366f1', VERIFICATION: '#8b5cf6',
  ASSIGNED: '#f59e0b', IN_PROGRESS: '#f97316', RESOLVED: '#10b981',
  CLOSED: '#6b7280', ESCALATED: '#ef4444', REJECTED: '#dc2626',
  REOPENED: '#a855f7', DUPLICATE: '#9ca3af', INVALID: '#9ca3af',
};

export default function ControlRoom() {
  const user = useAuthStore((state) => state.user);
  const eventId = user?.event?._id || user?.event;
  const queryClient = useQueryClient();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignModal, setAssignModal] = useState(false);
  const [assignData, setAssignData] = useState({ assignedTo: '', priority: 'MEDIUM', remarks: '' });
  const [filter, setFilter] = useState({ status: '', department: '' });

  // Fetch complaints
  const { data: complaintsData, isLoading } = useQuery({
    queryKey: ['controlRoom', eventId, filter],
    queryFn: () => complaintAPI.list({
      event: eventId,
      status: filter.status,
      department: filter.department,
      limit: 100,
      sort: '-createdAt',
    }).then(res => res.data),
    enabled: !!eventId,
  });

  // Fetch departments
  const { data: deptsData } = useQuery({
    queryKey: ['departments', eventId],
    queryFn: () => mastersAPI.listDepartments({ event: eventId }).then(res => res.data.data),
    enabled: !!eventId,
  });

  // Fetch users for assignment
  const { data: usersData } = useQuery({
    queryKey: ['officers', eventId],
    queryFn: () => complaintAPI.list({ event: eventId, limit: 1 }).then(() => 
      mastersAPI.listDepartments({ event: eventId }).then(res => res.data.data)
    ),
    enabled: !!eventId,
  });

  // Fetch map data
  const { data: mapData } = useQuery({
    queryKey: ['complaintMap', eventId],
    queryFn: () => complaintAPI.map(eventId).then(res => res.data.data),
    enabled: !!eventId,
    refetchInterval: 10000,
  });

  // Fetch dashboard stats
  const { data: statsData } = useQuery({
    queryKey: ['crStats', eventId],
    queryFn: () => complaintAPI.dashboard(eventId).then(res => res.data.data),
    enabled: !!eventId,
    refetchInterval: 15000,
  });

  // Socket for real-time updates
  useEffect(() => {
    const socket = io('/', { transports: ['websocket', 'polling'] });
    socket.on('connect', () => {
      if (eventId) socket.emit('join_event', eventId);
    });
    socket.on('notification', () => {
      queryClient.invalidateQueries(['controlRoom', eventId]);
      queryClient.invalidateQueries(['crStats', eventId]);
      queryClient.invalidateQueries(['complaintMap', eventId]);
    });
    return () => socket.disconnect();
  }, [eventId, queryClient]);

  // Assign complaint mutation
  const assignMutation = useMutation({
    mutationFn: (data) => complaintAPI.assign(selectedComplaint?._id, data),
    onSuccess: () => {
      toast.success('Complaint assigned successfully');
      setAssignModal(false);
      queryClient.invalidateQueries(['controlRoom', eventId]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Assignment failed'),
  });

  const complaints = complaintsData?.data || [];
  const stats = statsData?.summary || {};

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignData({ assignedTo: '', priority: complaint.priority || 'MEDIUM', remarks: '' });
    setAssignModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {[
          { label: 'Total', value: stats.total, color: 'bg-gray-100 text-gray-800' },
          { label: 'New', value: stats.new, color: 'bg-blue-100 text-blue-800' },
          { label: 'Unassigned', value: stats.unassigned, color: 'bg-purple-100 text-purple-800' },
          { label: 'Assigned', value: stats.assigned, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'In Progress', value: stats.inProgress, color: 'bg-orange-100 text-orange-800' },
          { label: 'Resolved', value: stats.resolved, color: 'bg-green-100 text-green-800' },
          { label: 'Closed', value: stats.closed, color: 'bg-gray-200 text-gray-600' },
          { label: 'Overdue', value: stats.overdue, color: 'bg-red-100 text-red-800' },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-lg p-3 text-center`}>
            <p className="text-xs font-medium">{s.label}</p>
            <p className="text-2xl font-bold">{s.value || 0}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Complaint List */}
        <div className="lg:col-span-1 card overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 250px)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Incoming Complaints</h3>
            <span className="text-sm text-gray-500">{complaints.length} complaints</span>
          </div>
          
          <div className="flex space-x-2 mb-3">
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="input text-sm py-1"
            >
              <option value="">All Status</option>
              <option value="NEW">New</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ESCALATED">Escalated</option>
            </select>
            <select
              value={filter.department}
              onChange={(e) => setFilter({ ...filter, department: e.target.value })}
              className="input text-sm py-1"
            >
              <option value="">All Depts</option>
              {(deptsData || []).map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="overflow-y-auto flex-1 space-y-2">
            {isLoading ? (
              <p className="text-center text-gray-500 py-8">Loading...</p>
            ) : complaints.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No complaints found</p>
            ) : (
              complaints.map((c) => (
                <div
                  key={c._id}
                  onClick={() => setSelectedComplaint(c)}
                  className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                    selectedComplaint?._id === c._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-primary-700">
                      {c.complaintNumber}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: statusColors[c.status] + '20', color: statusColors[c.status] }}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{c.category}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {c.department?.name || 'No dept'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  {c.priority === 'CRITICAL' && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded mt-1 inline-block">
                      CRITICAL
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map and Detail */}
        <div className="lg:col-span-2 space-y-4">
          {/* Map */}
          <div className="card p-0 overflow-hidden" style={{ height: '400px' }}>
            <MapContainer
              center={[22.7196, 75.8577]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {(mapData || []).map((point) => (
                <Marker
                  key={point.id}
                  position={[point.coordinates[1], point.coordinates[0]]}
                  icon={L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background:${statusColors[point.status]};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 3px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [12, 12],
                  })}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>{point.complaintNumber}</strong><br />
                      {point.category}<br />
                      Status: {point.status}<br />
                      Priority: {point.priority}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Complaint Detail */}
          {selectedComplaint && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-primary-700">
                    {selectedComplaint.complaintNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedComplaint.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {!selectedComplaint.assignedTo && (
                    <button
                      onClick={() => openAssignModal(selectedComplaint)}
                      className="btn-primary text-sm flex items-center"
                    >
                      <FiArrowRight className="mr-1" /> Assign
                    </button>
                  )}
                  <a
                    href={`/complaints/${selectedComplaint._id}`}
                    className="btn-secondary text-sm"
                  >
                    View Details
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 font-medium">{selectedComplaint.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">Department:</span>
                  <span className="ml-2 font-medium">{selectedComplaint.department?.name || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Priority:</span>
                  <span className={`ml-2 font-medium ${
                    selectedComplaint.priority === 'CRITICAL' ? 'text-red-600' :
                    selectedComplaint.priority === 'HIGH' ? 'text-orange-600' : ''
                  }`}>{selectedComplaint.priority}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span
                    className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: statusColors[selectedComplaint.status] + '20', color: statusColors[selectedComplaint.status] }}
                  >
                    {selectedComplaint.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Complainant:</span>
                  <span className="ml-2 font-medium">{selectedComplaint.complainant?.name}</span>
                  <span className="ml-2 text-gray-500">{selectedComplaint.complainant?.mobile}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Description:</span>
                  <p className="mt-1">{selectedComplaint.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Assign Complaint</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedComplaint?.complaintNumber} - {selectedComplaint?.category}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="label">Department</label>
                <select
                  className="input"
                  value={assignData.department}
                  onChange={(e) => setAssignData({ ...assignData, department: e.target.value })}
                >
                  <option value="">Select Department</option>
                  {(deptsData || []).map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select
                  className="input"
                  value={assignData.priority}
                  onChange={(e) => setAssignData({ ...assignData, priority: e.target.value })}
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div>
                <label className="label">Assignment Remarks</label>
                <textarea
                  className="input"
                  rows={3}
                  value={assignData.remarks}
                  onChange={(e) => setAssignData({ ...assignData, remarks: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={() => setAssignModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => assignMutation.mutate(assignData)}
                disabled={assignMutation.isLoading}
                className="btn-primary"
              >
                {assignMutation.isLoading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complaintAPI, mastersAPI } from '../../services/api';
import { useAuthStore } from '../../contexts/AuthContext';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { FiArrowLeft, FiClock, FiUser, FiMapPin, FiPhone, FiCheck, FiAlertTriangle } from 'react-icons/fi';

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const eventId = user?.event?._id || user?.event;
  const queryClient = useQueryClient();
  const [statusAction, setStatusAction] = useState('');

  const { data: complaint, isLoading } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => complaintAPI.get(id).then(res => res.data.data),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments', eventId],
    queryFn: () => mastersAPI.listDepartments({ event: eventId }).then(res => res.data.data),
    enabled: !!eventId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data) => complaintAPI.updateStatus(id, data),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries(['complaint', id]);
    },
    onError: () => toast.error('Failed to update status'),
  });

  const assignMutation = useMutation({
    mutationFn: (data) => complaintAPI.assign(id, data),
    onSuccess: () => {
      toast.success('Complaint assigned');
      queryClient.invalidateQueries(['complaint', id]);
    },
    onError: () => toast.error('Failed to assign'),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-primary-600 rounded-full border-t-transparent"></div></div>;
  }

  if (!complaint) {
    return <div className="card text-center py-12"><p className="text-gray-500">Complaint not found</p></div>;
  }

  const c = complaint;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 text-gray-500 hover:text-gray-700">
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-primary-700">{c.complaintNumber}</h2>
            <p className="text-gray-500 text-sm">{new Date(c.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
          c.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
          c.status === 'ASSIGNED' ? 'bg-yellow-100 text-yellow-800' :
          c.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-800' :
          c.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
          c.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
          c.status === 'ESCALATED' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {c.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Complaint Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Category:</span> <span className="font-medium">{c.category}</span></div>
              <div><span className="text-gray-500">Department:</span> <span className="font-medium">{c.department?.name || '-'}</span></div>
              <div><span className="text-gray-500">Priority:</span> <span className={`font-medium ${c.priority === 'CRITICAL' ? 'text-red-600' : ''}`}>{c.priority}</span></div>
              <div><span className="text-gray-500">Source:</span> <span className="font-medium">{c.source}</span></div>
              <div className="col-span-2"><span className="text-gray-500">Description:</span><p className="mt-1">{c.description}</p></div>
            </div>
          </div>

          {/* Complainant Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Complainant Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><FiUser className="inline mr-2 text-gray-400" /><span className="font-medium">{c.complainant?.name}</span></div>
              <div><FiPhone className="inline mr-2 text-gray-400" /><a href={`tel:${c.complainant?.mobile}`} className="text-primary-600 font-medium">{c.complainant?.mobile}</a></div>
              {c.complainant?.email && <div><span className="text-gray-500">Email:</span> <span className="font-medium">{c.complainant.email}</span></div>}
            </div>
          </div>

          {/* Map */}
          {c.location?.coordinates && (
            <div className="card p-0 overflow-hidden" style={{ height: '300px' }}>
              <MapContainer
                center={[c.location.coordinates[1], c.location.coordinates[0]]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[c.location.coordinates[1], c.location.coordinates[0]]}>
                  <Popup>
                    <strong>{c.complaintNumber}</strong><br />{c.category}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          )}

          {/* Status History */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Status History</h3>
            <div className="space-y-3">
              {(c.statusHistory || []).map((h, i) => (
                <div key={i} className="flex items-start">
                  <div className="w-3 h-3 bg-primary-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">{h.status}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(h.changedAt).toLocaleString()}
                      {h.changedBy?.name && ` by ${h.changedBy.name}`}
                    </p>
                    {h.remarks && <p className="text-xs text-gray-600 mt-1">{h.remarks}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution Details */}
          {c.resolution && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-green-700">Resolution Details</h3>
              <div className="text-sm space-y-2">
                {c.resolution.actionTaken && <p><span className="text-gray-500">Action Taken:</span> {c.resolution.actionTaken}</p>}
                {c.resolution.remarks && <p><span className="text-gray-500">Remarks:</span> {c.resolution.remarks}</p>}
                {c.resolution.resolvedAt && <p><span className="text-gray-500">Resolved At:</span> {new Date(c.resolution.resolvedAt).toLocaleString()}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Assignment</h3>
            {c.assignedTo ? (
              <div className="text-sm space-y-2">
                <p><span className="text-gray-500">Assigned To:</span> <span className="font-medium">{c.assignedTo?.name}</span></p>
                <p><span className="text-gray-500">Assigned At:</span> {c.assignedAt ? new Date(c.assignedAt).toLocaleString() : '-'}</p>
                {c.assignedRemarks && <p><span className="text-gray-500">Remarks:</span> {c.assignedRemarks}</p>}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Not yet assigned</p>
            )}
          </div>

          {/* SLA Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FiClock className="mr-2" /> SLA Information
            </h3>
            <div className="text-sm space-y-2">
              {c.sla?.deadline && (
                <>
                  <p><span className="text-gray-500">Deadline:</span> {new Date(c.sla.deadline).toLocaleString()}</p>
                  <p><span className="text-gray-500">Hours:</span> {c.sla.hours}</p>
                  {c.sla.breached && <p className="text-red-600 font-medium"><FiAlertTriangle className="inline mr-1" /> SLA Breached</p>}
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-2">
              {c.status === 'NEW' && (
                <>
                  <button onClick={() => updateStatusMutation.mutate({ status: 'RECEIVED' })} className="w-full btn-primary text-sm">
                    Mark as Received
                  </button>
                  <button onClick={() => updateStatusMutation.mutate({ status: 'REJECTED', remarks: 'Rejected' })} className="w-full btn-danger text-sm">
                    Reject
                  </button>
                </>
              )}
              {c.status === 'ASSIGNED' && (
                <button onClick={() => updateStatusMutation.mutate({ status: 'IN_PROGRESS' })} className="w-full btn-primary text-sm">
                  Start Work
                </button>
              )}
              {c.status === 'IN_PROGRESS' && (
                <button onClick={() => updateStatusMutation.mutate({ status: 'RESOLVED', remarks: 'Resolved' })} className="w-full btn-success text-sm">
                  Mark Resolved
                </button>
              )}
              {c.status === 'RESOLVED' && (
                <>
                  <button onClick={() => updateStatusMutation.mutate({ status: 'CLOSED', remarks: 'Verified and closed' })} className="w-full btn-success text-sm flex items-center justify-center">
                    <FiCheck className="mr-1" /> Approve & Close
                  </button>
                  <button onClick={() => updateStatusMutation.mutate({ status: 'REOPENED', remarks: 'Resolution not satisfactory' })} className="w-full btn-danger text-sm">
                    Reopen
                  </button>
                </>
              )}
              {['NEW', 'ASSIGNED'].includes(c.status) && (
                <button onClick={() => updateStatusMutation.mutate({ status: 'ESCALATED', remarks: 'Escalated' })} className="w-full bg-red-100 text-red-700 hover:bg-red-200 font-medium py-2 px-4 rounded-lg text-sm">
                  Escalate
                </button>
              )}
            </div>
          </div>

          {/* Attachments */}
          {c.attachments?.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Attachments</h3>
              <div className="grid grid-cols-2 gap-2">
                {c.attachments.map((a, i) => (
                  <a key={i} href={a.url} target="_blank" rel="noopener noreferrer">
                    <img src={a.url} alt="Attachment" className="w-full h-24 object-cover rounded-lg" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, mastersAPI } from '../../services/api';
import { useAuthStore } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiKey, FiX } from 'react-icons/fi';

const ROLES = ['SUPER_ADMIN','EVENT_ADMIN','CONTROL_ROOM_OPERATOR','DEPARTMENT_ADMIN','DEPARTMENT_OFFICER','FIELD_STAFF','SURVEYOR','MIS_EXECUTIVE'];

export default function UserList() {
  const user = useAuthStore((state) => state.user);
  const eventId = user?.event?._id || user?.event;
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '', role: '', department: '' });
  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', password: 'Mela@123', role: 'FIELD_STAFF', department: '', employeeId: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['users', eventId, filters],
    queryFn: () => userAPI.list({ event: eventId, ...filters }).then(res => res.data),
    enabled: !!eventId,
  });

  const { data: departments } = useQuery({
    queryKey: ['departments', eventId],
    queryFn: () => mastersAPI.listDepartments({ event: eventId }).then(res => res.data.data),
    enabled: !!eventId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => userAPI.create({ ...data, event: eventId }),
    onSuccess: () => {
      toast.success('User created successfully');
      closeModal();
      queryClient.invalidateQueries(['users', eventId]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userAPI.update(id, data),
    onSuccess: () => {
      toast.success('User updated successfully');
      closeModal();
      queryClient.invalidateQueries(['users', eventId]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update user'),
  });

  const resetPwMutation = useMutation({
    mutationFn: (id) => userAPI.resetPassword(id, { password: 'Mela@123' }),
    onSuccess: () => toast.success('Password reset to Mela@123'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => userAPI.delete(id),
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries(['users', eventId]);
    },
  });

  const users = data?.data || [];
  const pagination = data?.pagination || {};

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: '', mobile: '', email: '', password: 'Mela@123', role: 'FIELD_STAFF', department: '', employeeId: '' });
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name || '',
      mobile: u.mobile || '',
      email: u.email || '',
      password: '',
      role: u.role || 'FIELD_STAFF',
      department: u.department?._id || u.department || '',
      employeeId: u.employeeId || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.mobile) {
      toast.error('Name and mobile are required');
      return;
    }
    if (!editingUser && !/^[\d]{10}$/.test(formData.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (editingUser) {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      updateMutation.mutate({ id: editingUser._id, data: updateData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">User Management</h2>
        <button onClick={openCreateModal} className="btn-primary flex items-center"><FiPlus className="mr-2" /> Add User</button>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search users..." className="input pl-10" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} />
          </div>
          <select className="input" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}>
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
          </select>
          <select className="input" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value, page: 1 })}>
            <option value="">All Departments</option>
            {(departments || []).map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <div className="text-sm text-gray-500 flex items-center">
            Total: {pagination.total || users.length} users
          </div>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? <tr><td colSpan={7} className="px-4 py-8 text-center">Loading...</td></tr> :
              users.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No users found</td></tr> :
              users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.employeeId || '-'}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{u.mobile}</td>
                  <td className="px-4 py-3 text-sm">{u.email || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800">
                      {u.role?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{u.department?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button onClick={() => openEditModal(u)} className="text-blue-600 hover:text-blue-800" title="Edit"><FiEdit size={16} /></button>
                      <button onClick={() => { if (confirm('Reset password to Mela@123?')) resetPwMutation.mutate(u._id); }} className="text-yellow-600 hover:text-yellow-800" title="Reset Password"><FiKey size={16} /></button>
                      <button onClick={() => { if (confirm('Delete this user?')) deleteMutation.mutate(u._id); }} className="text-red-600 hover:text-red-800" title="Delete"><FiTrash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex space-x-2">
              <button onClick={() => setFilters({ ...filters, page: filters.page - 1 })} disabled={filters.page <= 1} className="btn-secondary text-sm disabled:opacity-50">Prev</button>
              <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })} disabled={filters.page >= pagination.pages} className="btn-secondary text-sm disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Name *</label>
                <input className="input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Full name" />
              </div>
              <div>
                <label className="label">Mobile *</label>
                <input className="input" type="tel" maxLength={10} value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})} placeholder="10-digit mobile" />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Email address" />
              </div>
              <div>
                <label className="label">Employee ID</label>
                <input className="input" value={formData.employeeId} onChange={(e) => setFormData({...formData, employeeId: e.target.value})} placeholder="Employee ID" />
              </div>
              <div>
                <label className="label">Role *</label>
                <select className="input" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Department *</label>
                <select className="input" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                  <option value="">Select Department</option>
                  {(departments || []).map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">{editingUser ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                <input className="input" type="text" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder={editingUser ? 'Leave blank to keep current' : 'Default: Mela@123'} />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={closeModal} className="btn-secondary">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isLoading || updateMutation.isLoading || !formData.name || !formData.mobile}
                className="btn-primary disabled:opacity-50"
              >
                {(createMutation.isLoading || updateMutation.isLoading) ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

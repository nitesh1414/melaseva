import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { complaintAPI, mastersAPI } from '../../services/api';
import { useAuthStore } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiDownload, FiCalendar } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Reports() {
  const user = useAuthStore((state) => state.user);
  const eventId = user?.event?._id || user?.event;
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [reportType, setReportType] = useState('complaint');

  const params = {};
  if (dateRange.startDate) params.startDate = dateRange.startDate;
  if (dateRange.endDate) params.endDate = dateRange.endDate;

  const { data: statsData } = useQuery({
    queryKey: ['reportStats', eventId, params],
    queryFn: () => complaintAPI.dashboard(eventId, params).then(res => res.data.data),
    enabled: !!eventId,
  });

  const { data: departments } = useQuery({
    queryKey: ['departments', eventId],
    queryFn: () => mastersAPI.listDepartments({ event: eventId }).then(res => res.data.data),
    enabled: !!eventId,
  });

  const stats = statsData?.summary || {};
  const deptStats = statsData?.departmentStats || [];

  const handleExport = (format) => {
    toast.success(`Exporting ${reportType} report as ${format.toUpperCase()}...`);
    // In production, this would trigger a backend export endpoint
    const exportData = {
      summary: stats,
      departments: deptStats,
      reportType,
      dateRange,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mela-seva-report-${reportType}-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Reports & MIS</h2>
        <div className="flex space-x-2">
          <button onClick={() => handleExport('json')} className="btn-secondary flex items-center"><FiDownload className="mr-2" /> Export Data</button>
          <button onClick={() => { window.print(); }} className="btn-primary flex items-center"><FiDownload className="mr-2" /> Print</button>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Report Type</label>
            <select className="input" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="complaint">Complaint Report</option>
              <option value="department">Department Report</option>
              <option value="asset">Asset Report</option>
              <option value="sla">SLA Report</option>
              <option value="officer">Officer Performance</option>
            </select>
          </div>
          <div>
            <label className="label">Start Date</label>
            <input type="date" className="input" value={dateRange.startDate} onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})} />
          </div>
          <div>
            <label className="label">End Date</label>
            <input type="date" className="input" value={dateRange.endDate} onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})} />
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full flex items-center justify-center" onClick={() => toast.success('Report generated')}>
              <FiCalendar className="mr-2" /> Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500">Total Complaints</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total || 0}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Resolution Rate</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{statsData?.resolutionPercentage || 0}%</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Avg Resolution Time</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{statsData?.resolutionTime?.avgHours?.toFixed(1) || 0}h</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdue || 0}</p>
        </div>
      </div>

      {/* Department-wise Table */}
      {deptStats.length > 0 && (
        <div className="card overflow-hidden p-0">
          <h3 className="text-lg font-semibold p-4 pb-2">Department-wise Summary</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Resolved</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Overdue</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deptStats.map((d, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-sm font-medium">{d.department?.name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-sm text-center">{d.total}</td>
                  <td className="px-4 py-3 text-sm text-center text-green-600">{d.resolved}</td>
                  <td className="px-4 py-3 text-sm text-center text-red-600">{d.overdue}</td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="font-medium">{d.total > 0 ? ((d.resolved / d.total) * 100).toFixed(0) : 0}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Department-wise Statistics</h3>
          {deptStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptStats.map(d => ({ name: d.department?.name || 'Unknown', total: d.total, resolved: d.resolved, overdue: d.overdue }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={11} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#3b82f6" name="Total" />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                <Bar dataKey="overdue" fill="#ef4444" name="Overdue" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          {stats.total > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={[
                  { name: 'New', value: stats.new || 0 },
                  { name: 'Assigned', value: stats.assigned || 0 },
                  { name: 'In Progress', value: stats.inProgress || 0 },
                  { name: 'Resolved', value: stats.resolved || 0 },
                  { name: 'Closed', value: stats.closed || 0 },
                ].filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {[0,1,2,3,4].map(i => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

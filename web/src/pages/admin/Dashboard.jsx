import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { complaintAPI } from '../../services/api';
import { useAuthStore } from '../../contexts/AuthContext';
import {
  FiAlertCircle, FiCheckCircle, FiClock, FiTrendingUp,
  FiUsers, FiMapPin, FiActivity
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const eventId = user?.event?._id || user?.event;
  const [dateRange, setDateRange] = useState('today');

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['dashboard', eventId, dateRange],
    queryFn: () => complaintAPI.dashboard(eventId, { period: dateRange }).then(res => res.data.data),
    enabled: !!eventId,
  });

  const stats = statsData?.summary || {};
  const deptStats = statsData?.departmentStats || [];
  const resolutionTime = statsData?.resolutionTime || {};
  const resolutionPercentage = statsData?.resolutionPercentage || 0;

  const kpiCards = [
    { label: 'Total Complaints', value: stats.total || 0, icon: FiAlertCircle, color: 'bg-blue-500', link: '/complaints' },
    { label: 'New', value: stats.new || 0, icon: FiClock, color: 'bg-blue-400', link: '/complaints?status=NEW' },
    { label: 'Assigned', value: stats.assigned || 0, icon: FiUsers, color: 'bg-yellow-500', link: '/complaints?status=ASSIGNED' },
    { label: 'In Progress', value: stats.inProgress || 0, icon: FiActivity, color: 'bg-orange-500', link: '/complaints?status=IN_PROGRESS' },
    { label: 'Resolved', value: stats.resolved || 0, icon: FiCheckCircle, color: 'bg-green-500', link: '/complaints?status=RESOLVED' },
    { label: 'Closed', value: stats.closed || 0, icon: FiCheckCircle, color: 'bg-gray-500', link: '/complaints?status=CLOSED' },
    { label: 'Overdue', value: stats.overdue || 0, icon: FiAlertCircle, color: 'bg-red-500', link: '/complaints?overdue=true' },
    { label: 'Unassigned', value: stats.unassigned || 0, icon: FiUsers, color: 'bg-purple-500', link: '/complaints?unassigned=true' },
  ];

  const pieData = [
    { name: 'New', value: stats.new || 0 },
    { name: 'Assigned', value: stats.assigned || 0 },
    { name: 'In Progress', value: stats.inProgress || 0 },
    { name: 'Resolved', value: stats.resolved || 0 },
    { name: 'Closed', value: stats.closed || 0 },
  ].filter(d => d.value > 0);

  const hourlyData = statsData?.hourlyTrend?.map(h => ({
    hour: `${h._id}:00`,
    complaints: h.count,
  })) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Executive Dashboard</h2>
          <p className="text-gray-600 mt-1">Real-time overview of Mela Seva operations</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input w-auto"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <Link to="/control-room" className="btn-primary">
            Open Control Room
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={idx} to={card.link} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {card.value.toLocaleString()}
                  </p>
                </div>
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-wise chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Department-wise Complaints</h3>
          {deptStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptStats.map(d => ({
                name: d.department?.name || 'Unknown',
                total: d.total,
                resolved: d.resolved,
                overdue: d.overdue,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
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

        {/* Status distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
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

      {/* Hourly Trend & Resolution Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Hourly Complaint Trend</h3>
          {hourlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="complaints" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resolution Stats</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Resolution Rate</p>
              <div className="flex items-center mt-1">
                <span className="text-3xl font-bold text-green-600">{resolutionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${resolutionPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">Avg Resolution Time</p>
              <p className="text-xl font-semibold text-gray-800">
                {resolutionTime.avgHours?.toFixed(1) || 0} hours
              </p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">Fastest Resolution</p>
              <p className="text-xl font-semibold text-green-600">
                {resolutionTime.minHours?.toFixed(1) || 0} hours
              </p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">Slowest Resolution</p>
              <p className="text-xl font-semibold text-red-600">
                {resolutionTime.maxHours?.toFixed(1) || 0} hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

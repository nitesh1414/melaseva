import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { AuthContext } from '../../../App';
import { complaintAPI } from '../../services/api';

export default function OfficerDashboard({ navigation }) {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({});

  const loadComplaints = async () => {
    try {
      const res = await complaintAPI.list({ assignedTo: user._id, limit: 50 });
      setComplaints(res.data.data || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    }
  };

  const loadStats = async () => {
    try {
      const eventId = user?.event?._id || user?.event;
      if (eventId) {
        const res = await complaintAPI.dashboard(eventId);
        setStats(res.data.data?.summary || {});
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  useEffect(() => {
    loadComplaints();
    loadStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadComplaints(), loadStats()]);
    setRefreshing(false);
  };

  const statusColors = {
    ASSIGNED: '#f59e0b', IN_PROGRESS: '#f97316', NEW: '#3b82f6', RESOLVED: '#10b981',
  };

  const renderComplaint = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ComplaintDetail', { complaintId: item._id })}>
      <View style={styles.cardHeader}>
        <Text style={styles.complaintNumber}>{item.complaintNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: (statusColors[item.status] || '#6b7280') + '20' }]}>
          <Text style={[styles.statusText, { color: statusColors[item.status] || '#6b7280' }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        <Text style={[styles.priority, { color: item.priority === 'CRITICAL' ? '#ef4444' : item.priority === 'HIGH' ? '#f97316' : '#6b7280' }]}>{item.priority}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total || 0}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{stats.assigned || 0}</Text>
          <Text style={styles.statLabel}>Assigned</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#f97316' }]}>{stats.inProgress || 0}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#10b981' }]}>{stats.resolved || 0}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>My Assigned Complaints</Text>
      <FlatList
        data={complaints}
        keyExtractor={(item) => item._id}
        renderItem={renderComplaint}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No complaints assigned</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  statsRow: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  statCard: { flex: 1, alignItems: 'center', padding: 8 },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#374151' },
  statLabel: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', padding: 16, paddingBottom: 8 },
  list: { padding: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  complaintNumber: { fontSize: 14, fontWeight: '700', color: '#1d4ed8', fontFamily: 'monospace' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '600' },
  category: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 },
  description: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 11, color: '#9ca3af' },
  priority: { fontSize: 11, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});

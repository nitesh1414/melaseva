import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

const statusColors = {
  NEW: '#3b82f6',
  RECEIVED: '#8b5cf6',
  ASSIGNED: '#f59e0b',
  IN_PROGRESS: '#f97316',
  RESOLVED: '#22c55e',
  CLOSED: '#6b7280',
  REJECTED: '#ef4444',
};

export default function OfficerDashboard({ navigation, route }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('assigned'); // assigned, resolved

  const fetchComplaints = useCallback(async () => {
    try {
      const status = filter === 'assigned' ? 'ASSIGNED' : 'RESOLVED';
      const response = await api.get(`/complaints?status=${status}&limit=50`);
      if (response.data.success) {
        setComplaints(response.data.data);
      }
    } catch (error) {
      console.log('Error fetching complaints:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [fetchComplaints])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  const renderComplaint = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ComplaintDetail', { complaint: item })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.complaintId}>#{item.complaintId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] || '#6b7280' }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.category} numberOfLines={1}>{item.category}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.cardFooter}>
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={14} color="#64748b" />
          <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.meta}>
          <Ionicons name="alert-circle-outline" size={14} color="#64748b" />
          <Text style={styles.metaText}>{item.priority}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'assigned' && styles.filterBtnActive]}
          onPress={() => setFilter('assigned')}
        >
          <Text style={[styles.filterText, filter === 'assigned' && styles.filterTextActive]}>Assigned</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'resolved' && styles.filterBtnActive]}
          onPress={() => setFilter('resolved')}
        >
          <Text style={[styles.filterText, filter === 'resolved' && styles.filterTextActive]}>Resolved</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={complaints}
        keyExtractor={(item) => item._id}
        renderItem={renderComplaint}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>No complaints found</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.mapButton}
        onPress={() => navigation.navigate('SmartMap')}
      >
        <Ionicons name="map" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterRow: { flexDirection: 'row', padding: 12, gap: 8 },
  filterBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center',
  },
  filterBtnActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  filterText: { color: '#64748b', fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  list: { padding: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  complaintId: { fontSize: 14, fontWeight: 'bold', color: '#1d4ed8' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  category: { fontSize: 14, color: '#475569', fontWeight: '600', marginBottom: 4 },
  description: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', gap: 16 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#64748b' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#94a3b8', marginTop: 12, fontSize: 16 },
  mapButton: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#1d4ed8', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
  },
});

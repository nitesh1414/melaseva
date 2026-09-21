import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const statusColors = {
  NEW: '#3b82f6', RECEIVED: '#8b5cf6', VERIFICATION: '#06b6d4',
  ASSIGNED: '#f59e0b', IN_PROGRESS: '#f97316', RESOLVED: '#22c55e',
  CLOSED: '#6b7280', REJECTED: '#ef4444',
};

const statusSteps = ['NEW', 'RECEIVED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function TrackComplaintScreen() {
  const [trackingId, setTrackingId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      Alert.alert('Error', 'Please enter complaint ID');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const response = await api.get(`/complaints/track/${trackingId.trim()}`);
      if (response.data.success) {
        setComplaint(response.data.data);
      } else {
        setComplaint(null);
      }
    } catch (error) {
      setComplaint(null);
      if (error.response?.status !== 404) {
        Alert.alert('Error', 'Failed to fetch complaint status');
      }
    } finally {
      setLoading(false);
    }
  };

  const getProgressIndex = () => {
    if (!complaint) return -1;
    return statusSteps.indexOf(complaint.status);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.searchSection}>
        <Text style={styles.searchTitle}>Track Your Complaint</Text>
        <Text style={styles.searchDesc}>Enter your complaint ID to check its current status</Text>
        
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Enter Complaint ID (e.g., CMP-001)"
            value={trackingId}
            onChangeText={setTrackingId}
            autoCapitalize="characters"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <TouchableOpacity
          style={[styles.trackBtn, loading && styles.disabledBtn]}
          onPress={handleTrack}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.trackBtnText}>Track Complaint</Text>
          )}
        </TouchableOpacity>
      </View>

      {searched && !loading && !complaint && (
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color="#f59e0b" />
          <Text style={styles.notFoundTitle}>Complaint Not Found</Text>
          <Text style={styles.notFoundText}>
            No complaint found with ID "{trackingId}". Please check the ID and try again.
          </Text>
        </View>
      )}

      {complaint && (
        <View style={styles.resultSection}>
          {/* Header */}
          <View style={styles.resultHeader}>
            <Text style={styles.resultId}>#{complaint.complaintId}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors[complaint.status] || '#6b7280' }]}>
              <Text style={styles.statusText}>{complaint.status}</Text>
            </View>
          </View>

          {/* Category & Description */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCategory}>{complaint.category}</Text>
            <Text style={styles.infoDesc}>{complaint.description}</Text>
            <Text style={styles.infoDate}>
              Registered: {new Date(complaint.createdAt).toLocaleDateString()} {new Date(complaint.createdAt).toLocaleTimeString()}
            </Text>
          </View>

          {/* Progress Tracker */}
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Status Progress</Text>
            {statusSteps.map((step, index) => {
              const isActive = index <= getProgressIndex();
              const isCurrent = index === getProgressIndex();
              return (
                <View key={step} style={styles.progressStep}>
                  <View style={[styles.progressDot, isActive && styles.progressDotActive, isCurrent && styles.progressDotCurrent]} />
                  <View style={styles.progressContent}>
                    <Text style={[styles.progressLabel, isActive && styles.progressLabelActive]}>{step.replace('_', ' ')}</Text>
                    {isCurrent && (
                      <Text style={styles.progressCurrent}>← Current</Text>
                    )}
                  </View>
                  {index < statusSteps.length - 1 && (
                    <View style={[styles.progressLine, isActive && styles.progressLineActive]} />
                  )}
                </View>
              );
            })}
          </View>

          {/* Resolution notes */}
          {complaint.resolutionNotes && (
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Resolution Notes</Text>
              <Text style={styles.resolutionText}>{complaint.resolutionNotes}</Text>
              {complaint.resolvedAt && (
                <Text style={styles.resolvedDate}>
                  Resolved: {new Date(complaint.resolvedAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 12 },
  searchSection: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 12 },
  searchTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  searchDesc: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8fafc', borderRadius: 10, borderWidth: 1,
    borderColor: '#e2e8f0', paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#1e293b' },
  trackBtn: {
    backgroundColor: '#1d4ed8', borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', marginTop: 12,
  },
  trackBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.7 },
  notFound: {
    backgroundColor: '#fff', borderRadius: 12, padding: 32, alignItems: 'center',
  },
  notFoundTitle: { fontSize: 18, fontWeight: 'bold', color: '#92400e', marginTop: 12 },
  notFoundText: { fontSize: 14, color: '#92400e', textAlign: 'center', marginTop: 8 },
  resultSection: {},
  resultHeader: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  resultId: { fontSize: 18, fontWeight: 'bold', color: '#1d4ed8' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  infoCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
  },
  infoCardTitle: { fontSize: 14, fontWeight: 'bold', color: '#475569', marginBottom: 8 },
  infoCategory: { fontSize: 16, fontWeight: '600', color: '#475569', marginBottom: 4 },
  infoDesc: { fontSize: 14, color: '#64748b', lineHeight: 22 },
  infoDate: { fontSize: 12, color: '#94a3b8', marginTop: 8 },
  progressSection: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
  },
  progressTitle: { fontSize: 14, fontWeight: 'bold', color: '#475569', marginBottom: 16 },
  progressStep: { flexDirection: 'row', alignItems: 'flex-start', position: 'relative' },
  progressDot: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 2, borderColor: '#e2e8f0', backgroundColor: '#f8fafc',
    marginTop: 2,
  },
  progressDotActive: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  progressDotCurrent: { borderWidth: 3, borderColor: '#1d4ed8', backgroundColor: '#1d4ed8' },
  progressContent: { marginLeft: 12, flex: 1, paddingBottom: 20 },
  progressLabel: { fontSize: 14, color: '#94a3b8' },
  progressLabelActive: { color: '#1e293b', fontWeight: '600' },
  progressCurrent: { fontSize: 12, color: '#1d4ed8', fontWeight: '600', marginTop: 2 },
  progressLine: {
    position: 'absolute', left: 7, top: 20, width: 2, height: 32,
    backgroundColor: '#e2e8f0',
  },
  progressLineActive: { backgroundColor: '#22c55e' },
  resolutionText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  resolvedDate: { fontSize: 12, color: '#22c55e', marginTop: 8, fontWeight: '600' },
});

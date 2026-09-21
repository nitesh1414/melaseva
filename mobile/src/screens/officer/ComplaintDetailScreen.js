import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Linking, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const statusColors = {
  NEW: '#3b82f6', RECEIVED: '#8b5cf6', ASSIGNED: '#f59e0b',
  IN_PROGRESS: '#f97316', RESOLVED: '#22c55e', CLOSED: '#6b7280',
  REJECTED: '#ef4444', VERIFIED: '#06b6d4',
};

export default function ComplaintDetailScreen({ route, navigation }) {
  const { complaint } = route.params;
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus) => {
    Alert.alert(
      'Confirm',
      `Change status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await api.put(`/complaints/${complaint._id}/status`, {
                status: newStatus,
              });
              if (response.data.success) {
                Alert.alert('Success', `Complaint status updated to ${newStatus}`);
                navigation.goBack();
              }
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const openMap = () => {
    if (complaint.location?.coordinates) {
      const [lng, lat] = complaint.location.coordinates;
      const url = `https://maps.google.com/maps?q=${lat},${lng}`;
      Linking.openURL(url);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.idRow}>
          <Text style={styles.complaintId}>#{complaint.complaintId}</Text>
          <View style={[styles.badge, { backgroundColor: statusColors[complaint.status] }]}>
            <Text style={styles.badgeText}>{complaint.status}</Text>
          </View>
        </View>
        <Text style={styles.category}>{complaint.category}</Text>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{complaint.description}</Text>
      </View>

      {/* Reporter Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reporter Information</Text>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={16} color="#64748b" />
          <Text style={styles.infoText}>{complaint.reporterName || 'Anonymous'}</Text>
        </View>
        {complaint.reporterMobile && (
          <View style={styles.infoRow}>
            <Ionicons name="call" size={16} color="#64748b" />
            <Text style={styles.infoText}>{complaint.reporterMobile}</Text>
          </View>
        )}
      </View>

      {/* Location */}
      {complaint.location?.coordinates && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity style={styles.mapLink} onPress={openMap}>
            <Ionicons name="location" size={16} color="#1d4ed8" />
            <Text style={styles.mapLinkText}>Open in Google Maps</Text>
          </TouchableOpacity>
          <Text style={styles.coords}>
            Lat: {complaint.location.coordinates[1]?.toFixed(6)}, Lng: {complaint.location.coordinates[0]?.toFixed(6)}
          </Text>
        </View>
      )}

      {/* Images */}
      {complaint.images && complaint.images.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {complaint.images.map((img, index) => (
              <Image key={index} source={{ uri: img }} style={styles.image} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Timeline */}
      {complaint.timeline && complaint.timeline.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          {complaint.timeline.map((event, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineText}>{event.action}</Text>
                <Text style={styles.timelineTime}>
                  {new Date(event.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {complaint.status === 'ASSIGNED' && (
          <>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#f59e0b' }]}
              onPress={() => updateStatus('IN_PROGRESS')}
              disabled={loading}
            >
              <Text style={styles.actionBtnText}>Start Work</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
              onPress={() => updateStatus('REJECTED')}
              disabled={loading}
            >
              <Text style={styles.actionBtnText}>Reject</Text>
            </TouchableOpacity>
          </>
        )}
        {complaint.status === 'IN_PROGRESS' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#1d4ed8', flex: 1 }]}
            onPress={() => navigation.navigate('ResolveComplaint', { complaint })}
          >
            <Text style={styles.actionBtnText}>Resolve</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  idRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  complaintId: { fontSize: 18, fontWeight: 'bold', color: '#1d4ed8' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  category: { fontSize: 16, color: '#475569', fontWeight: '600' },
  section: { backgroundColor: '#fff', marginHorizontal: 12, marginTop: 12, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#475569', marginBottom: 8 },
  description: { fontSize: 14, color: '#64748b', lineHeight: 22 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  infoText: { fontSize: 14, color: '#475569' },
  mapLink: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  mapLinkText: { fontSize: 14, color: '#1d4ed8', fontWeight: '600' },
  coords: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  image: { width: 150, height: 150, borderRadius: 8, marginRight: 8 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, paddingLeft: 8 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1d4ed8', marginTop: 6 },
  timelineContent: { marginLeft: 12 },
  timelineText: { fontSize: 14, color: '#475569' },
  timelineTime: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  actions: { flexDirection: 'row', padding: 16, gap: 12, marginTop: 12 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

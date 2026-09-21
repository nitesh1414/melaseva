import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function AssetInfoScreen({ route, navigation }) {
  const { asset } = route.params || {};
  const [assetData, setAssetData] = useState(asset);
  const [loading, setLoading] = useState(!asset);

  useEffect(() => {
    if (!assetData?._id && asset?.qrData?.assetId) {
      fetchAsset(asset.qrData.assetId);
    } else if (assetData?._id && !assetData.name) {
      fetchAsset(assetData._id);
    }
  }, []);

  const fetchAsset = async (id) => {
    try {
      const response = await api.get(`/assets/${id}`);
      if (response.data.success) {
        setAssetData(response.data.data);
      }
    } catch (error) {
      console.log('Error fetching asset:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  if (!assetData) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle" size={48} color="#f59e0b" />
        <Text style={styles.notFound}>Asset not found</Text>
      </View>
    );
  }

  const openMap = () => {
    if (assetData.location?.coordinates) {
      const [lng, lat] = assetData.location.coordinates;
      Linking.openURL(`https://maps.google.com/maps?q=${lat},${lng}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="cube" size={40} color="#1d4ed8" />
        </View>
        <Text style={styles.assetName}>{assetData.name || assetData.assetType}</Text>
        <Text style={styles.assetType}>{assetData.assetType}</Text>
        <View style={[styles.statusBadge, { backgroundColor: assetData.status === 'ACTIVE' ? '#22c55e' : '#f59e0b' }]}>
          <Text style={styles.statusText}>{assetData.status || 'ACTIVE'}</Text>
        </View>
      </View>

      {assetData.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionText}>{assetData.description}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Asset Details</Text>
        <View style={styles.detailRow}>
          <Ionicons name="barcode" size={16} color="#64748b" />
          <Text style={styles.detailLabel}>Asset ID:</Text>
          <Text style={styles.detailValue}>{assetData.assetId || assetData._id}</Text>
        </View>
        {assetData.department && (
          <View style={styles.detailRow}>
            <Ionicons name="business" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Department:</Text>
            <Text style={styles.detailValue}>{assetData.department?.name || assetData.department}</Text>
          </View>
        )}
        {assetData.zone && (
          <View style={styles.detailRow}>
            <Ionicons name="grid" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Zone:</Text>
            <Text style={styles.detailValue}>{assetData.zone}</Text>
          </View>
        )}
        {assetData.installationDate && (
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Installed:</Text>
            <Text style={styles.detailValue}>{new Date(assetData.installationDate).toLocaleDateString()}</Text>
          </View>
        )}
      </View>

      {assetData.location?.coordinates && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity style={styles.mapBtn} onPress={openMap}>
            <Ionicons name="navigate" size={18} color="#1d4ed8" />
            <Text style={styles.mapBtnText}>Open in Google Maps</Text>
          </TouchableOpacity>
          <Text style={styles.coords}>
            {assetData.location.coordinates[1]?.toFixed(6)}, {assetData.location.coordinates[0]?.toFixed(6)}
          </Text>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Register', { assetId: assetData._id })}
        >
          <Ionicons name="alert-circle" size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Report Issue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { fontSize: 16, color: '#64748b', marginTop: 12 },
  header: {
    backgroundColor: '#fff', padding: 24, alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  iconBox: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#eff6ff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  assetName: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  assetType: { fontSize: 14, color: '#64748b', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  section: { backgroundColor: '#fff', marginHorizontal: 12, marginTop: 12, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#475569', marginBottom: 12 },
  sectionText: { fontSize: 14, color: '#64748b', lineHeight: 22 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  detailLabel: { fontSize: 14, color: '#64748b', width: 90 },
  detailValue: { fontSize: 14, color: '#1e293b', flex: 1 },
  mapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#eff6ff', padding: 12, borderRadius: 8,
  },
  mapBtnText: { fontSize: 14, color: '#1d4ed8', fontWeight: '600' },
  coords: { fontSize: 12, color: '#94a3b8', marginTop: 8 },
  actions: { padding: 16 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#dc2626', paddingVertical: 14, borderRadius: 12,
  },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

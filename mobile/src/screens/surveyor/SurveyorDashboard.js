import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

export default function SurveyorDashboard({ navigation }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssets = useCallback(async () => {
    try {
      const response = await api.get('/assets?limit=50');
      if (response.data.success) {
        setAssets(response.data.data);
      }
    } catch (error) {
      console.log('Error fetching assets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAssets();
    }, [fetchAssets])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssets();
  };

  const renderAsset = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AssetInfo', { asset: item })}
    >
      <View style={styles.cardHeader}>
        <Ionicons name="cube" size={24} color="#1d4ed8" />
        <View style={[styles.badge, { backgroundColor: item.status === 'ACTIVE' ? '#22c55e' : '#f59e0b' }]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.assetName} numberOfLines={1}>{item.name || item.assetType}</Text>
      <Text style={styles.assetType}>{item.assetType}</Text>
      {item.description && (
        <Text style={styles.assetDesc} numberOfLines={2}>{item.description}</Text>
      )}
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
      <FlatList
        data={assets}
        keyExtractor={(item) => item._id}
        renderItem={renderAsset}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>No assets found</Text>
          </View>
        }
      />

      {/* FAB buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: '#f97316' }]}
          onPress={() => navigation.navigate('ScanQR')}
        >
          <Ionicons name="qr-code" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: '#1d4ed8' }]}
          onPress={() => navigation.navigate('AddAsset')}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  assetName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  assetType: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  assetDesc: { fontSize: 13, color: '#94a3b8' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#94a3b8', marginTop: 12, fontSize: 16 },
  fabContainer: { position: 'absolute', bottom: 24, right: 24, gap: 12 },
  fab: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
  },
});

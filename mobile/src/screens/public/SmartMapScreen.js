import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  FlatList, Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const FACILITY_ICONS = {
  TOILET: '🚻',
  WATER: '💧',
  MEDICAL: '🏥',
  FOOD: '🍽️',
  PARKING: '🅿️',
  INFORMATION: 'ℹ️',
  EMERGENCY: '🚨',
  OTHER: '📍',
};

const FACILITY_COLORS = {
  TOILET: '#3b82f6',
  WATER: '#06b6d4',
  MEDICAL: '#ef4444',
  FOOD: '#f97316',
  PARKING: '#6b7280',
  INFORMATION: '#8b5cf6',
  EMERGENCY: '#dc2626',
  OTHER: '#64748b',
};

export default function SmartMapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [mapRegion, setMapRegion] = useState(null);

  const facilityTypes = ['ALL', 'TOILET', 'WATER', 'MEDICAL', 'FOOD', 'PARKING', 'EMERGENCY'];

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setLocation(loc.coords);
      setMapRegion(region);
      return region;
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  const fetchFacilities = useCallback(async (region) => {
    try {
      const params = {};
      if (region) {
        params.nearLatitude = region.latitude;
        params.nearLongitude = region.longitude;
        params.radius = 5000; // 5km
      }
      const response = await api.get('/facilities/map/all', { params });
      if (response.data.success) {
        setFacilities(response.data.data || []);
      }
    } catch (error) {
      console.log('Error fetching facilities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const region = await getUserLocation();
      await fetchFacilities(region);
    };
    init();
  }, []);

  const filteredFacilities = filter === 'ALL'
    ? facilities
    : facilities.filter(f => f.type === filter);

  if (loading && !mapRegion) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1d4ed8" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {mapRegion && (
        <MapView
          style={styles.map}
          initialRegion={mapRegion}
          showsUserLocation
          showsMyLocationButton
        >
          {filteredFacilities.map((facility) => {
            if (!facility.location?.coordinates) return null;
            const [lng, lat] = facility.location.coordinates;
            return (
              <Marker
                key={facility._id}
                coordinate={{ latitude: lat, longitude: lng }}
                title={facility.name}
                description={facility.type}
              >
                <View style={[styles.marker, { backgroundColor: FACILITY_COLORS[facility.type] || '#64748b' }]}>
                  <Text style={styles.markerEmoji}>{FACILITY_ICONS[facility.type] || '📍'}</Text>
                </View>
              </Marker>
            );
          })}
        </MapView>
      )}

      {/* Filter chips */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={facilityTypes}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, filter === item && styles.filterChipActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
                {FACILITY_ICONS[item] || '📍'} {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Facility count */}
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{filteredFacilities.length} facilities nearby</Text>
      </View>
    </View>
  );
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  map: { flex: 1 },
  loadingText: { marginTop: 12, color: '#64748b', fontSize: 14 },
  filterContainer: {
    position: 'absolute', top: 12, left: 0, right: 0,
  },
  filterList: { paddingHorizontal: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0',
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  filterText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  countBadge: {
    position: 'absolute', bottom: 24, alignSelf: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  countText: { fontSize: 14, color: '#475569', fontWeight: '600' },
  marker: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  markerEmoji: { fontSize: 16 },
});

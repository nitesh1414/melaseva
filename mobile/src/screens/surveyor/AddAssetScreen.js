import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import api from '../../services/api';

const ASSET_TYPES = [
  'Light Pole', 'Water Tap', 'Toilet', 'Medical Post',
  'Emergency Station', 'Sign Board', 'Gate/Entry', 'Parking',
  'Food Stall', 'Generator', 'Other',
];

export default function AddAssetScreen({ navigation }) {
  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState('Light Pole');
  const [description, setDescription] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const getCurrentLocation = async () => {
    setFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Location permission is needed to tag the asset.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({
        type: 'Point',
        coordinates: [loc.coords.longitude, loc.coords.latitude],
        address: `${loc.coords.latitude.toFixed(6)}, ${loc.coords.longitude.toFixed(6)}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setFetchingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter asset name');
      return;
    }
    if (!location) {
      Alert.alert('Error', 'Please capture the asset location');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/assets', {
        name,
        assetType,
        description,
        qrCode: qrCode || undefined,
        location,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Asset added successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Asset Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Light Pole #42"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Asset Type *</Text>
        <View style={styles.typeGrid}>
          {ASSET_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.typeChip, assetType === type && styles.typeChipActive]}
              onPress={() => setAssetType(type)}
            >
              <Text style={[styles.typeText, assetType === type && styles.typeTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Additional details about the asset..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>QR Code (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Scan or enter QR code"
          value={qrCode}
          onChangeText={setQrCode}
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Location *</Text>
        {location ? (
          <View style={styles.locationBox}>
            <Ionicons name="location" size={20} color="#22c55e" />
            <Text style={styles.locationText}>{location.address}</Text>
          </View>
        ) : (
          <Text style={styles.locationHint}>No location captured yet</Text>
        )}
        <TouchableOpacity
          style={styles.locationBtn}
          onPress={getCurrentLocation}
          disabled={fetchingLocation}
        >
          {fetchingLocation ? (
            <ActivityIndicator color="#1d4ed8" />
          ) : (
            <>
              <Ionicons name="navigate" size={18} color="#1d4ed8" />
              <Text style={styles.locationBtnText}>
                {location ? 'Update Location' : 'Capture Current Location'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.disabledBtn]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Add Asset</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 12 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: {
    backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1,
    borderColor: '#e2e8f0', padding: 12, fontSize: 14, color: '#1e293b',
  },
  textArea: { minHeight: 80 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc',
  },
  typeChipActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  typeText: { fontSize: 13, color: '#64748b' },
  typeTextActive: { color: '#fff', fontWeight: '600' },
  locationBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f0fdf4', padding: 12, borderRadius: 8, marginBottom: 8,
  },
  locationText: { fontSize: 13, color: '#166534', flex: 1 },
  locationHint: { fontSize: 13, color: '#94a3b8', marginBottom: 8 },
  locationBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: 8,
    borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#eff6ff',
  },
  locationBtnText: { fontSize: 14, color: '#1d4ed8', fontWeight: '600' },
  submitBtn: {
    backgroundColor: '#1d4ed8', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 8, marginBottom: 24,
  },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.7 },
});

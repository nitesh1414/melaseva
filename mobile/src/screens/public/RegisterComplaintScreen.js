import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

const CATEGORIES = [
  'Street Light Issue', 'Water Supply', 'Sanitation/Cleanliness',
  'Road Damage', 'Sign Board Missing', 'Garbage Overflow',
  'Electricity Issue', 'Security Concern', 'Other',
];

export default function RegisterComplaintScreen({ route, navigation }) {
  const { assetId, qrData } = route?.params || {};
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterMobile, setReporterMobile] = useState('');
  const [location, setLocation] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  useEffect(() => {
    if (assetId) {
      // Auto-fetch location from asset
      fetchAssetLocation();
    }
  }, [assetId]);

  const fetchAssetLocation = async () => {
    try {
      const response = await api.get(`/assets/${assetId}`);
      if (response.data.success && response.data.data.location) {
        setLocation(response.data.data.location);
      }
    } catch (e) {
      console.log('Error fetching asset location:', e);
    }
  };

  const getCurrentLocation = async () => {
    setFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Location permission is needed.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({
        type: 'Point',
        coordinates: [loc.coords.longitude, loc.coords.latitude],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setFetchingLocation(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission required to attach photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7, allowsMultipleSelection: true, selectionLimit: 3,
    });
    if (!result.canceled) {
      setImages([...images, ...result.assets.map(a => a.uri)]);
    }
  };

  const handleSubmit = async () => {
    if (!category) { Alert.alert('Error', 'Please select a category'); return; }
    if (!description.trim()) { Alert.alert('Error', 'Please describe the issue'); return; }
    if (!location) { Alert.alert('Error', 'Please provide the location'); return; }

    setLoading(true);
    try {
      const response = await api.post('/complaints', {
        category,
        description,
        reporterName: reporterName || undefined,
        reporterMobile: reporterMobile || undefined,
        location,
        relatedAsset: assetId || undefined,
        images,
      });

      if (response.data.success) {
        const complaintId = response.data.data?.complaintId || response.data.data?._id;
        Alert.alert(
          'Complaint Registered!',
          `Your complaint has been registered.\nID: ${complaintId}\n\nYou can track its status in the Track section.`,
          [{ text: 'OK', onPress: () => {
            // Reset form
            setCategory(''); setDescription(''); setReporterName('');
            setReporterMobile(''); setImages([]);
            navigation.navigate('Track');
          }}]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to register complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, category === cat && styles.catChipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe the issue in detail..."
          value={description}
          onChangeText={setDescription}
          multiline numberOfLines={4} textAlignVertical="top"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Your Name (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={reporterName}
          onChangeText={setReporterName}
          placeholderTextColor="#94a3b8"
        />
        <Text style={[styles.label, { marginTop: 12 }]}>Mobile (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Mobile number"
          value={reporterMobile}
          onChangeText={setReporterMobile}
          keyboardType="phone-pad" maxLength={10}
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Location *</Text>
        {location ? (
          <View style={styles.locationBox}>
            <Ionicons name="location" size={18} color="#22c55e" />
            <Text style={styles.locationText}>
              {location.coordinates[1]?.toFixed(5)}, {location.coordinates[0]?.toFixed(5)}
            </Text>
          </View>
        ) : null}
        <TouchableOpacity style={styles.locationBtn} onPress={getCurrentLocation} disabled={fetchingLocation}>
          {fetchingLocation ? (
            <ActivityIndicator color="#1d4ed8" />
          ) : (
            <>
              <Ionicons name="navigate" size={18} color="#1d4ed8" />
              <Text style={styles.locationBtnText}>{location ? 'Update Location' : 'Get Current Location'}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Photos (optional)</Text>
        <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
          <Ionicons name="images" size={20} color="#1d4ed8" />
          <Text style={styles.photoBtnText}>Attach Photos ({images.length}/3)</Text>
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
          <Text style={styles.submitBtnText}>Submit Complaint</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 12 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc',
  },
  catChipActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  catText: { fontSize: 12, color: '#64748b' },
  catTextActive: { color: '#fff', fontWeight: '600' },
  input: {
    backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1,
    borderColor: '#e2e8f0', padding: 12, fontSize: 14, color: '#1e293b',
  },
  textArea: {
    backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1,
    borderColor: '#e2e8f0', padding: 12, fontSize: 14,
    color: '#1e293b', minHeight: 100,
  },
  locationBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f0fdf4', padding: 10, borderRadius: 8, marginBottom: 8,
  },
  locationText: { fontSize: 13, color: '#166534' },
  locationBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 8,
    borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#eff6ff',
  },
  locationBtnText: { fontSize: 14, color: '#1d4ed8', fontWeight: '600' },
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 8,
    borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc',
  },
  photoBtnText: { fontSize: 14, color: '#1d4ed8', fontWeight: '600' },
  submitBtn: {
    backgroundColor: '#1d4ed8', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 8, marginBottom: 24,
  },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.7 },
});

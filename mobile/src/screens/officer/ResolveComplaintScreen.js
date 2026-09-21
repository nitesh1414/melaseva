import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

export default function ResolveComplaintScreen({ route, navigation }) {
  const { complaint } = route.params;
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera roll permission is needed to attach photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 4,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map(a => a.uri)]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera permission is needed to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      Alert.alert('Error', 'Please provide resolution notes');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/complaints/${complaint._id}/resolve`, {
        resolutionNotes,
        resolvedImages: images,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Complaint resolved successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to resolve complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Complaint #{complaint.complaintId}</Text>
        <Text style={styles.complaintDesc}>{complaint.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Resolution Notes *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Describe what was done to resolve this complaint..."
          value={resolutionNotes}
          onChangeText={setResolutionNotes}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Attach Photos (optional)</Text>
        <View style={styles.photoActions}>
          <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color="#1d4ed8" />
            <Text style={styles.photoBtnText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
            <Ionicons name="images" size={24} color="#1d4ed8" />
            <Text style={styles.photoBtnText}>Gallery</Text>
          </TouchableOpacity>
        </View>
        {images.length > 0 && (
          <View style={styles.imageRow}>
            {images.map((img, index) => (
              <View key={index} style={styles.imageContainer}>
                <Text style={styles.imagePreview}>📷 Photo {index + 1}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.resolveBtn, loading && styles.disabledBtn]}
        onPress={handleResolve}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.resolveBtnText}>Mark as Resolved</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 12 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1d4ed8', marginBottom: 8 },
  complaintDesc: { fontSize: 14, color: '#64748b', lineHeight: 22 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  textInput: {
    backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1,
    borderColor: '#e2e8f0', padding: 12, fontSize: 14,
    color: '#1e293b', minHeight: 120,
  },
  photoActions: { flexDirection: 'row', gap: 12 },
  photoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 8,
    borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc',
  },
  photoBtnText: { fontSize: 14, color: '#1d4ed8', fontWeight: '600' },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  imageContainer: { width: 80, height: 80, backgroundColor: '#f1f5f9', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  imagePreview: { fontSize: 10, color: '#64748b' },
  resolveBtn: {
    backgroundColor: '#22c55e', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
  },
  resolveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.7 },
});

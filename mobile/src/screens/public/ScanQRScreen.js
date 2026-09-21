import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Alert, TouchableOpacity, Linking,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

export default function ScanQRScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastScan, setLastScan] = useState(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned && lastScan === data) return;
    setScanned(true);
    setLastScan(data);

    try {
      // Try to parse as JSON (our QR format)
      const parsed = JSON.parse(data);
      if (parsed.assetId || parsed.id) {
        navigation.navigate('AssetInfo', {
          asset: { _id: parsed.assetId || parsed.id, qrData: parsed },
        });
        return;
      }
    } catch (e) {
      // Not JSON — treat as URL or plain text
    }

    // Check if it's a URL
    if (data.startsWith('http')) {
      Linking.openURL(data);
      return;
    }

    // Plain QR text
    Alert.alert(
      'QR Code Scanned',
      data,
      [
        { text: 'Register Complaint', onPress: () => {
          navigation.navigate('Register', { qrData: data });
        }},
        { text: 'Scan Again', onPress: () => {
          setScanned(false);
          setLastScan(null);
        }},
      ]
    );
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera" size={48} color="#94a3b8" />
        <Text style={styles.title}>Camera Permission Required</Text>
        <Text style={styles.text}>We need camera access to scan QR codes on assets.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.scanText}>Point camera at QR code on asset</Text>
        </View>
      </CameraView>

      {scanned && (
        <TouchableOpacity style={styles.rescanBtn} onPress={() => {
          setScanned(false);
          setLastScan(null);
        }}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.rescanText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f8fafc' },
  camera: { flex: 1 },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  scanFrame: {
    width: 250, height: 250, position: 'relative',
  },
  corner: {
    position: 'absolute', width: 30, height: 30,
    borderColor: '#fff', borderWidth: 3,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanText: { color: '#fff', fontSize: 16, marginTop: 24, textAlign: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginTop: 16 },
  text: { fontSize: 14, color: '#64748b', marginTop: 8, textAlign: 'center' },
  button: {
    backgroundColor: '#1d4ed8', paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 8, marginTop: 24,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  rescanBtn: {
    position: 'absolute', bottom: 40, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1d4ed8', paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 24,
  },
  rescanText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

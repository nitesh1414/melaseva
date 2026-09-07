import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const menuItems = [
    { title: 'Scan QR Code', icon: 'qr-code-outline', screen: 'ScanQR', color: '#3b82f6' },
    { title: 'Register Complaint', icon: 'alert-circle-outline', screen: 'RegisterComplaint', color: '#ef4444' },
    { title: 'Track Complaint', icon: 'search-outline', screen: 'TrackComplaint', color: '#10b981' },
    { title: 'Smart Map', icon: 'map-outline', screen: 'SmartMap', color: '#8b5cf6' },
    { title: 'Nearby Facilities', icon: 'location-outline', screen: 'SmartMap', color: '#f59e0b' },
    { title: 'Feedback', icon: 'chatbubble-outline', screen: 'Home', color: '#06b6d4' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>MS</Text>
        </View>
        <Text style={styles.title}>Mela Seva</Text>
        <Text style={styles.subtitle}>Public Event Services</Text>
      </View>

      <View style={styles.grid}>
        {menuItems.map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.card} onPress={() => navigation.navigate(item.screen)}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={32} color={item.color} />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Staff Login →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { backgroundColor: '#1d4ed8', padding: 40, alignItems: 'center', paddingTop: 60 },
  logo: { width: 64, height: 64, backgroundColor: '#f97316', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: '#bfdbfe', fontSize: 14, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  iconContainer: { width: 60, height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#374151', textAlign: 'center' },
  loginButton: { padding: 16, alignItems: 'center', margin: 16 },
  loginText: { color: '#1d4ed8', fontSize: 14, fontWeight: '500' },
});

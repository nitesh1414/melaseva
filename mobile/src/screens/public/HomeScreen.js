import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const quickActions = [
    { icon: 'qr-code', title: 'Scan QR Code', desc: 'View asset info or register complaint', screen: 'Scan QR', color: '#1d4ed8' },
    { icon: 'map', title: 'Smart Map', desc: 'Find nearby facilities', screen: 'Map', color: '#059669' },
    { icon: 'clipboard', title: 'Register Complaint', desc: 'Report an issue', screen: 'Register', color: '#dc2626' },
    { icon: 'search', title: 'Track Complaint', desc: 'Check status of your complaint', screen: 'Track', color: '#7c3aed' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Ionicons name="location" size={48} color="#fff" />
        <Text style={styles.heroTitle}>Mela Seva</Text>
        <Text style={styles.heroSubtitle}>Smart Asset & Complaint Management for Public Events</Text>
      </View>

      <View style={styles.actionsGrid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionCard}
            onPress={() => navigation.navigate(action.screen)}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
              <Ionicons name={action.icon} size={28} color={action.color} />
            </View>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionDesc}>{action.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>About Mela Seva</Text>
        <Text style={styles.infoText}>
          Mela Seva is a geo-tagged asset and complaint management system for large public events. 
          Citizens can scan QR codes on infrastructure to view details, report issues, and track 
          complaint resolution. Officials use the system to manage complaints efficiently with 
          real-time location tracking.
        </Text>
      </View>

      <View style={styles.helpSection}>
        <Ionicons name="information-circle" size={20} color="#64748b" />
        <Text style={styles.helpText}>
          No login required! Simply scan a QR code on any asset or use the features above.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  hero: {
    backgroundColor: '#1d4ed8', padding: 32, alignItems: 'center',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  heroSubtitle: { fontSize: 14, color: '#bfdbfe', textAlign: 'center', marginTop: 8 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  actionCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  actionIcon: {
    width: 48, height: 48, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  actionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  actionDesc: { fontSize: 12, color: '#64748b' },
  infoSection: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#64748b', lineHeight: 22 },
  helpSection: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 24,
    backgroundColor: '#f0f9ff', borderRadius: 12, padding: 12,
  },
  helpText: { flex: 1, fontSize: 13, color: '#475569' },
});

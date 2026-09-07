import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ResolveComplaintScreen({ route, navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ResolveComplaintScreen</Text>
      <Text style={styles.subtitle}>This screen is under development</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280' },
});

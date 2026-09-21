import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function LoginScreen({ onLogin }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const handleLogin = async () => {
    if (!mobile.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter mobile number and password');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { mobile, password });
      
      if (response.data.success) {
        const { accessToken } = response.data.data;
        const user = response.data.data.user;
        await onLogin(accessToken, user);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="location" size={60} color="#1d4ed8" />
          </View>
          <Text style={styles.title}>Mela Seva</Text>
          <Text style={styles.subtitle}>Smart Asset & Complaint Management</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="phone-portrait" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              maxLength={10}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureText}
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeIcon}>
              <Ionicons name={secureText ? 'eye-off' : 'eye'} size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          For public use, just open the app — no login required.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  logoContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  form: { gap: 16 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: '#1e293b' },
  eyeIcon: { padding: 8 },
  loginButton: {
    backgroundColor: '#1d4ed8', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  disabledButton: { opacity: 0.7 },
  footerText: { textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 24 },
});

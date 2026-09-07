import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../../App';
import { authAPI } from '../../services/api';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!mobile || !password) {
      Alert.alert('Error', 'Please enter mobile number and password');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login({ mobile, password });
      const { user, accessToken } = res.data.data;
      await login(user, accessToken);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>MS</Text>
        </View>
        <Text style={styles.title}>Mela Seva</Text>
        <Text style={styles.subtitle}>Field Staff Application</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Mobile Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter 10-digit mobile"
          keyboardType="phone-pad"
          maxLength={10}
          value={mobile}
          onChangeText={setMobile}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.publicButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.publicButtonText}>Continue as Public User →</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>Demo: 9999999999 / Admin@123</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1d4ed8', justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 64, height: 64, backgroundColor: '#f97316', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: '#bfdbfe', fontSize: 14, marginTop: 4 },
  form: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16 },
  button: { backgroundColor: '#1d4ed8', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  publicButton: { padding: 14, alignItems: 'center', marginTop: 12 },
  publicButtonText: { color: '#1d4ed8', fontSize: 14 },
  hint: { textAlign: 'center', color: '#9ca3af', fontSize: 12, marginTop: 12 },
});

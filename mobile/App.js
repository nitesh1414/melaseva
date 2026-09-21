import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './src/screens/auth/LoginScreen';
import OfficerDashboard from './src/screens/officer/OfficerDashboard';
import ComplaintDetailScreen from './src/screens/officer/ComplaintDetailScreen';
import ResolveComplaintScreen from './src/screens/officer/ResolveComplaintScreen';
import SurveyorDashboard from './src/screens/surveyor/SurveyorDashboard';
import AddAssetScreen from './src/screens/surveyor/AddAssetScreen';
import PublicHomeScreen from './src/screens/public/HomeScreen';
import ScanQRScreen from './src/screens/public/ScanQRScreen';
import SmartMapScreen from './src/screens/public/SmartMapScreen';
import AssetInfoScreen from './src/screens/public/AssetInfoScreen';
import RegisterComplaintScreen from './src/screens/public/RegisterComplaintScreen';
import TrackComplaintScreen from './src/screens/public/TrackComplaintScreen';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const theme = {
  colors: {
    primary: '#1d4ed8',
    background: '#f8fafc',
    card: '#ffffff',
    text: '#1e293b',
    border: '#e2e8f0',
    notification: '#ef4444',
  },
};

// Public navigation (bottom tabs)
function PublicNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Scan QR') iconName = focused ? 'qr-code' : 'qr-code-outline';
          else if (route.name === 'Map') iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'Register') iconName = focused ? 'clipboard' : 'clipboard-outline';
          else if (route.name === 'Track') iconName = focused ? 'search' : 'search-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1d4ed8',
        tabBarInactiveTintColor: '#94a3b8',
        headerStyle: { backgroundColor: '#1d4ed8' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Home" component={PublicHomeScreen} options={{ title: 'Mela Seva' }} />
      <Tab.Screen name="Scan QR" component={ScanQRScreen} options={{ title: 'Scan QR' }} />
      <Tab.Screen name="Map" component={SmartMapScreen} options={{ title: 'Smart Map' }} />
      <Tab.Screen name="Register" component={RegisterComplaintScreen} options={{ title: 'Complaint' }} />
      <Tab.Screen name="Track" component={TrackComplaintScreen} options={{ title: 'Track' }} />
    </Tab.Navigator>
  );
}

// Authenticated Officer navigation
function OfficerNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1d4ed8' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="OfficerDashboard" component={OfficerDashboard} options={{ title: 'Officer Dashboard' }} />
      <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} options={{ title: 'Complaint Details' }} />
      <Stack.Screen name="ResolveComplaint" component={ResolveComplaintScreen} options={{ title: 'Resolve Complaint' }} />
      <Stack.Screen name="SmartMap" component={SmartMapScreen} options={{ title: 'Smart Map' }} />
    </Stack.Navigator>
  );
}

// Authenticated Surveyor navigation
function SurveyorNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1d4ed8' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="SurveyorDashboard" component={SurveyorDashboard} options={{ title: 'Surveyor Dashboard' }} />
      <Stack.Screen name="AddAsset" component={AddAssetScreen} options={{ title: 'Add New Asset' }} />
      <Stack.Screen name="ScanQR" component={ScanQRScreen} options={{ title: 'Scan QR Code' }} />
      <Stack.Screen name="AssetInfo" component={AssetInfoScreen} options={{ title: 'Asset Details' }} />
      <Stack.Screen name="SmartMap" component={SmartMapScreen} options={{ title: 'Smart Map' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);

  const loadStoredData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const user = await AsyncStorage.getItem('userData');
      if (token && user) {
        setUserToken(token);
        setUserData(JSON.parse(user));
      }
    } catch (e) {
      console.log('Error loading stored data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredData();
  }, [loadStoredData]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  const handleLogin = async (token, user) => {
    setUserToken(token);
    setUserData(user);
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));
  };

  const handleLogout = async () => {
    setUserToken(null);
    setUserData(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!userToken ? (
            <Stack.Screen name="Auth">
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
          ) : userData?.role === 'FIELD_OFFICER' || userData?.role === 'VERIFICATION_OFFICER' ? (
            <Stack.Screen name="Officer">
              {(props) => <OfficerNavigator {...props} screenOptions={{ headerRight: () => null }} />}
            </Stack.Screen>
          ) : userData?.role === 'SURVEYOR' ? (
            <Stack.Screen name="Surveyor">
              {(props) => <SurveyorNavigator {...props} />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Public" component={PublicNavigator} />
          )}
          {/* Shared screens accessible from all contexts */}
          <Stack.Screen name="AssetInfo" component={AssetInfoScreen} options={{ headerShown: true, title: 'Asset Details', headerStyle: { backgroundColor: '#1d4ed8' }, headerTintColor: '#fff' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});

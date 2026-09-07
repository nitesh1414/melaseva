import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';

// Public Screens
import HomeScreen from './src/screens/public/HomeScreen';
import ScanQRScreen from './src/screens/public/ScanQRScreen';
import AssetInfoScreen from './src/screens/public/AssetInfoScreen';
import RegisterComplaintScreen from './src/screens/public/RegisterComplaintScreen';
import SmartMapScreen from './src/screens/public/SmartMapScreen';
import TrackComplaintScreen from './src/screens/public/TrackComplaintScreen';

// Officer Screens
import OfficerDashboard from './src/screens/officer/OfficerDashboard';
import ComplaintDetailScreen from './src/screens/officer/ComplaintDetailScreen';
import ResolveComplaintScreen from './src/screens/officer/ResolveComplaintScreen';

// Surveyor Screens
import SurveyorDashboard from './src/screens/surveyor/SurveyorDashboard';
import AddAssetScreen from './src/screens/surveyor/AddAssetScreen';

// Auth Context
export const AuthContext = React.createContext();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function OfficerTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={OfficerDashboard} />
      <Tab.Screen name="Scan QR" component={ScanQRScreen} />
      <Tab.Screen name="Map" component={SmartMapScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [authState, setAuthState] = useState({
    isLoading: true,
    token: null,
    user: null,
  });

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const userStr = await AsyncStorage.getItem('user');
        if (token && userStr) {
          setAuthState({ isLoading: false, token, user: JSON.parse(userStr) });
        } else {
          setAuthState({ isLoading: false, token: null, user: null });
        }
      } catch (e) {
        setAuthState({ isLoading: false, token: null, user: null });
      }
    };
    loadAuth();
  }, []);

  const login = async (userData, token) => {
    await AsyncStorage.setItem('accessToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setAuthState({ isLoading: false, token, user: userData });
  };

  const logout = async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('user');
    setAuthState({ isLoading: false, token: null, user: null });
  };

  if (authState.isLoading) {
    return null; // Could show a splash screen here
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1d4ed8' }, headerTintColor: '#fff' }}>
          {!authState.token ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ScanQR" component={ScanQRScreen} options={{ title: 'Scan QR Code' }} />
              <Stack.Screen name="AssetInfo" component={AssetInfoScreen} options={{ title: 'Asset Information' }} />
              <Stack.Screen name="RegisterComplaint" component={RegisterComplaintScreen} options={{ title: 'Register Complaint' }} />
              <Stack.Screen name="SmartMap" component={SmartMapScreen} options={{ title: 'Smart Map' }} />
              <Stack.Screen name="TrackComplaint" component={TrackComplaintScreen} options={{ title: 'Track Complaint' }} />
            </>
          ) : (
            <>
              <Stack.Screen name="Main" component={OfficerTabs} options={{ headerShown: false }} />
              <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} options={{ title: 'Complaint Details' }} />
              <Stack.Screen name="ResolveComplaint" component={ResolveComplaintScreen} options={{ title: 'Resolve Complaint' }} />
              <Stack.Screen name="AddAsset" component={AddAssetScreen} options={{ title: 'Add Asset' }} />
              <Stack.Screen name="SurveyorDashboard" component={SurveyorDashboard} options={{ title: 'Survey Dashboard' }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

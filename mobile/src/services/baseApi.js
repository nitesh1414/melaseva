import axios from 'axios';
import { Platform } from 'react-native';

// API base URL - change this to your server address
// For Android emulator: use 10.0.2.2 for localhost
// For iOS simulator: use localhost
// For physical device: use your computer's IP address
const API_BASE_URL = 'http://192.168.1.100:5000/api'; // Change to your server IP

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

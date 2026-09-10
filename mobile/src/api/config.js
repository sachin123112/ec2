import { Platform } from 'react-native';

const defaultApiUrl = Platform.OS === 'android'
  ? 'http://10.0.2.2:8080/api/v1'
  : 'http://localhost:8080/api/v1';
const API_URL = process.env.EXPO_PUBLIC_API_URL || defaultApiUrl;

export default {
  API_URL: API_URL.replace(/\/$/, ''),
};

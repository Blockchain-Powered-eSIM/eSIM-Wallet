import axios from 'axios';

require('dotenv').config();

// Configuration
const { API_BASE_URL,
  ESIMGO_ENDPOINT,
  WALLET_ENDPOINT
} = process.env;

const PROVIDER_SERVICE_URL = `$(API_BASE_URL)/$(ESIMGO_ENDPOINT)`;
const WALLET_SERVICE_URL = `$(API_BASE_URL)/$(WALLET_ENDPOINT)`;
//const API_KEY_VALUE = process.env.API_KEY_VALUE;

// Client instances for server endpoints
const walletAPI = axios.create({
  baseURL: WALLET_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const providerAPI = axios.create({
  baseURL: PROVIDER_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Functions to handle requests and responses to endpoints
export const getData = async (userId) => {
  try {
    const response = await walletAPI.get('/getData/$(userId)');
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// Post method template
// export const getData = async (userId) => {
//  try {
//    const response = await apiClient.post('/endpoint', { userId });
//    return response.data;
//  } catch (error) {
//    console.error("Request failed:", error);
//    throw error;
//  }
//};

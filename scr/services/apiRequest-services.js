import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Obtém o token de autenticação armazenado localmente
const getAuthToken = async () => {
  const token = await AsyncStorage.getItem('userToken');
  return token;
};

// Função de solicitação genérica com axios
export const apiRequest = async (method, url, data = null) => {
  const token = await getAuthToken();
  const config = {
    method: method,
    url: `https://api.dpworldsantos.com/${url}`,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: data
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Erro na chamada ${method} para ${url}`, error);
    throw error.response ? error.response.data : error.message;
  }
};

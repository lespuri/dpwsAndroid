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
    //console.error(`Erro na chamada ${method} para ${url}`, error);
  // Tratamento de erro mais robusto
  if (error.response) {
    // Erro de resposta do servidor
    const errorMessage = error.response.data?.Message || 'Erro desconhecido do servidor';
    throw new Error(errorMessage);
  } else if (error.request) {
    // Erro de requisição (sem resposta do servidor)
    throw new Error('Erro de rede ou servidor não respondeu');
  } else {
    // Erro durante a configuração da requisição
    throw new Error('Erro na configuração da requisição');
  }    
    
  }
};

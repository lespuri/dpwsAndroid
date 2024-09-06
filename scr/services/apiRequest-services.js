import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert } from 'react-native';
const URL_PRODUCAO = "https://api.dpworldsantos.com";
const URL_QA = "http://qa.embraportonline.com.br:8100";
const URL_QA_EXTERNO = "http://187.60.22.181:8100";

// Obtém o token de autenticação armazenado localmente
const getAuthToken = async () => {
  const token = await AsyncStorage.getItem('userToken');
  return token;
};



export const apiLogin = async (method, url,user) => {
  try {
    
    const username = user.username;
    const password = user.password;    
    
    const response = await axios.post(`${URL_PRODUCAO}/token`, {
      username,
      password,
      grant_type: 'password'
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response;
    //console.log("response.data", response.data);
    //const { access_token } = response.data;

    //await AsyncStorage.setItem('userToken', access_token);    

  } catch (error) {
            
    if (error.response) {
      // Erro de resposta do servidor
      console.log("error.response.data.error_description", error.response.data.error_description);
      const errorMessage = error.response.data?.error_description || 'Erro desconhecido do servidor';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Erro de requisição (sem resposta do servidor)      
      console.log("error daqui", error);
      throw new Error('Erro de rede ou servidor não respondeu');
    } else {
      // Erro durante a configuração da requisição
      console.log("error daqui", error);
      const errorMessage = error.response.data?.error_description || 'Erro desconhecido do servidor';
      throw new Error(errorMessage);      
    }    
    
    //Alert.alert('Erro', 'Usuário ou senha inválidos');
  }
}

// Função de solicitação genérica com axios
export const apiRequest = async (method, url, data = null) => {
  const token = await getAuthToken();
  if(url == '')
    console.log("data",data);

  const config = {
    method: method,
    url: `${URL_PRODUCAO}/${url}`,
    //url: `https://api.dpworldsantos.com/${url}`,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: data
  };;

  try {
    
    const response = await axios(config);
    
    return response.data;
  } catch (error) {      
  // Tratamento de erro mais robusto
  if (error.response) {
    // Erro de resposta do servidor        
    const errorMessage = error.response.data?.Message || 'Erro desconhecido do servidor';
    //Alert.alert("Erro", errorMessage);
    //console.error("Erro", errorMessage)
    
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

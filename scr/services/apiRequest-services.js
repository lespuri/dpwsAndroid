import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert } from 'react-native';
import Upload from 'react-native-background-upload';
import {_URL_CONFIG} from './properties.service';

const ENV = "PROD" ;
const ENV_CONFIG = _URL_CONFIG.find(item => item.ambiente === ENV);

// Obtém o token de autenticação armazenado localmente
const getAuthToken = async () => {
  const token = await AsyncStorage.getItem('userToken');
  return token;
};



export const apiLogin = async (method, url,user) => {
  try {
    
    const username = user.username;
    const password = user.password;    
    console.log(ENV_CONFIG);
    const response = await axios.post(`${ENV_CONFIG.url}/token`, {
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
    url: `${ENV_CONFIG.url}/${url}`,
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

export const apiUploadImagem = async (url, tempPath) => {
  try {
    const token = await AsyncStorage.getItem("userToken");    
    
    const options = {
      url:ENV_CONFIG.url + url,      
      path: tempPath,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      field: 'file',
      type: 'multipart',
    };

    Upload.startUpload(options).then(uploadId => {
      console.log('Upload started with id:', uploadId);

      Upload.addListener('error', uploadId, (data) => {
        console.log(`Error: ${data.error}`)
      });

    }).catch(err => {
      console.error('Upload error:', err);
    });
  } catch (err) {
    console.error('Error copying file or uploading:', err);
  }
};


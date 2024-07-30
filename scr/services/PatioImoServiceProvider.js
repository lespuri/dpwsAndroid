import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const getAuthToken = async () => {
  const token = await AsyncStorage.getItem('userToken');
  return token;
};

const apiRequest = async (method, url, data = null) => {
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

const PatioImoServiceProvider = {
  buscar: async (container) => {
    return apiRequest('post', 'TfcConteinerInspecaoIMO/Buscar', container);
  },

  salvar: async (container) => {
    return apiRequest('post', 'TfcConteinerInspecaoIMO/Salvar', container);
  },

  buscarImagem: async (imo) => {
    return apiRequest('post', `TfcConteinerInspecaoIMO/Download?id=${imo.TFCCONTEINERINSPECAOIMOID}`, imo);
  },

  uploadImagem: async (container, imo, imagem) => {
    if (!imagem.url) {
      return Promise.resolve();
    }

    const token = await getAuthToken();
    const url = `${await AsyncStorage.getItem('urlAmbiente')}TfcConteinerInspecaoIMO/Upload?id=${container.TFCCONTEINERINSPECAOID}&imo=${imo.NROIMO}&un=${imo.UN}`;
    const fileUri = imagem.url;

    const options = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'image/jpeg',
      },
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    };

    try {
      const uploadResult = await FileSystem.uploadAsync(url, fileUri, options);
      console.log("fileTransfer.upload Uploaded Successfully", uploadResult);
      return Promise.resolve();
    } catch (error) {
      console.log("fileTransfer.upload erro", error);
      return Promise.reject(error);
    }
  }
};

export default PatioImoServiceProvider;

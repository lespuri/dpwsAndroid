import { apiRequest, apiUploadImagem } from './apiRequest-services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import RNFS from 'react-native-fs';
import Upload from 'react-native-background-upload';

//import * as FileSystem from 'expo-file-system';
//import * as FileSystem from 'expo-file-system';

const getAuthToken = async () => {
  const token = await AsyncStorage.getItem('userToken');
  return token;
};


  export const buscar = async (container) => {    
    return apiRequest('post', 'TfcConteinerInspecaoIMO/BuscarByGate', container);
  };

  export const buscarImagem = async (TFCCONTEINERINSPECAOIMOID) => {    
    return apiRequest('post', `TfcConteinerInspecaoIMO/Download?id=${TFCCONTEINERINSPECAOIMOID}`, null);
  };

 export const salvar = async (container) => {
  try{
    console.log(container)
    return apiRequest('post', 'TfcConteinerInspecaoIMO/SalvarByGate', container);
  }catch(err){
    throw new Error(err);
  }
    
  };

  const checkFileSize = async (fileUri) => {
    try {
      const fileInfo = await RNFS.stat(fileUri);
      const fileSizeInBytes = fileInfo.size;
      
      // Converte o tamanho do arquivo de bytes para MB
      const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
  
      if (fileSizeInMB > 5) {  // Verifica se o tamanho é maior que 5MB, por exemplo
        console.log('O arquivo é muito grande para o upload.');
      } else {
        console.log('Tamanho do arquivo é permitido:', fileSizeInMB, 'MB');
      }
    } catch (error) {
      console.error('Erro ao verificar o tamanho do arquivo:', error);
    }
  };

  export const uploadImagem = async (container, imo, imagem) => {
    try {
      const tempPath = `${RNFS.TemporaryDirectoryPath}/${Date.now()}.jpeg`;
      await RNFS.copyFile(imagem.uri, tempPath);
  
      return await apiUploadImagem(`/TfcConteinerInspecaoIMO/UploadByGate?id=${container.TFCCONTEINERINSPECAOID}&un=${imo.UN}`, tempPath);
    } catch (err) {
      console.error("Tem chance de dar erro no parse JSON.parse(err.response.data)", err);
      throw JSON.parse(err.response.data);
    }           
  };


//export default PatioImoServiceProvider;

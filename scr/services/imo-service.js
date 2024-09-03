import { apiRequest } from './apiRequest-services';
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
      const token = await AsyncStorage.getItem("userToken");
      console.log("container.TFCCONTEINERINSPECAOID",  container.TFCCONTEINERINSPECAOID);
      console.log("imo.UN",  imo.UN);
      // Copiando o arquivo de content:// para um local temporário
      const tempPath = `${RNFS.TemporaryDirectoryPath}/${Date.now()}.jpeg`;
      await RNFS.copyFile(imagem.uri, tempPath);
  
      const options = {      
      url: `http://187.60.22.181:8100/TfcConteinerInspecaoIMO/UploadByGate?id=${container.TFCCONTEINERINSPECAOID}&un=${imo.UN}`,
      //url: `http://qa.embraportonline.com.br:8100/TfcConteinerInspecaoIMO/UploadByGate?id=${container.TFCCONTEINERINSPECAOID}&un=${imo.UN}`,
      //url: `https://api.dpworldsantos.com/TfcConteinerInspecaoIMO/UploadByGate?id=${container.TFCCONTEINERINSPECAOID}&un=${imo.UN}`,

        path: tempPath,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        field: 'file',
        type: 'multipart',
        notification: {
          enabled: false, // Desabilita as notificações
        }
      };
  
      Upload.startUpload(options).then(uploadId => {
        console.log('Upload started with id:', uploadId);
  
        Upload.addListener('error', uploadId, (data) => {
          console.log("Error data");
          console.log(data)
        });
  
      }).catch(err => {
        console.error('Upload error:', err);
      });
    } catch (err) {
      console.error('Error copying file or uploading:', err);
    }
  };


//export default PatioImoServiceProvider;

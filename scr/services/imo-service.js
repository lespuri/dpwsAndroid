import { apiRequest } from './apiRequest-services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import RNFS from 'react-native-fs';
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
  
    return apiRequest('post', 'TfcConteinerInspecaoIMO/SalvarByGate', container);
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
      if (!imagem.uri) {
        console.log("Nenhuma imagem para enviar.");
        return;
      }
      checkFileSize(imagem.uri);
      const token = await getAuthToken();
      const url = `http://www.embraportonline.com.br:8100/TfcConteinerInspecaoIMO/UploadByGate?id=${container.TFCCONTEINERINSPECAOID}&un=${imo.UN}`;
  
      const formData = new FormData();
      console.log(imagem.uri);
      // Anexa o arquivo ao formData
      formData.append('file', {
        uri: imagem.uri,
        type: 'image/jpeg', // ou 'image/png' dependendo do tipo de imagem
        name: `image_${container.TFCCONTEINERINSPECAOID}.jpg` // Nome da imagem que será enviada
      });
  
      // Adiciona outros parâmetros, se necessário
      formData.append('id', container.TFCCONTEINERINSPECAOID);
      formData.append('un', imo.UN);
  
      const response = await axios.post(url, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          console.log(`Progress: ${(progressEvent.loaded / progressEvent.total) * 100}%`);
        }
      });
  
      console.log('Upload realizado com sucesso', response.data);
    } catch (error) {
      console.error('Erro no upload', error.response || error.message);
    }
  };

  export const uploadImagemOld1 = async (container, imo, imagem) => {
    if (!imagem.uri) {
      return Promise.resolve();
    }
  
    try {
      const token = await getAuthToken();
      const url = `http://www.embraportonline.com.br:8100/TfcConteinerInspecaoIMO/UploadByGate?id=${container.TFCCONTEINERINSPECAOID}&un=${imo.UN}`;
        
      // Configura o cabeçalho e os dados para o envio
      const formData = new FormData();
      formData.append('file', {
        uri: imagem.uri,
        type: 'image/jpeg',
        name: `${container.TFCCONTEINERINSPECAOID}_${imo.UN}.jpg`,
      });
  
      const response = await axios({
        method: 'POST',
        url: url,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        data: formData,
      });
  
      console.log("Upload realizado com sucesso:", response.data);
      return Promise.resolve();
    } catch (error) {
      console.log("Erro ao realizar upload:", error);
      return Promise.reject(error);
    }
  };


  export const uploadImagemOld = async (container, imo, imagem) => {
    console.log("uploadImagem")
    console.log("container", container);
    console.log("imo", imo);
    console.log("imagem", imagem);
    if (!imagem.uri) {
      return Promise.resolve();
    }

    const token = await getAuthToken();
    const url = `http://www.embraportonline.com.br:8100/TfcConteinerInspecaoIMO/Upload?id=${container.TFCCONTEINERINSPECAOID}&imo=${imo.NROIMO}&un=${imo.UN}`;
    const fileUri = imagem.uri;

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
  };


//export default PatioImoServiceProvider;

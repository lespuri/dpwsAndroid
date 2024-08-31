import { apiRequest } from './apiRequest-services';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import Upload from 'react-native-background-upload';
//import * as FileSystem from 'expo-file-system';
//rimport * as FileUpload from 'react-native-file-upload';


export const buscarAvaria = async (container) => {
  try {    
    console.log("buscarAvaria", container);
    const response = await apiRequest('post','TfcConteinerInspecaoAvaria/Buscar', container);
    console.log("buscarAvaria", response);
    return response;
  } catch (error) {
    console.error("Erro ao buscar avarias", error);
    throw error.response ? error.response.data : error;
  }

}

export const buscarImagem = async (avaria) => {
  try {
    const response = await apiRequest('post', `TfcConteinerInspecaoAvaria/Download?id=${avaria.TFCCONTEINERINSPECAOAVARIAID}`, avaria);
    console.log("buscarImagem", response);
    return response;
  } catch (error) {
    console.error("Erro ao buscar imagem", error);
    throw error.response ? error.response.data : error;
  }

}

export const uploadImagem = async (container, avaria, imagem) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
 
    // Copiando o arquivo de content:// para um local temporário
    const tempPath = `${RNFS.TemporaryDirectoryPath}/${Date.now()}.jpeg`;
    await RNFS.copyFile(imagem.uri, tempPath);

    const options = {      
      url: `http://187.60.22.181:8100/TfcConteinerInspecaoAvaria/Upload?id=${container.TFCCONTEINERINSPECAOID}&component=${avaria.COMPONENTE}&type=${avaria.TIPO}`,
      //url: `http://qa.embraportonline.com.br:8100/TfcConteinerInspecaoAvaria/Upload?id=${container.TFCCONTEINERINSPECAOID}&component=${avaria.COMPONENTE}&type=${avaria.TIPO}`,
      //url: `https://api.dpworldsantos.com/TfcConteinerInspecaoAvaria/Upload?id=${container.TFCCONTEINERINSPECAOID}&component=${avaria.COMPONENTE}&type=${avaria.TIPO}`,

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

export const uploadImagemOld = async (container, avaria, imagem) => {
  try {
    const token = localStorage.getItem("token");
    const url = `${localStorage.getItem("urlAmbiente")}TfcConteinerInspecaoAvaria/Upload?id=${container.TFCCONTEINERINSPECAOID}&component=${avaria.COMPONENTE}&type=${avaria.TIPO}`;

    const fileUri = Platform.OS === 'ios' ? imagem.uri.replace('file://', '') : imagem.uri;
    
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: `${container.TFCCONTEINERINSPECAOID}_${imagem.fileName}`,
      type: 'image/jpeg',
    });
    formData.append('id', container.TFCCONTEINERINSPECAOID);

    const response = await apiRequest.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log("Upload realizado com sucesso", response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao fazer upload da imagem", error);
    throw error.response ? error.response.data : error;
  }

}

export const buscarDamage = async (prIdDamage) => {
  try {
    const response = await apiRequest.post(`TfcConteinerInspecaoAvaria/BuscarDamage?prIdDamage=${prIdDamage}`, { prIdDamage });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar damage", error);
    throw error.response ? error.response.data : error;
  }

}

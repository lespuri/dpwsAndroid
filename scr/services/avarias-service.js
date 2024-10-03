import { apiRequest, apiUploadImagem } from './apiRequest-services';
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
    const tempPath = `${RNFS.TemporaryDirectoryPath}/${Date.now()}.jpeg`;
    await RNFS.copyFile(imagem.uri, tempPath);

    return await apiUploadImagem(`/TfcConteinerInspecaoAvaria/Upload?id=${container.TFCCONTEINERINSPECAOID}&component=${avaria.COMPONENTE}&type=${avaria.TIPO}`, tempPath);
  } catch (err) {
    console.error("Tem chance de dar erro no parse JSON.parse(err.response.data)", err);
    throw JSON.parse(err.response.data);
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

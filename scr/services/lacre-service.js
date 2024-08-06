import { apiRequest } from './apiRequest-services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TfcConteinerInspecaoDTO } from '../../models/TfcConteinerInspecaoDTO';
import { TfcConteinerInspecaoLacre } from '../../models/TfcConteinerInspecaoLacre';
import {mockActionTfcConteinerInspecaoLacreResumoBuscar } from '../utils/mocados'

export const buscarLacre = async (container) => {
  try {
    return  mockActionTfcConteinerInspecaoLacreResumoBuscar();
    //return await apiRequest('post', 'TfcConteinerInspecaoLacreResumo/Buscar', container);
  } catch (err) {
    console.error("Tem chance de dar erro no parse JSON.parse(err.response.data)", err);
    throw JSON.parse(err.response.data);
  }
};

export const buscarDadosCompletoLacre = async (container) => {
  try {
    return [] //await apiRequest('post', 'TfcConteinerInspecaoLacre/Buscar', container);
  } catch (err) {
    console.error("Tem chance de dar erro no parse JSON.parse(err.response.data)", err);
    throw JSON.parse(err.response.data);
  }
};

export const buscarImagemLacre = async (lacre) => {  
  try {
    return await apiRequest('post', `TfcConteinerInspecaoLacre/Download?id=${lacre.TFCCONTEINERINSPECAOLACREID}`, lacre);
  } catch (err) {
    console.error("Tem chance de dar erro no parse JSON.parse(err.response.data)", err);
    throw JSON.parse(err.response.data);
  }
};

export const uploadImagem = async (container, lacre, imagem) => {
  try {
    /*
    const token = await AsyncStorage.getItem("token");
    const urlAmbiente = await AsyncStorage.getItem("urlAmbiente");

    const formData = new FormData();
    formData.append('file', {
      uri: imagem.url,
      type: 'image/jpeg',
      name: `${container.TFCCONTEINERINSPECAOID}_${imagem.fileName}`,
    });
    formData.append('id', container.TFCCONTEINERINSPECAOID.toString());

    const response = await fetch(`${urlAmbiente}TfcConteinerInspecaoLacre/Upload?id=${container.TFCCONTEINERINSPECAOID}&lacre=${lacre}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erro no upload da imagem');
    }*/
    console.log("fileTransfer.upload Uploaded Successfully");
  } catch (err) {
    console.log("fileTransfer.upload erro", err);
    throw err;
  }
};

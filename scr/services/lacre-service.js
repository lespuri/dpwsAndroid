import { apiRequest, apiUploadImagem } from './apiRequest-services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TfcConteinerInspecaoDTO } from '../../models/TfcConteinerInspecaoDTO';
import { TfcConteinerInspecaoLacre } from '../../models/TfcConteinerInspecaoLacre';
import {mockActionTfcConteinerInspecaoLacreResumoBuscar } from '../utils/mocados'
import axios from 'axios';
import Upload from 'react-native-background-upload';
import { PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
const fs = require('fs');

export const buscarLacre = async (container) => {
  try {
    //return  mockActionTfcConteinerInspecaoLacreResumoBuscar();    
    return await apiRequest('post', 'TfcConteinerInspecaoLacreResumo/Buscar', container);
  } catch (err) {
    console.error("Tem chance de dar erro no parse JSON.parse(err.response.data)", err.message);
    throw new Error(err);
  }
};

export const buscarDadosCompletoLacre = async (container) => {
  try {
    return apiRequest('post', 'TfcConteinerInspecaoLacre/Buscar', container);
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

const removeFileProtocol = (filePath) => {
  console.log("filePath", filePath);
  return filePath.replace('file://', '');
};

export const uploadImagem = async (container, lacre, imagem) => {
  try {
    const tempPath = `${RNFS.TemporaryDirectoryPath}/${Date.now()}.jpeg`;
    await RNFS.copyFile(imagem.uri, tempPath);

    return await apiUploadImagem(`/TfcConteinerInspecaoLacre/Upload?id=${container.TFCCONTEINERINSPECAOID}&lacre=${lacre}`, tempPath);
  } catch (err) {
    console.error("Tem chance de dar erro no parse JSON.parse(err.response.data)", err);
    throw JSON.parse(err.response.data);
  }    
};
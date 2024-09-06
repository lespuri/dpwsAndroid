import { apiRequest } from './apiRequest-services';
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
    const token = await AsyncStorage.getItem("userToken");

    // Copiando o arquivo de content:// para um local temporário
    const tempPath = `${RNFS.TemporaryDirectoryPath}/${Date.now()}.jpeg`;
    await RNFS.copyFile(imagem.uri, tempPath);
    
    
    const options = {
      //url: `http://187.60.22.181:8100/TfcConteinerInspecaoLacre/Upload?id=${container.TFCCONTEINERINSPECAOID}&lacre=${lacre}`,
      //url: `http://qa.embraportonline.com.br:8100/TfcConteinerInspecaoLacre/Upload?id=${container.TFCCONTEINERINSPECAOID}&lacre=${lacre}`,
      url: `https://api.dpworldsantos.com/TfcConteinerInspecaoLacre/Upload?id=${container.TFCCONTEINERINSPECAOID}&lacre=${lacre}`,
      
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


/*
async function requestStoragePermission() {
  try {
    console.log("Permissão tentada");
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Permissão para Armazenamento",
          message: "O aplicativo precisa de acesso ao armazenamento para fazer upload de arquivos.",
          buttonNeutral: "Perguntar Depois",
          buttonNegative: "Cancelar",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Permissão concedida");
      } else {
        console.log("Permissão negada");
      }
    }
  } catch (err) {
    console.warn(err);
  }
}

export const uploadImagem = async (container, lacre, imagem) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    await requestStoragePermission();
    // Lê o arquivo do caminho dado no dispositivo
    const filePath = imagem.uri; // Caminho do arquivo no dispositivo
    //const filePath = imagem.uri.replace('file://', '');    
    const base64Data = await RNFS.readFile(filePath, 'base64');
    
    // Verifica se o arquivo existe no dispositivo
    const exists = await RNFS.exists(filePath);
    if (!exists) {
      throw new Error('Arquivo não encontrado no caminho especificado.');
    }else{
      console.log("Arquivo existe");
    }
    
    // Copiando o arquivo de content:// para um local temporário
    const tempPath = `${RNFS.TemporaryDirectoryPath}/${Date.now()}.jpeg`;
    await RNFS.copyFile(imagem.uri, tempPath);

    const formData = new FormData();
    formData.append('file', {
      uri: tempPath, // Caminho da imagem no dispositivo
      type: 'image/jpeg', // Tipo do arquivo
      name: `${container.TFCCONTEINERINSPECAOID}_${imagem.fileName}`, // Nome do arquivo
    });

    let data = new FormData();
    data.append('0012121', base64Data);

    const config = {
      method: 'post',
      url: `http://187.60.22.181:8100/TfcConteinerInspecaoLacre/Upload?id=${container.TFCCONTEINERINSPECAOID}&lacre=${lacre}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      data: data,
    };

    const response = await axios(config);

    if (response.status === 200) {
      console.log("Upload realizado com sucesso");
    } else {
      throw new Error('Erro no upload da imagem');
    }
  } catch (error) {
    console.error("catch:  Erro ao fazer upload", error);
    throw error;
  }
};
*/
/*
export const uploadImagem = async (container, lacre, imagem) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    
    const url = `http://187.60.22.181:8100/TfcConteinerInspecaoLacre/Upload?id=${container.TFCCONTEINERINSPECAOID}&lacre=${lacre}`;
    
    const filePath = imagem.uri.replace('file://', ''); // Remove o esquema file:// para ser compatível com RNFS
    console.log("filePath", await copyContentFileToTemp(imagem.uri));
    console.log("imagem.uri", imagem.uri);

    // Verifica se o arquivo existe
    const exists = await RNFS.exists(imagem.uri);
    if (!exists) {
      throw new Error('Arquivo não encontrado no caminho especificado.');
    }

    const uploadOptions = {
      toUrl: url,
      files: [{
        name: 'file',
        filename: `${container.TFCCONTEINERINSPECAOID}_${imagem.fileName}`,
        filepath: filePath,
        filetype: 'image/jpg',
      }],
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      begin: (res) => {
        console.log('Upload começou', res);
      },
      progress: (res) => {
        //let percentage = (res.bytesWritten / res.contentLength) * 100;
        //console.log(`Upload progress: ${percentage}%`);
      }
    };

    const response = await RNFS.uploadFiles(uploadOptions).promise;
    if (response.statusCode === 200) {
      console.log('Upload realizado com sucesso', response);
    } else {
      console.log('Erro no upload', response);
      throw new Error('Erro no upload da imagem');
    }
  } catch (error) {
    console.log('Erro ao fazer upload', error);
    throw error;
  }
};

*/
/*
export const uploadImagem = async (container, lacre, imagem) => {
  const token = await AsyncStorage.getItem("userToken")
  console.log("imagem", imagem );
  const bla = await copyContentFileToTemp(imagem.uri);
  console.log("bla", bla );

  const options = {
    url: `http://187.60.22.181:8100/TfcConteinerInspecaoLacre/Upload?id=${container.TFCCONTEINERINSPECAOID}&lacre=${lacre}`,
    path: 'file:/' + bla ,
    method: 'POST',
    headers: {
      'Authorization': token,
    },
    type: 'multipart',
    field: 'file',
  };
  
  Upload.startUpload(options).then(uploadId => {
    console.log('Upload started with id: ', uploadId);
    // Escutando progresso do upload
    Upload.addListener('progress', uploadId, data => {
      console.log(`Progress: ${data.progress}`);
    });
    Upload.addListener('error', uploadId, (data) => {
      console.log(`Error: ${data.error}`)
    })
    // Após o upload ser finalizado
    Upload.addListener('completed', uploadId, async data => {
      console.log('Upload finalizado com sucesso!', data.responseBody);

      // Agora, você pode enviar a notificação push com a resposta da API
      const apiResponse = JSON.parse(data.responseBody); // Certifique-se que a resposta da API é um JSON
      sendPushNotification(apiResponse);
    });

  }).catch(err => {
    console.error('Upload error:', err);
  });
  /*
  try {
    const token = await AsyncStorage.getItem("userToken");
    const formData = new FormData();
    formData.append('file', {
      uri: removeFileProtocol(imagem.uri), // caminho da imagem
      type: 'image/jpeg', // tipo do arquivo
      name: `${container.TFCCONTEINERINSPECAOID}`, // nome do arquivo
    });
    formData.append('id', container.TFCCONTEINERINSPECAOID.toString());
    
    const url = `http://187.60.22.181:8100/TfcConteinerInspecaoLacre/Upload?id=${container.TFCCONTEINERINSPECAOID}&lacre=${lacre}`;
    console.log(formData._parts);
    const response = await axios.post(url, formData, {
      headers: {
        'authorization': `Bearer ${token}`,
        'content-type': 'multipart/form-data',
      },
    });

    if (!response.status === 200) {
      throw new Error('Erro no upload da imagem');
    }

    console.log("Upload realizado com sucesso");
  } catch (error) {
    console.log("Erro ao fazer upload", error);
    throw error;
  }*/
 /*
};
*/
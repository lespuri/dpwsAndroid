import { TfcConteinerInspecaoDTO } from '../../models/TfcConteinerInspecaoDTO';
import { TfcConteinerInspecaoLacreResumoDTO } from '../../models/TfcConteinerInspecaoLacreResumoDTO';
import { apiRequest } from './apiRequest-services';
import { mockBuscarLacreColocado, mockConteinerServicePesquisar } from '../utils/mocados'
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import Upload from 'react-native-background-upload';

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
    console.log("upload lacre colocados", options)
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


export const buscarLacreColocado = (container) => {    
    //return  mockBuscarLacreColocado(container);
    return apiRequest('post', 'TfcConteinerInspecaoLacreResumo/BuscarColocado', container);
    
  };
  
  export const salvarLacreColocado =  (container) => {
    console.log("salvarLacreColocado", container);
    //return  true;
    
    try{
      return apiRequest('post', 'TfcConteinerInspecaoLacreResumo/Salvar', container);
    }catch (error) {
      console.error('Erro ao salvar inspecao', error.response || error.message);
    }
    
  };

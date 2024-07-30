import { useState } from 'react';
import { Alert, Platform, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { INSPECAO_CHECKLIST } from '../utils/constants.page';
import { NavigationActions } from 'react-navigation';

const BaseModel = () => {
  const [inspecao, setInspecao] = useState({});
  const [loading, setLoading] = useState(false);

  const presentToast = (msg) => {
    let messageToShow = typeof msg === 'string' ? msg : msg?.error_description;

    if (Platform.OS === 'android') {
      ToastAndroid.show(messageToShow, ToastAndroid.LONG);
    } else {
      Alert.alert('Notification', messageToShow);
    }
  };

  const presentLoading = () => {
    setLoading(true);
  };

  const dismissLoading = () => {
    setLoading(false);
  };

  const extractErrorMessage = (err) => {
    let jsonConvertido = JSON.stringify(err);
    if (err?.ExceptionMessage) {
      return err.ExceptionMessage;
    } else if (err?.Message) {
      return err.Message;
    } else if (typeof err === 'string') {
      try {
        let json = JSON.parse(err);
        return extractErrorMessage(json);
      } catch (exception) {
        return err;
      }
    }
    if (err.name === 'TimeoutError') {
      return 'Ocorreu uma demora de mais de 20 segundos para resposta, clique em "OK" e tente novamente!';
    }
    if (jsonConvertido === '{"isTrusted":true}') {
      return 'Houve um problema ao executar esta operação, clique em "OK" e tente novamente!';
    }

    console.log(JSON.stringify(err));
    return JSON.stringify(err);
  };

  const backToMenu = (navigation, isDadosPreenchidos) => {
    confirmDadosPreenchidos(isDadosPreenchidos);
    navigation.popToTop();
  };

  const backToMenuGate = (navigation, isDadosPreenchidos) => {
    confirmDadosPreenchidos(isDadosPreenchidos);
    navigation.popToTop();
  };

  const goToMenu = (navigation, pageTo, page, isDadosPreenchidos) => {
    if (page) {
      confirmDadosPreenchidos(page, isDadosPreenchidos);
    }

    inspecao.checklist = INSPECAO_CHECKLIST[inspecao.tipo];
    inspecao.checklist.menuL.forEach(menu => {
      if (menu.page === pageTo.name) {
        inspecao.checklistSelecionado = menu;
      }
    });

    navigation.navigate(pageTo, { inspecao });
  };

  const confirmDadosPreenchidos = (page, isDadosPreenchidos = true) => {
    inspecao.checklist.menuL.forEach(menu => {
      if (menu.page === page.name) {
        menu.isDadosPreenchidos = isDadosPreenchidos;
      }
    });
    presentToast('Dados confirmados com sucesso.');
  };

  const cleanAllImageFileTemp = async () => {
    if (Platform.OS !== 'web') {
      try {
        const files = await RNFS.readDir(RNFS.CachesDirectoryPath);
        for (const file of files) {
          await RNFS.unlink(file.path);
        }
      } catch (error) {
        console.error('Error deleting files from cache folder', error);
      }
    }
  };

  const checkBaseUrl = async () => {
    await AsyncStorage.setItem('urlAmbiente', _URL_PADRAO);
    const urlAmbiente = await AsyncStorage.getItem('urlAmbiente');
    if (!urlAmbiente) {
      await AsyncStorage.setItem('urlAmbiente', _URL_PADRAO);
    }
  };

  return {
    presentToast,
    presentLoading,
    dismissLoading,
    extractErrorMessage,
    backToMenu,
    backToMenuGate,
    goToMenu,
    confirmDadosPreenchidos,
    cleanAllImageFileTemp,
    checkBaseUrl,
    inspecao,
    loading,
  };
};

export default BaseModel;

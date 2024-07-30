import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ContainerServiceProvider from '../services/container-service';
//import PatioImoServiceProvider from '../services/patio-imo-service';
import { INSPECAO_PAGE_CONFIG } from '../utils/constants.page';
import { KDTipo } from '../enum/KDTipo';
import BaseModel from '../models/BaseModel';
import AlertService from '../services/Alert';

const MenuInspecaoScreen = () => {
  const [inspecao, setInspecao] = useState({});
  const route = useRoute();
  const navigation = useNavigation();
  const { presentLoading, dismissLoading, presentToast } = BaseModel();
  const { present, presentErr } = AlertService();

  useEffect(() => {
    const params = route.params;
    if (params) {
      const inspecaoData = params.inspecao;
      inspecaoData.checklist = INSPECAO_PAGE_CONFIG[inspecaoData.tipo];
      setInspecao(inspecaoData);
    }

    const handleKeyPress = (e) => {
      if (e.key >= '1' && e.key <= '9') {
        const indexMenu = parseInt(e.key) - 1;
        const menu = inspecao.checklist.menuL[indexMenu];
        if (menu) {
          goTo(menu);
        }
      } else if (e.key === 'Enter') {
        onFinalizar();
      }
    };

    const subscription = Keyboard.addListener('keyboardDidShow', handleKeyPress);

    return () => {
      subscription.remove();
    };
  }, [inspecao]);

  const goTo = (menu) => {
    inspecao.checklistSelecionado = menu;
    navigation.navigate(INSPECAO_PAGE_CONFIG[menu.page], { inspecao });
  };

  const validateGate = () => {
    let isReturn = true;

    inspecao.checklist.menuL.forEach((element, idx) => {
      if (element.page === 'GateDadosPage' && !element.isDadosPreenchidos) {
        present("Atenção", "Confirme os Dados do Gate antes de finalizar", []);
        isReturn = false;
      } else if (element.page === 'GateLacresPage' && !element.isDadosPreenchidos) {
        present("Atenção", "Confirme os Lacres do Gate antes de finalizar", []);
        isReturn = false;
      } else if (element.page === 'GateAvariasPage' && !element.isDadosPreenchidos) {
        present("Atenção", "Confirme as Avarias do Gate antes de finalizar", []);
        isReturn = false;
      } else if (element.page === 'GateReeferPage' && !element.isDadosPreenchidos && inspecao.tfcContainerInspecaoDto.CESETTING) {
        present("Atenção", "Há previsão de Reefer para este conteiner, confirme antes de finalizar", []);
        isReturn = false;
      }

      // ultimo item
      if ((idx + 1) === inspecao.checklist.menuL.length && isReturn) {
        isReturn = true;
      }
    });

    return isReturn;
  };

  const onValidarFinalizar = async () => {
    if (inspecao.tipo === KDTipo.kdInspecaoGate && !validateGate()) {
      return;
    }
    try {
      const result = await PatioImoServiceProvider.buscar(inspecao.tfcContainerInspecaoDto);
      const imoDbL = [...result];
      if (imoDbL.length > 0 && !inspecao.tfcConteinerInspecaoIMODTO) {
        Alert.alert(
          'IMO\'s pendentes',
          'Existem selos de IMO cadastrados para este conteiner, deseja proceguir sem verificar estes selos pendentes?',
          [
            {
              text: 'SIM',
              onPress: () => onFinalizar(),
            },
            {
              text: 'NÃO',
              onPress: () => {},
            },
          ]
        );
      } else {
        onFinalizar();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onFinalizar = async () => {
    inspecao.tfcContainerInspecaoDto.TIPO = inspecao.tipo;
    inspecao.tfcContainerInspecaoDto.TIPOENUM = KDTipo[inspecao.tipo];
    presentLoading();
    try {
      const result = await ContainerServiceProvider.finalizar(inspecao.tfcContainerInspecaoDto, inspecao.reservaSelecionada?.RESERVAJANELAID || 0);
      dismissLoading();
      navigation.popToTop();
      if (inspecao.tipo === KDTipo.kdInspecaoGate) {
        present("Inspecão finalizada com sucesso", "", []);
        setTimeout(() => {
          navigation.navigate('Home');
        }, 1000);
      } else {
        if (result.length > 0) {
          result.forEach(element => {
            present("Atenção", element.astMessage, []);
          });
        }
        navigation.navigate('Home');
      }
    } catch (error) {
      dismissLoading();
      console.error(error);
      presentErr("Atenção", error, []);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={inspecao.checklist?.menuL || []}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemContainer} onPress={() => goTo(item)}>
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <TouchableOpacity style={styles.finalizeButton} onPress={onValidarFinalizar}>
        <Text style={styles.finalizeButtonText}>Finalizar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 16,
  },
  finalizeButton: {
    backgroundColor: '#022E69',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 16,
  },
  finalizeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MenuInspecaoScreen;

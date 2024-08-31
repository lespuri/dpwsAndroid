import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Keyboard, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { finalizar } from '../services/container-service';
//import PatioImoServiceProvider from '../services/patio-imo-service';
import { INSPECAO_PAGE_CONFIG } from '../utils/constants.page';
import { KDTipo } from '../enum/KDTipo';
import BaseModel from '../models/BaseModel';
import AlertService from '../services/Alert';
import {buscar} from '../services/imo-service';
import Icon from 'react-native-vector-icons/FontAwesome';

const MenuInspecaoScreen = () => {
  const route = useRoute();
  const [inspecao, setInspecao] = useState(route.params?.inspecao || {});
 
  const navigation = useNavigation();
  const { presentLoading, dismissLoading, presentToast } = BaseModel();
  const { present, presentErr } = AlertService();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    console.log("route.params?.inspecao", route.params?.inspecao);
    if (route.params?.inspecao) {
      setInspecao(route.params.inspecao);
    }
  }, [route.params?.inspecao]);

  useEffect(() => {
   
    console.log("NenuInspecao > ", route.params)
    const params = route.params;    
    if (params) {
      const inspecaoData = params;      
      setInspecao(inspecaoData);      
      console.log("NenuInspecao", inspecao)
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
    navigation.navigate(menu.page, { inspecao });
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
      const result = await buscar(inspecao.tfcContainerInspecaoDto);
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
    setLoading(true);
    inspecao.tfcContainerInspecaoDto.TIPO = inspecao.tipo;
    inspecao.tfcContainerInspecaoDto.TIPOENUM = KDTipo[inspecao.tipo];
    
    
    try {
      console.log("finalizar");
      const result = await finalizar(inspecao.tfcContainerInspecaoDto, inspecao.reservaSelecionada?.RESERVAJANELAID || 0);
      
      //dismissLoading();
      //navigation.popToTop();
      if (inspecao.tipo === KDTipo.kdInspecaoGate) {
        present("Inspecão finalizada com sucesso", "", []);
        setTimeout(() => {
          setLoading(false);
          navigation.navigate('Menu');
        }, 1000);
      } else {
        if (result.length > 0) {
          result.forEach(element => {
            present("Atenção", element.astMessage, []);
          });
        }
        navigation.navigate('Menu');
      }
    } catch (error) {
      //dismissLoading();
      console.error(error);
      presentErr("Atenção", error.toString(), []);
    }finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={inspecao.checklist?.menuL || []}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemContainer} onPress={() => goTo(item)}>
            <View style={styles.itemContent}>
              <Text style={[styles.itemText, item.isDadosPreenchidos && styles.itemTextPreenchido]}>
                {item.name}
              </Text>
              {item.isDadosPreenchidos && <Icon name="check-circle" size={20} color="green" style={styles.icon} />}
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <TouchableOpacity style={styles.finalizeButton} onPress={onValidarFinalizar}>
        <Text style={styles.finalizeButtonText}>Finalizar</Text>
        {loading ? <ActivityIndicator color="#fff" /> : <Icon name="check-circle" size={20} color="#fff" />}
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
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
  },
  itemTextPreenchido: {
    color: 'green', // Cor verde para o item de menu preenchido
  },
  icon: {
    marginLeft: 10,
  },
  finalizeButton: {
    backgroundColor: '#022E69',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  finalizeButtonText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
});

export default MenuInspecaoScreen;

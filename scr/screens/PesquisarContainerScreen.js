import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { pesquisar } from '../services/container-service';
import { TfcConteinerInspecaoDTO } from '../models/TfcConteinerInspecaoDTO';
import { Inspecao } from '../models/inspecao.model';
import { INSPECAO_CHECKLIST } from '../utils/constants.page';  // Importar a constante

const PesquisarContainerScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const inspecaoData = route.params; // Recebe os dados passados

  const [modelContainer, setModelContainer] = useState('');
  const [tfcContainerInspecaoDto, setTfcContainerInspecaoDto] = useState(new TfcConteinerInspecaoDTO());
  const [inspecao, setInspecao] = useState(inspecaoData);
  const [searchTriggered, setSearchTriggered] = useState(false);
  
  useEffect(() => {
    setModelContainer('TOFU1234567');
    
  });

  useEffect(() => {
    setModelContainer(inspecao.container || '');
    
  }, [inspecao]);

  useEffect(() => {
    if (searchTriggered) {
      
      const updatedDto = {        
        NROCONTEINER: modelContainer,
        TIPO: inspecao.tipo,
      };

      const performSearch = async () => {
        try {
          console.log("payload consulta", updatedDto);
          const result = await pesquisar(updatedDto); 
          console.log(result);         
          setTfcContainerInspecaoDto(result);
          
          const updatedInspecao = {
            ...inspecao,
            tfcContainerInspecaoDto:  result
            
          };          
          updatedInspecao.checklist.menuL.forEach((eachObj) => {
            eachObj.isDadosPreenchidos = false;
          });
          
          setInspecao(updatedInspecao);
          //Alert.alert('Success', 'Container encontrado!');
          navigation.navigate('MenuInspecao', updatedInspecao);
          
        } catch (ex) {
          //console.error('Erro', ex);
          Alert.alert('Atenção', ex.message);
        } finally {
          setSearchTriggered(false);
        }
      };

      performSearch();
    }
  }, [searchTriggered]);

  const removerMarcara = (container) => {
    return container.replace(' ', '').replace('.', '').replace('-', '');
  };

  const isValido = () => {
    const numero = modelContainer.replace('_', '').replace('_', '');
    return numero.length >= 7;
  };

  const iniciarInspecao = () => {
    const novaInspecao =  inspecaoData;//new Inspecao(inspecao.tipo, modelContainer, removerMarcara(modelContainer));
    setInspecao(novaInspecao);
  };

  const showLoader = () => {
    // Implementar lógica de loader
  };

  const handlePesquisar = () => {
    if (!isValido()) {
      Alert.alert('Atenção', 'Preencha o número do Container corretamente para prosseguir');
      return;
    }

    showLoader();
    iniciarInspecao();
    setSearchTriggered(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pesquisar Container</Text>
      <TextInput
        style={styles.searchbar}
        placeholder="Search"
        value={modelContainer}
        onChangeText={setModelContainer}
      />
      <TouchableOpacity style={styles.button} onPress={handlePesquisar}>
        <Text style={styles.buttonText}>Pesquisar</Text>
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
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  searchbar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#022E69',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PesquisarContainerScreen;

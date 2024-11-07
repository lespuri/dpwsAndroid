import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { pesquisar } from '../services/container-service';
import { TfcConteinerInspecaoDTO } from '../models/TfcConteinerInspecaoDTO';
import { Inspecao } from '../models/inspecao.model';
import { INSPECAO_CHECKLIST } from '../utils/constants.page';  // Importar a constante
import Icon from 'react-native-vector-icons/FontAwesome';

const PesquisarContainerScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const inspecaoData = route.params; // Recebe os dados passados

  const [modelContainer, setModelContainer] = useState('');
  const [tfcContainerInspecaoDto, setTfcContainerInspecaoDto] = useState(new TfcConteinerInspecaoDTO());
  const [inspecao, setInspecao] = useState(inspecaoData);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    //setModelContainer('TEMU8341842');
    
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
      const formatDate = (date) => {
        const parsedDate = new Date(date); // Garante que date é um objeto Date
        
        // Verifica se a data é inválida
        if (isNaN(parsedDate.getTime())) {
          return 'Data inválida'; // Retorna mensagem se a data não for válida
        }
      
        const day = String(parsedDate.getDate()).padStart(2, '0');
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0'); // Mês é zero-indexado
        const year = parsedDate.getFullYear();
        const hours = String(parsedDate.getHours()).padStart(2, '0');
        const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
      
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      };
      const isWithinTolerance = (startDate, endDate, startTolerance, endTolerance) => {
        const now = new Date();
        const startToleranceMillis = startTolerance * 60 * 1000;  // Converte a tolerância para milissegundos
        const endToleranceMillis = endTolerance * 60 * 1000;  // Converte a tolerância para milissegundos
      
        // Verifica se o agendamento está para hoje e se está dentro do intervalo de tolerância
        const lowerBound = new Date(startDate.getTime() - startToleranceMillis);
        const upperBound = new Date(endDate.getTime() + endToleranceMillis);
        // Verifica se a data e hora atuais estão dentro do intervalo permitido
        return now >= lowerBound && now <= upperBound;
      };

      const performSearch = async () => {
        try {
          setLoading(true);
          const result = await pesquisar(updatedDto); 
          
          if (
            result.START_DATE &&
            result.START_TOLERANCE &&
            isWithinTolerance(new Date(result.START_DATE), new Date(result.END_DATE), result.START_TOLERANCE, result.END_TOLERANCE)
          ) {

          setTfcContainerInspecaoDto(result);
          
          const updatedInspecao = {
            ...inspecao,
            tfcContainerInspecaoDto:  result
            
          };          
          updatedInspecao.checklist.menuL.forEach((eachObj) => {
            eachObj.isDadosPreenchidos = false;
          });
          
          //setInspecao(updatedInspecao);
          
          //Alert.alert('Success', 'Container encontrado!');
          navigation.navigate('MenuInspecao', updatedInspecao);
        }else{                    
          throw new Error(
            `${result.START_DATE == null ? 'Sem Agendamento. ' : ''}` +
            `${result.START_DATE ? `O Agendamento esta fora do horário permitido. Agendamento feito para o dia e hora: ${formatDate(result.START_DATE)}. ` : ''}`            
          );        
        }
        } catch (ex) {
          //console.error('Erro', ex);
          Alert.alert('Atenção', ex.message);
        } finally {
          setSearchTriggered(false);
          setLoading(false);
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
  onChangeText={(text) => setModelContainer(text.toUpperCase())}
  autoCapitalize="characters"
/>
      <TouchableOpacity style={styles.button} onPress={handlePesquisar}>
        <Text style={styles.buttonText}>Pesquisar</Text>
        {loading ? <ActivityIndicator color="#fff" /> : <Icon name="search" size={20} color="#fff" />}
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
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
});

export default PesquisarContainerScreen;

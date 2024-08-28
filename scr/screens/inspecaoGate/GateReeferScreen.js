import React, { useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import PageGateHeader from './GateHeaderScreen';
import { pesquisar, salvarReefer } from '../../services/container-service';
import { TfcConteinerInspecaoDTO } from '../../models/TfcConteinerInspecaoDTO';

const GateReeferScreen = ({ navigation, route }) => {
  const { inspecao } = route.params;
  const [loading, setLoading] = useState(false);
  const [temperature, setTemperature] = useState('');  
  const [genset, setGenset] = useState('');

  useEffect(() => {
    buscarDadosApi();
  }, []);
  
  
  const presentLoading = async () => {
    setLoading(true);
  };

  const dismissLoading = () => {
    setLoading(false);
  };

  const buscarDadosApi = async () => {
    await presentLoading();

    const result = await pesquisar(inspecao.tfcContainerInspecaoDto);
    
    inspecao.tfcContainerInspecaoDto = { ...new TfcConteinerInspecaoDTO(), ...result };
    console.log("inspecao.tfcContainerInspecaoDto.CESETTING", inspecao.tfcContainerInspecaoDto.CESETTING);    
    setGenset(inspecao.tfcContainerInspecaoDto.GENSET);
    const temperatureString = inspecao.tfcContainerInspecaoDto.CESETTING.toString();
    setTemperature(temperatureString);

    if (!inspecao.tfcContainerInspecaoDto.CESETTING && inspecao.tfcContainerInspecaoDto.CESETTING !== "") {
      Alert.alert("Atenção", "Não há previsão de temperatura para este conteiner", [{
        text: 'OK',
        onPress: () => navigation.navigate('MenuInspecao', { inspecao }),
      }]);
    }
  };

  const onConfirmar = async () => {
    if (!temperature || temperature == null || temperature === "") {
      Alert.alert("Atenção", "Informe os dados de Temperatura");
    } else {
      await presentLoading();
      inspecao.tfcContainerInspecaoDto.CESETTING = temperature;
      inspecao.tfcContainerInspecaoDto.GENSET = genset;

      salvarReefer(inspecao.tfcContainerInspecaoDto).then((result) => {
        navigation.navigate('MenuInspecao', { inspecao });
        dismissLoading();
      }).catch((err) => {
        dismissLoading();
        console.log("ERRO", err);
        Alert.alert("Atenção", "Erro ao salvar os dados");
      });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
        <Text style={styles.title}>{inspecao.tfcContainerInspecaoDto.NROCONTEINER}</Text>
        <Text style={styles.subtitle}>
          {inspecao.tfcContainerInspecaoDto.SIGLAMODALIDADE} {inspecao.tfcContainerInspecaoDto.SIGLAFREIGHTKIND}
        </Text>        
        <Text style={styles.subtitle}>{inspecao.checklistSelecionado.name}</Text>
        <Text style={styles.subtitle}>{inspecao.tfcContainerInspecaoDto.TRA}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>TEMPERATURA (°C)</Text>
            <TextInput
              style={styles.input}
              
              placeholder="TEMPERATURA (°C)"
              value={temperature}
              onChangeText={setTemperature}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>GENSET</Text>
            <TextInput
              style={styles.input}
              placeholder="GENSET"
              value={genset}
              onChangeText={setGenset}
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={onConfirmar}>
          <Text style={styles.confirmButtonText}>Confirmar</Text>          
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  form: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#022E69',
    padding: 16,
    borderRadius: 5,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
});

export default GateReeferScreen;

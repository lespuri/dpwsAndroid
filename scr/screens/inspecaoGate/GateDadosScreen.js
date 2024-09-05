import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ContainerServiceProvider } from '../services/container-service';
import { editar } from '../../services/container-service';
import { TfcConteinerInspecaoDTO } from '../../models/TfcConteinerInspecaoDTO';
import { Inspecao } from '../models/inspecao.model';
import { MenuInspecaoScreen } from './MenuInspecaoScreen'; // Certifique-se de que este caminho está correto
import { INSPECAO_PAGE_CONFIG } from '../utils/constants.page';

const GateDadosScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [inspecao, setInspecao] = useState(route.params.inspecao);
  const [longarinaSelecionado, setLongarinaSelecionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  const longarinaOptions = [
    { id: "99", label: '" "' },
    { id: "0", label: "S LONG INFERIOR - Container sem longarina inferior" },
    { id: "1", label: "S LONG SUPERIOR - Container sem longarina superior" },
    { id: "2", label: "S LONGARINA - Container sem longarinas" },
    { id: "3", label: "C LONGARINA - Container com longarinas" },
  ];

  useEffect(() => {
    if (inspecao.tfcContainerInspecaoDto.LONGARINA) {
      const longarina = longarinaOptions.find(option => parseInt(option.id) === parseInt(inspecao.tfcContainerInspecaoDto.LONGARINAENUM));
      setLongarinaSelecionado(longarina || longarinaOptions[0]);
    } else {
      setLongarinaSelecionado(longarinaOptions[0]);
    }
    //console.log("shouldNavigate");
    //console.log("shouldNavigate > valor", shouldNavigate);
    if (shouldNavigate) {
      console.log("Gate Dados Navigate", inspecao.tfcContainerInspecaoDto);
      navigation.replace('MenuInspecao', inspecao);
      setShouldNavigate(false); // Reseta o estado para evitar navegações repetidas
    }


  }, [inspecao]);

  const handleConfirmar = async () => {
    
    //const filtered = inspecao.checklist.menuL.filter(item => item.page.includes('GateDados'));
        
    setLoading(true);
    try {
      if (longarinaSelecionado && longarinaSelecionado.id) {
        inspecao.tfcContainerInspecaoDto.LONGARINA = parseInt(longarinaSelecionado.id);
        inspecao.tfcContainerInspecaoDto.LONGARINAENUM = longarinaSelecionado.id;
      }
      
      const result = await editar(inspecao.tfcContainerInspecaoDto);
      console.log("result", result);
      const updatedMenuL = inspecao.checklist.menuL.map(item => {
        if (item.page.includes("GateDados")) {
          return { ...item, isDadosPreenchidos: true }; // Altera o isDadosPreenchidos para true
        }
        return item;
      });
  
      setShouldNavigate(true);
      
      setInspecao(prevInspecao => ({
        ...prevInspecao,
        checklist: { 
          ...prevInspecao.checklist, 
          menuL: updatedMenuL 
        },
        tfcContainerInspecaoDto:  result
      }));      
      
      
      //navigation.navigate('MenuInspecao', inspecao);
      
    } catch (error) {
      console.log("editar Dado", error);
      Alert.alert('Erro', error.toString());
    } finally {
      setLoading(false);
    }
  };

  const renderLongarinaItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setLongarinaSelecionado(item);
        setModalVisible(false);
      }}
    >
      <Text style={styles.modalItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{inspecao.tfcContainerInspecaoDto.NROCONTEINER}</Text>
        <Text style={styles.subtitle}>
          {inspecao.tfcContainerInspecaoDto.SIGLAMODALIDADE} {inspecao.tfcContainerInspecaoDto.SIGLAFREIGHTKIND}
        </Text>
        <Text style={styles.subtitle}>{inspecao.tfcContainerInspecaoDto.TRA}</Text>
        <Text style={styles.subtitle}>{inspecao.checklistSelecionado.name}</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="ISO"
          value={inspecao.tfcContainerInspecaoDto.CODIGOISO}
          onChangeText={(text) => setInspecao({ ...inspecao, tfcContainerInspecaoDto: { ...inspecao.tfcContainerInspecaoDto, CODIGOISO: text } })}
          maxLength={4}
        />
        <TextInput
          style={styles.input}
          placeholder="TARA"
          value={inspecao.tfcContainerInspecaoDto.TARA.toString()}
          onChangeText={(text) => setInspecao({ ...inspecao, tfcContainerInspecaoDto: { ...inspecao.tfcContainerInspecaoDto, TARA: text } })}
        />
        <TextInput
          style={styles.input}
          placeholder="SAFE WEIGHT"
          value={inspecao.tfcContainerInspecaoDto.SAFEWEIGHT.toString()}
          onChangeText={(text) => setInspecao({ ...inspecao, tfcContainerInspecaoDto: { ...inspecao.tfcContainerInspecaoDto, SAFEWEIGHT: text } })}
        />

        <TouchableOpacity style={styles.select} onPress={() => setModalVisible(true)}>
          <Text>{longarinaSelecionado ? longarinaSelecionado.label : 'Selecionar Longarina'}</Text>
          <Icon name="angle-down" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleConfirmar}>
        <Text style={styles.buttonText}>Confirmar</Text>
        {loading ? <ActivityIndicator color="#fff" /> : <Icon name="arrow-right" size={20} color="#fff" />}
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <FlatList
              data={longarinaOptions}
              renderItem={renderLongarinaItem}
              keyExtractor={(item) => item.id.toString()}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
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
    flex: 1,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  select: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#022E69',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalItemText: {
    fontSize: 16,
  },
  modalCloseButton: {
    backgroundColor: '#022E69',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default GateDadosScreen;

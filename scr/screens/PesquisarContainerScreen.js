import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { pesquisar } from '../services/container-service';
import { TfcConteinerInspecaoDTO } from '../models/TfcConteinerInspecaoDTO';

const PesquisarContainerScreen = () => {
  const [modelContainer, setModelContainer] = useState('');
  const [tfcContainerInspecaoDto, setTfcContainerInspecaoDto] = useState(new TfcConteinerInspecaoDTO());

  const handlePesquisar = async () => {
    try {
      const result = await pesquisar(tfcContainerInspecaoDto);
      Alert.alert('Success', 'Container encontrado!');
      // Continue com a lógica de sucesso...
    } catch (error) {
      console.log(error);
      //"Message": "Número do contêiner sem sigla ou incompleto!"
      Alert.alert('Erro', error.Message);
    }
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

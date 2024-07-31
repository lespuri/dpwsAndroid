import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Alert, Modal, StyleSheet, KeyboardAvoidingView, Platform, PermissionsAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import { ContainerServiceProvider } from '../services/container-service';
import { TfcConteinerInspecaoDTO } from '../../models/TfcConteinerInspecaoDTO';

const GateLacresScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [inspecao, setInspecao] = useState(route.params.inspecao);
  const [lacrePrevistoConfirmadoL, setLacrePrevistoConfirmadoL] = useState([]);
  const [outrosLacresL, setOutrosLacresL] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);

  useEffect(() => {
    setLacrePrevistoConfirmadoL(inspecao.lacrePrevistoConfirmadoL || []);
    setOutrosLacresL(inspecao.outrosLacresL || []);
  }, [inspecao]);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Permissão de Câmera",
          message: "O aplicativo precisa de acesso à câmera para tirar fotos.",
          buttonNeutral: "Pergunte-me depois",
          buttonNegative: "Cancelar",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const goToCamera = async (lacre) => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert("Permissão de câmera negada", "Você precisa conceder permissão para usar a câmera.");
      return;
    }

    try {
      const result = await ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: true,
      });

      if (result) {
        lacre.imagem = { url: result.path };
        setOutrosLacresL([...outrosLacresL]);
      }
    } catch (error) {
      console.log('Error opening camera: ', error);
    }
  };

  const confirmarLacre = (lacre) => {
    // Lógica para confirmar lacre
  };

  const confirmarLacrePrevisto = (lacre) => {
    // Lógica para confirmar lacre previsto
  };

  const showModal = (index, url) => {
    setCurrentImageIndex(index);
    setCurrentImageUrl(url);
    setModalVisible(true);
  };

  const removerImagemLacre = (lacre) => {
    lacre.imagem = null;
    setOutrosLacresL([...outrosLacresL]);
  };

  const removerLacre = (index) => {
    const updatedLacres = [...outrosLacresL];
    updatedLacres.splice(index, 1);
    setOutrosLacresL(updatedLacres);
  };

  const adicionarOutroLacre = () => {
    setOutrosLacresL([...outrosLacresL, { lacre: '', imagem: null }]);
  };

  const goToGateSemLacre = () => {
    // Lógica para ir para gate sem lacre
  };

  const isSemLacre = () => {
    return inspecao.tfcConteinerFinalizarInspecaoDTO &&
      inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO &&
      inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.SEMLACRE === 1;
  };

  const removerSemLacre = () => {
    // Lógica para remover sem lacre
  };

  const finalizarLacre = () => {
    // Lógica para finalizar lacre
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{inspecao.tfcContainerInspecaoDto.NROCONTEINER}</Text>
        <Text style={styles.subtitle}>{`${inspecao.tfcContainerInspecaoDto.SIGLAMODALIDADE} ${inspecao.tfcContainerInspecaoDto.SIGLAFREIGHTKIND}`}</Text>
        <Text style={styles.subtitle}>{inspecao.tfcContainerInspecaoDto.TRA}</Text>
        <Text style={styles.subtitle}>{inspecao.checklistSelecionado.name}</Text>
      </View>

      <View style={styles.form}>
        <FlatList
          data={lacrePrevistoConfirmadoL}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View key={index} style={styles.item}>
              <Text style={styles.label}>{`LACRE ${item.status.toUpperCase()} (${index + 1})`}</Text>
              <TextInput style={styles.input} value={item.lacre} editable={false} />
              {item.status === 'previsto' ? (
                <Icon name="check-circle" size={24} color="orange" onPress={() => confirmarLacre(item)} />
              ) : (
                <Icon name="close" size={24} color="red" onPress={() => confirmarLacrePrevisto(item)} />
              )}
              {!item.imagem?.url && (
                <Icon name="camera" size={24} color="blue" onPress={() => goToCamera(item)} />
              )}
              {item.imagem?.url && (
                <TouchableOpacity onPress={() => showModal(index, item.imagem.url)}>
                  <Image source={{ uri: item.imagem.url }} style={styles.image} />
                </TouchableOpacity>
              )}
              {item.imagem?.url && (
                <TouchableOpacity onPress={() => removerImagemLacre(item)}>
                  <Icon name="close" size={24} color="red" />
                </TouchableOpacity>
              )}
            </View>
          )}
        />
        <FlatList
          data={outrosLacresL}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View key={index} style={styles.item}>
              <Text style={styles.label}>{`OUTRO LACRE (${index + 1})`}</Text>
              <TextInput
                style={styles.input}
                value={item.lacre}
                onChangeText={(text) => {
                  const updatedLacres = [...outrosLacresL];
                  updatedLacres[index].lacre = text;
                  setOutrosLacresL(updatedLacres);
                }}
              />
              {!item.imagem?.url && (
                <Icon name="camera" size={24} color="blue" onPress={() => goToCamera(item)} />
              )}
              {item.imagem?.url && (
                <TouchableOpacity onPress={() => showModal(index, item.imagem.url)}>
                  <Image source={{ uri: item.imagem.url }} style={styles.image} />
                </TouchableOpacity>
              )}
              {item.imagem?.url && (
                <TouchableOpacity onPress={() => removerLacre(index)}>
                  <Icon name="close" size={24} color="red" />
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={adicionarOutroLacre}>
        <Text style={styles.buttonText}>Adicionar Outro Lacre</Text>
      </TouchableOpacity>

      {isSemLacre() && (
        <TouchableOpacity style={styles.button} onPress={goToGateSemLacre}>
          <Text style={styles.buttonText}>Sem Lacre</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.button} onPress={finalizarLacre}>
        <Text style={styles.buttonText}>Confirmar</Text>
        <Icon name="arrow-right" size={20} color="#fff" />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {currentImageUrl && (
              <Image source={{ uri: currentImageUrl }} style={styles.modalImage} />
            )}
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
  item: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  button: {
    backgroundColor: '#022E69',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
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
  modalImage: {
    width: '100%',
    height: 400,
    resizeMode: 'contain',
    marginBottom: 16,
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

export default GateLacresScreen;

import React, { useState, useEffect, useRef } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Camera, useCameraDevices } from 'react-native-vision-camera';

const GateLacresScreen = ({ navigation, route }) => {
  const { inspecao } = route.params;
  const [lacrePrevistoConfirmadoL, setLacrePrevistoConfirmadoL] = useState([]);
  const [outrosLacresL, setOutrosLacresL] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const cameraRef = useRef(null);

  const devices = useCameraDevices();
  const device = devices.back || devices.find(dev => dev.position === 'back');

  useEffect(() => {
    setLacrePrevistoConfirmadoL(inspecao.lacrePrevistoConfirmadoL || []);
    setOutrosLacresL(inspecao.outrosLacresL || []);
  }, []);

  const goToCamera = (item) => {
    setCurrentImageIndex(outrosLacresL.indexOf(item));
    setCameraVisible(true);
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePhoto({
        flash: 'auto',
        qualityPrioritization: 'balanced',
        skipMetadata: true,
      });
      console.log("photo.path", photo.path);
      const updatedLacres = [...outrosLacresL];
      updatedLacres[currentImageIndex].imagem = { uri: `file://${photo.path}` }; // Prefixar com file://
      setOutrosLacresL(updatedLacres);
      setCameraVisible(false);      
    }
  };

  const showModal = (index, imageUrl) => {
    setCurrentImageIndex(index);
    setCurrentImageUrl(imageUrl);
    setModalVisible(true);
  };

  const removerImagemLacre = (item) => {
    const updatedLacres = [...lacrePrevistoConfirmadoL];
    const index = updatedLacres.indexOf(item);
    updatedLacres[index].imagem = null;
    setLacrePrevistoConfirmadoL(updatedLacres);
  };

  const removerLacre = (item) => {
    const updatedLacres = [...outrosLacresL];
    const index = updatedLacres.indexOf(item);
    updatedLacres.splice(index, 1);
    setOutrosLacresL(updatedLacres);
  };

  const adicionarOutroLacre = () => {
    setOutrosLacresL([...outrosLacresL, { lacre: '', imagem: null }]);
  };

  const handleConfirmarLacre = (item) => {
    const updatedLacres = lacrePrevistoConfirmadoL.map((lacre) => {
      if (lacre === item) {
        lacre.status = lacre.status === 'previsto' ? 'confirmado' : 'previsto';
      }
      return lacre;
    });
    setLacrePrevistoConfirmadoL(updatedLacres);
  };

  const handleFinalizarLacre = async () => {
    try {
      const lacreConfirmadoL = lacrePrevistoConfirmadoL.filter(lacre => lacre.status === "confirmado");
      const lacrePrevistoL = lacrePrevistoConfirmadoL.filter(lacre => lacre.status === "previsto");

      if (!inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.SEMLACRE && lacreConfirmadoL.length === 0 && outrosLacresL.length === 0) {
        Alert.alert("Atenção", "Confirme ou preencha um Lacre");
        return;
      } else if (!inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.SEMLACRE && !isLacreValido()) {
        Alert.alert("Atenção", "Prencha o número dos Lacres que estão com foto");
        return;
      }

      inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.CONFIRMADOS = lacreConfirmadoL.map(lacre => lacre.lacre).join(",");
      inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.NOVOS = outrosLacresL.map(lacre => lacre.lacre).join(",");
      inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.TFCCONTEINERINSPECAOID = inspecao.tfcContainerInspecaoDto.TFCCONTEINERINSPECAOID;

      await ContainerServiceProvider.salvar(inspecao.tfcConteinerFinalizarInspecaoDTO);
      await uploadFiles();
    } catch (err) {
      console.log("ERRO", err);
      Alert.alert("Atenção", err.message);
    }
  };

  const isLacreValido = () => {
    return outrosLacresL.every(element => element.lacre || !isLacreImagem(element));
  };

  const isLacreImagem = (lacre) => {
    return lacre.imagem && lacre.imagem.uri;
  };

  const uploadFiles = async () => {
    try {
      let isOccurredError = false;
      let isHasImage = false;
      const imagemUploadL = [...outrosLacresL, ...getLacreConfirmado()];

      for (const lacre of imagemUploadL) {
        if (isLacreImagem(lacre)) {
          isHasImage = true;
          try {
            await uploadImagem(inspecao.tfcContainerInspecaoDto, lacre.lacre, lacre.imagem);
          } catch (err) {
            isOccurredError = true;
            console.log("uploadImagem ERRO", err);
            Alert.alert("Atenção", err.message);
            break;
          }
        }
      }

      if (!isOccurredError) {
        navigation.navigate('MenuInspecaoScreen', { inspecao });
      }
    } catch (err) {
      console.log("ERRO", err);
      Alert.alert("Atenção", err.message);
    }
  };

  const getLacreConfirmado = () => {
    return lacrePrevistoConfirmadoL.filter(lacre => lacre.status === "confirmado");
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
                <Icon name="check-circle" size={24} color="orange" onPress={() => handleConfirmarLacre(item)} />
              ) : (
                <Icon name="close" size={24} color="red" onPress={() => handleConfirmarLacrePrevisto(item)} />
              )}
              {!item.imagem?.uri && (
                <Icon name="camera" size={24} color="blue" onPress={() => goToCamera(item)} />
              )}
              {item.imagem?.uri && (
                <TouchableOpacity onPress={() => showModal(index, item.imagem.uri)}>
                  <Image source={{ uri: item.imagem.uri }} style={styles.image} />
                </TouchableOpacity>
              )}
              {item.imagem?.uri && (
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
              <Text style={styles.label}>OUTRO LACRE</Text>
              <TextInput
                style={styles.input}
                value={item.lacre}
                onChangeText={(text) => {
                  const updatedLacres = [...outrosLacresL];
                  updatedLacres[index].lacre = text;
                  setOutrosLacresL(updatedLacres);
                }}
              />
              {!item.imagem?.uri && (
                <Icon name="camera" size={24} color="blue" onPress={() => goToCamera(item)} />
              )}
              {item.imagem?.uri && (
                <TouchableOpacity onPress={() => showModal(index, item.imagem.uri)}>
                  <Image source={{ uri: item.imagem.uri }} style={styles.image} />
                </TouchableOpacity>
              )}
              {item.imagem?.uri && (
                <TouchableOpacity onPress={() => removerLacre(item)}>
                  <Icon name="close" size={24} color="red" />
                </TouchableOpacity>
              )}
            </View>
          )}
        />
        <TouchableOpacity style={styles.button} onPress={adicionarOutroLacre}>
          <Text style={styles.buttonText}>Adicionar Lacre</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.finalizarButton} onPress={handleFinalizarLacre}>
        <Text style={styles.finalizarButtonText}>Finalizar</Text>
      </TouchableOpacity>

      {cameraVisible && (
        <Modal animationType="slide" transparent={true} visible={cameraVisible}>
          <View style={styles.cameraContainer}>
            {device && (
              <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={cameraVisible}
                photo
              />
            )}
            <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
              <Text style={styles.captureButtonText}>Capturar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {modalVisible && (
        <Modal animationType="slide" transparent={true} visible={modalVisible}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Image source={{ uri: currentImageUrl }} style={styles.modalImage} />
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
  },
  form: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  input: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 8,
  },
  button: {
    backgroundColor: '#022E69',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  finalizarButton: {
    backgroundColor: '#022E69',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 16,
  },
  finalizarButtonText: {
    color: '#fff',
    fontSize: 16,
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
  modalImage: {
    width: '100%',
    height: 400,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  captureButton: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#022E69',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default GateLacresScreen;

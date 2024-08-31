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
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { salvar, buscarImagem, uploadImagem } from '../../services/container-service';
import { buscar } from '../../services/imo-service';
import { TfcConteinerInspecaoIMODTO } from '../../models/TfcConteinerInspecaoIMODTO';

const PatioImoScreen = ({ navigation, route }) => {
  const { inspecao } = route.params;
  const [imoConfirmadoL, setImoConfirmadoL] = useState([]);
  const [imoAguardandoL, setImoAguardandoL] = useState([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const cameraRef = useRef(null);

  const devices = useCameraDevices();
  const device = devices.back || devices.find(dev => dev.position === 'back');

  useEffect(() => {
    buscarDadosApi();
  }, []);

  const buscarDadosApi = async () => {
    try {
      
      const result = await buscar(inspecao.tfcContainerInspecaoDto);
      const imoDbL = [...result];
      
      const confirmados = [];
      const aguardando = [];

      imoDbL.forEach((imo) => {
        imo.isReadOnly = true;
        imo.Confirmado = imo.TFCCONTEINERINSPECAOIMOID !== 0 ? "1" : "0";
        if (isImoConfirmado(imo)) {
          confirmados.push(imo);
        } else {
          aguardando.push(imo);
        }
        buscarImagensApi(imo);
      });

      const quantidadeFaltante = 6 - (confirmados.length + aguardando.length);
      for (let i = 0; i < quantidadeFaltante; i++) {
        console.log("aguardando.push", aguardando);
        aguardando.push(new TfcConteinerInspecaoIMODTO());
        console.log("Pos > aguardando.push", aguardando);
      }
      
      
      setImoConfirmadoL(confirmados);
      setImoAguardandoL(aguardando);
      
    } catch (err) {
      console.error("ERRO", err);
      Alert.alert("Atenção", "Erro ao buscar dados da API.");
    }
  };

  const isImoConfirmado = (imo) => {
    return imo.Confirmado === "1" || (imo.TFCCONTEINERINSPECAOIMOID !== 0 && imo.TFCCONTEINERINSPECAOIMOID !== 0.0);
  };

  const buscarImagensApi = async (imo) => {
    try {
      const result = await buscarImagem(imo);
      imo.imagemL = result;
    } catch (err) {
      console.error("ERRO", err);
      Alert.alert("Atenção", "Erro ao buscar imagens da API.");
    }
  };

  const goToCamera = (imo) => {
    setCurrentImageIndex(imoAguardandoL.indexOf(imo));
    setCameraVisible(true);
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePhoto({
        flash: 'auto',
        qualityPrioritization: 'balanced',
        skipMetadata: true,
      });
      const updatedImos = [...imoAguardandoL];
      const imo = updatedImos[currentImageIndex];
      if (!imo.imagemL) {
        imo.imagemL = [];
      }
      imo.imagemL.push({ uri: `file://${photo.path}` });
      setImoAguardandoL(updatedImos);
      setCameraVisible(false);
    }
  };

  const showModal = (index, imageUrl) => {
    setCurrentImageIndex(index);
    setCurrentImageUrl(imageUrl);
  };

  const removerImagemImo = (imo, image) => {
    const updatedImos = [...imoConfirmadoL];
    const index = updatedImos.indexOf(imo);
    updatedImos[index].imagemL = updatedImos[index].imagemL.filter(img => img !== image);
    setImoConfirmadoL(updatedImos);
  };

  const adicionarImo = (imo) => {
    if (isImoCompleto(imo)) {
      const updatedAguardando = imoAguardandoL.filter(i => i !== imo);
      imo.Confirmado = "1";
      setImoAguardandoL(updatedAguardando);
      setImoConfirmadoL([...imoConfirmadoL, imo]);
    } else {
      Alert.alert("Atenção", "Preencha todos os dados do IMO para adicioná-lo.");
    }
  };

  const isImoCompleto = (imo) => {
    return imo.NROIMO && imo.UN && imo.SELO;
  };

  const handleFinalizarImo = async () => {
    try {
      const validacao = imoConfirmadoL.every(isImoCompleto);

      if (!validacao) {
        Alert.alert("Atenção", "Preencha todos os dados dos IMOs confirmados.");
        return;
      }

      // Monta o objeto a ser salvo
      const objSalvar = new TfcConteinerInspecaoIMODTO();
      objSalvar.NROIMO = imoConfirmadoL.map(imo => imo.NROIMO).join(",");
      objSalvar._UN = imoConfirmadoL.map(imo => imo.UN).join(",");
      objSalvar.SELO = imoConfirmadoL.map(imo => imo.SELO).join(",");
      objSalvar._ISSELOIMO = imoConfirmadoL.map(imo => imo.ISSELOIMO ? "1" : "0").join(",");
      objSalvar._TFCCONTEINERINSPECAOIMOID = imoConfirmadoL.map(imo => imo.TFCCONTEINERINSPECAOIMOID).join(",");
      objSalvar.TFCCONTEINERINSPECAOID = inspecao.tfcContainerInspecaoDto.TFCCONTEINERINSPECAOID;

      await salvar(objSalvar);
      await uploadFiles();
    } catch (err) {
      console.log("ERRO", err);
      Alert.alert("Atenção", err.message);
    }
  };

  const uploadFiles = async () => {
    try {
      let isOccurredError = false;
      for (const imo of imoConfirmadoL) {
        if (imo.imagemL && imo.imagemL.length) {
          for (const image of imo.imagemL) {
            try {
              await uploadImagem(inspecao.tfcContainerInspecaoDto, imo, image);
            } catch (err) {
              isOccurredError = true;
              console.log("uploadImagem ERRO", err);
              Alert.alert("Atenção", err.message);
              break;
            }
          }
        }
      }

      if (!isOccurredError) {
        navigation.navigate('MenuInspecao', { inspecao });
      }
    } catch (err) {
      console.log("ERRO", err);
      Alert.alert("Atenção", err.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{inspecao.tfcContainerInspecaoDto.NROCONTEINER}</Text>
        <Text style={styles.subtitle}>{`${inspecao.tfcContainerInspecaoDto.SIGLAMODALIDADE} ${inspecao.tfcContainerInspecaoDto.SIGLAFREIGHTKIND}`}</Text>
        <Text style={styles.subtitle}>{inspecao.tfcContainerInspecaoDto.TRA}</Text>
        <Text style={styles.subtitle}>{inspecao.checklistSelecionado.name}</Text>
      </View>
  
      <ScrollView style={styles.form}>
        <Text style={styles.sectionTitle}>IMO's Confirmados</Text>
        {imoConfirmadoL.map((imo, index) => (
          <View key={index} style={styles.item}>
            <TextInput
              style={styles.input}
              value={imo.NROIMO}
              editable={!imo.isReadOnly}
              placeholder="IMO"
              keyboardType="numeric"
            />
  
            <TextInput
              style={styles.input}
              value={imo.UN}
              editable={!imo.isReadOnly}
              placeholder="UN"
              keyboardType="numeric"
            />
  
            <TextInput
              style={styles.input}
              value={imo.SELO}
              placeholder="SELOS"
              keyboardType="numeric"
            />
  
            <TouchableOpacity style={styles.toggleButton}>
              <Icon name={imo.ISSELOIMO ? "toggle-on" : "toggle-off"} size={24} color="#333" />
            </TouchableOpacity>
  
            <TouchableOpacity style={styles.photoButton} onPress={() => goToCamera(imo)}>
              <Icon name="camera" size={24} color="#fff" />
            </TouchableOpacity>
  
            <TouchableOpacity style={styles.confirmButton} onPress={() => adicionarImo(imo)}>
              <Icon name="check-circle" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
  
        <Text style={styles.sectionTitle}>Aguardando Confirmação</Text>
        {imoAguardandoL.map((imo, index) => (
          <View key={index} style={styles.item}>
            <TextInput
              style={styles.input}
              value={imo.NROIMO}
              editable={!imo.isReadOnly}
              onChangeText={(text) => {
                const updatedImos = [...imoAguardandoL];
                updatedImos[index].NROIMO = text;
                setImoAguardandoL(updatedImos);
              }}
              placeholder="IMO"
              keyboardType="numeric"
            />
  
            <TextInput
              style={styles.input}
              value={imo.UN}
              editable={!imo.isReadOnly}
              onChangeText={(text) => {
                const updatedImos = [...imoAguardandoL];
                updatedImos[index].UN = text;
                setImoAguardandoL(updatedImos);
              }}
              placeholder="UN"
              keyboardType="numeric"
            />
  
            <TextInput
              style={styles.input}
              value={imo.SELO}
              onChangeText={(text) => {
                const updatedImos = [...imoAguardandoL];
                updatedImos[index].SELO = text;
                setImoAguardandoL(updatedImos);
              }}
              placeholder="SELOS"
              keyboardType="numeric"
            />
  
            <TouchableOpacity style={styles.toggleButton}>
              <Icon name={imo.ISSELOIMO ? "toggle-on" : "toggle-off"} size={24} color="#333" />
            </TouchableOpacity>
  
            <TouchableOpacity style={styles.photoButton} onPress={() => goToCamera(imo)}>
              <Icon name="camera" size={24} color="#fff" />
            </TouchableOpacity>
  
            <TouchableOpacity style={styles.confirmButton} onPress={() => adicionarImo(imo)}>
              <Icon name="check-circle" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
  
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
  
      {currentImageUrl && (
        <Modal animationType="slide" transparent={true} visible={!!currentImageUrl}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Image source={{ uri: currentImageUrl }} style={styles.modalImage} />
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setCurrentImageUrl(null)}>
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
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#022E69',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
  toggleButton: {
    padding: 10,
  },
  photoButton: {
    backgroundColor: '#D0021B',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: '#008000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
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
});


/*
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    flex: 1,
  },
  input: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
  button: {
    backgroundColor: '#022E69',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 8,
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
  imageWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 8,
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
});
*/
export default PatioImoScreen;

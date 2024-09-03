import React, { useState, useRef, useEffect } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator, // Importado para mostrar o indicador de carregamento
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { salvar, buscar, buscarImagem, uploadImagem } from '../../services/imo-service';
import TfcConteinerInspecaoIMODTO from '../../models/TfcConteinerInspecaoIMODTO';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import { launchCamera } from 'react-native-image-picker';

const GateImoScreen = ({ navigation, route }) => {
  const [inspecao, setInspecao] = useState(route.params.inspecao);
  const [modelUn, setModelUn] = useState('');
  const [imoConfirmadoL, setImoConfirmadoL] = useState([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [imageNovaL, setImageNovaL] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const cameraRef = useRef(null);
  const devices = useCameraDevices();
  const device = devices.back || devices.find(dev => dev.position === 'back');
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [loadingImo, setLoadingImo] = useState(true); // Estado de carregamento para a lista de IMOs

  useEffect(() => {    
    buscarDadosApi();
    requestCameraPermission();
  }, []);
  
  useEffect(() => {
    if(shouldNavigate)  {
      navigation.replace('MenuInspecao', inspecao);    
      setShouldNavigate(false);
    }
  }, [inspecao]);

  const requestCameraPermission = async () => {
    const permission = await Camera.getCameraPermissionStatus();
    if (permission !== 'granted') {
      const request = await Camera.requestCameraPermission();
      if (request !== 'granted') {
        Alert.alert('Permissão de Câmera Negada', 'Por favor, conceda permissão de acesso à câmera nas configurações do dispositivo.');
      }
    }
  };

  const buscarDadosApi = async () => {
    try {
      setLoadingImo(true); // Inicia o carregamento
      const result = await buscar(inspecao.tfcContainerInspecaoDto);    
      setImoConfirmadoL([]);
      for (const value of result) {
        const resultIm = await buscarImagem(value.TFCCONTEINERINSPECAOIMOID);
        setImoConfirmadoL(prevState => [
          ...prevState,
          { UN: value.UN, IMO: value.NROIMO, TFCCONTEINERINSPECAOIMOID: value.TFCCONTEINERINSPECAOIMOID, imagemL: resultIm }
        ]);
      }
    } catch (err) {
      console.log("ERRO", err);
      Alert.alert("Atenção", "Erro ao buscar dados da API.");
    } finally {
      setLoadingImo(false); // Termina o carregamento
    }
  };

  const onAdd = async () => {
    const isIMOImagem = imageNovaL != null && imageNovaL.length > 0;
    if (!modelUn) {
      Alert.alert("Atenção", "Selecione o IMO para adicionar");
    } else {
      try {
        inspecao.tfcConteinerInspecaoIMODTO = new TfcConteinerInspecaoIMODTO();
        inspecao.tfcConteinerInspecaoIMODTO.TIPOOPERACAO = inspecao.tfcContainerInspecaoDto.TIPO;
        inspecao.tfcConteinerInspecaoIMODTO.TFCCONTEINERINSPECAOID = inspecao.tfcContainerInspecaoDto.TFCCONTEINERINSPECAOID;
        inspecao.tfcConteinerInspecaoIMODTO.NextAction = "Incluir";
        inspecao.tfcConteinerInspecaoIMODTO.UN = modelUn;
        inspecao.tfcConteinerInspecaoIMODTO.NROIMO = inspecao.tfcContainerInspecaoDto.TFCCONTEINERINSPECAOID;
        inspecao.tfcConteinerInspecaoIMODTO.imagemL = imageNovaL;
  
        const result = await salvar(inspecao.tfcConteinerInspecaoIMODTO);
        await buscarDadosApi();
        if (inspecao.tfcConteinerInspecaoIMODTO.imagemL.length > 0 )
          await uploadImagem(inspecao.tfcContainerInspecaoDto, inspecao.tfcConteinerInspecaoIMODTO, imageNovaL[0]);

        setModelUn('');
        setImageNovaL([]);
      } catch (err) {
        console.log("ERRO", err);
        Alert.alert("Atenção", err.toString());
      }
    }
  };
  
  const onRemove = async (imo) => {
    try {
      inspecao.tfcConteinerInspecaoIMODTO = new TfcConteinerInspecaoIMODTO();
      inspecao.tfcConteinerInspecaoIMODTO.TIPOOPERACAO = inspecao.tfcContainerInspecaoDto.TIPO;
      inspecao.tfcConteinerInspecaoIMODTO.TFCCONTEINERINSPECAOID = inspecao.tfcContainerInspecaoDto.TFCCONTEINERINSPECAOID;
      inspecao.tfcConteinerInspecaoIMODTO.NextAction = "Excluir";
      inspecao.tfcConteinerInspecaoIMODTO.TFCCONTEINERINSPECAOIMOID = imo.TFCCONTEINERINSPECAOIMOID;

      await salvar(inspecao.tfcConteinerInspecaoIMODTO);
      await buscarDadosApi();
    } catch (err) {
      console.log("ERRO", err);
      Alert.alert("Atenção", "Erro ao excluir o IMO.");
    }
  };

  const captureImageWithCamera = () => {
    const options = {
      mediaType: 'photo',
      saveToPhotos: true,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.error) {
        console.log('Camera Error: ', response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        setImageNovaL([...imageNovaL, { uri: source.uri }]);
      }
    });
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePhoto({
        flash: 'auto',
        qualityPrioritization: 'balanced',
      });

      const fileUri = `file://${photo.path}`;
      const fileStat = await RNFS.stat(fileUri);

      const MAX_SIZE_MB = 3;
      const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

      if (fileStat.size > MAX_SIZE_BYTES) {
        const resizedImage = await ImageResizer.createResizedImage(
          fileUri,
          800,
          600,
          'JPEG',
          80
        );

        setImageNovaL([...imageNovaL, { uri: resizedImage.uri }]);
      } else {
        setImageNovaL([...imageNovaL, { uri: fileUri }]);
      }

      setCameraVisible(false);
    }
  };

  const showModal = (url) => {
    setCurrentImageUrl(url);
    setModalVisible(true);
  };

  const confirmarImo = async () => {
    try {
      const dto = imoConfirmadoL;
      
      const updatedMenuL = inspecao.checklist.menuL.map(item => {
        if (item.page.includes("GateIMO")) {
          return { ...item, isDadosPreenchidos: true };
        }
        return item;
      });
  
      setShouldNavigate(true);
      setInspecao(prevInspecao => ({
            ...prevInspecao,
            checklist: { ...prevInspecao.checklist, menuL: updatedMenuL }
          }));
        
    } catch (err) {
      Alert.alert("Erro", err.toString());
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{inspecao.tfcContainerInspecaoDto.NROCONTEINER}</Text>
        <Text style={styles.subtitle}>
          {inspecao.tfcContainerInspecaoDto.SIGLAMODALIDADE} {inspecao.tfcContainerInspecaoDto.SIGLAFREIGHTKIND}
        </Text>        
        <Text style={styles.subtitle}>{inspecao.checklistSelecionado.name}</Text>
        <Text style={styles.subtitle}>{inspecao.tfcContainerInspecaoDto.TRA}</Text>
      </View>

      <FlatList
        data={imoConfirmadoL}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="ADICIONAR UN"
              keyboardType="numeric"
              value={modelUn}
              onChangeText={setModelUn}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.button} onPress={captureImageWithCamera}>
                <Text style={styles.buttonText}>Fotos</Text>
                <Icon name="camera" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={onAdd}>
                <Text style={styles.buttonText}>Adicionar</Text>
                <Icon name="plus" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {imageNovaL.length > 0 && (
            <View style={styles.imageGrid}>
                {imageNovaL.map((imagem, index) => (
                <View key={index} style={styles.imageContainer}>
                    <TouchableOpacity onPress={() => showModal(imagem.uri)}>
                    <Image source={{ uri: imagem.uri }} 
                    style={styles.image} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => removeImage(index)}>
                    <Icon name="trash" size={24} color="red" />
                    </TouchableOpacity>
                </View>
                ))}
            </View>
)}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.label}>UN: {item.UN}</Text>
            <Text style={styles.label}>IMO: {item.IMO}</Text>
            <Icon name="close" size={24} color="red" onPress={() => onRemove(item)} />
            {item.imagemL && item.imagemL.length > 0 && (
              <View style={styles.imageGrid}>
                {item.imagemL.map((imagem, index) => (
                  <TouchableOpacity key={index} onPress={() => showModal(imagem.CAMINHO)}>
                    <Image source={{ uri: imagem.CAMINHO }} style={styles.image} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          loadingImo ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text>Carregando IMO...</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>Nenhum IMO confirmado.</Text>
          )
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity style={styles.finalizarButton} onPress={confirmarImo}>
              <Text style={styles.finalizarButtonText}>Confirmar</Text>
              <Icon name="forward" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        }
      />

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
  container: { flex: 1, backgroundColor: '#fff' },
  form: { marginBottom: 16 },
  input: { borderColor: '#ccc', borderWidth: 1, borderRadius: 5, padding: 10, marginVertical: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flex: 1, backgroundColor: '#022E69', padding: 10, borderRadius: 5, alignItems: 'center', marginHorizontal: 8 },
  buttonText: { color: '#fff', fontSize: 16 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  label: { fontSize: 16 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: 10 },
  image: { width: 100, height: 100, margin: 5 },
  footer: { padding: 16, borderTopWidth: 1, borderColor: '#ccc' },
  finalizarButton: { backgroundColor: '#022E69', padding: 16, borderRadius: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  finalizarButtonText: { color: '#fff', fontSize: 16, marginRight: 8 },
  cameraContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' },
  captureButton: { position: 'absolute', bottom: 30, left: '50%', transform: [{ translateX: -50 }], backgroundColor: '#022E69', padding: 10, borderRadius: 5, alignItems: 'center' },
  captureButtonText: { color: '#fff', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', backgroundColor: '#fff', borderRadius: 8, padding: 16 },
  modalImage: { width: '100%', height: 400, resizeMode: 'contain', marginBottom: 16 },
  modalCloseButton: { backgroundColor: '#022E69', padding: 10, borderRadius: 5, alignItems: 'center' },
  modalCloseButtonText: { color: '#fff', fontSize: 16 },
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
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default GateImoScreen;

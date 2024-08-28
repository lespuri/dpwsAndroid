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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SelectDropdown from 'react-native-select-dropdown';
import { Camera, useCameraDevices, CameraPermissionStatus  } from 'react-native-vision-camera';
import PageGateHeader from './GateHeaderScreen';
import { salvar, buscar, buscarImagem, uploadImagem } from '../../services/imo-service';
import TfcConteinerInspecaoIMODTO from '../../models/TfcConteinerInspecaoIMODTO';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';

const GateImoScreen = ({ navigation, route }) => {
  const { inspecao } = route.params;
  const [modelUn, setModelUn] = useState('');
  const [imoConfirmadoL, setImoConfirmadoL] = useState([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [imageNovaL, setImageNovaL] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const cameraRef = useRef(null);
  const devices = useCameraDevices();
  const device = devices.back || devices.find(dev => dev.position === 'back');
  

  useEffect(() => {
    
    buscarDadosApi();
    requestCameraPermission();
    
    return () => {
      // Cleanup if necessary
    };
  }, []);

  const requestCameraPermission = async () => {
    const permission = await Camera.getCameraPermissionStatus();
    console.log(permission);
    if (permission !== 'granted') {
      const request = await Camera.requestCameraPermission();
      if (request !== 'granted') {
        Alert.alert('Permissão de Câmera Negada', 'Por favor, conceda permissão de acesso à câmera nas configurações do dispositivo.');
      }
    }
  };

  const buscarDadosApi = async () => {
    const result = await buscar(inspecao.tfcContainerInspecaoDto);    
    setImoConfirmadoL([]);
    result.forEach(async (value) => {
        const resultIm = await buscarImagem(value.TFCCONTEINERINSPECAOIMOID);
      setImoConfirmadoL(prevState => [
        ...prevState,
        { UN: value.UN, IMO: value.NROIMO, TFCCONTEINERINSPECAOIMOID: value.TFCCONTEINERINSPECAOIMOID, imagemL: resultIm }
      ]);
      
    });

    
  };

  const buscarDadosApiOld = async () => {
    
    const result = await buscar(inspecao.tfcContainerInspecaoDto);
    console.log("buscarDadosApi", result);
    result.forEach(async (value) => {
        
        setImoConfirmadoL([...imoConfirmadoL, { UN: value.UN, IMO: value.NROIMO, TFCCONTEINERINSPECAOIMOID: value.TFCCONTEINERINSPECAOIMOID , imagemL: imageNovaL }]);
        //const resultIm = await buscarImagem(value);
        //setImageNovaL([...imageNovaL, { uri: `file://{photo.path}` }]);        
        //console.log("result.forEach", imageNovaL);
    });
    
    
  };

  const buscarImagensApi = async(imo) => {
    console.log(" buscando imagens api ...");

    this.imoService.buscarImagem(imo).then((result) => {
        console.log("this.buscarImagensApi finalizado", result);

        imo.imagemL = result;
    }, (err) => {
        this.loading.dismiss();

        console.log(" ERRO", err);

        this.alert.present("Atenção", this.extractErrorMessage(err), []);
    });
}

const onAdd = async () => {
    const isIMOImagem = imageNovaL != null && imageNovaL.length > 0;
    console.log("onAdd");
    if (!modelUn) {
      Alert.alert("Atenção", "Selecione o IMO para adicionar");
    } else {
      try {
        // Mostra o loading
        
        inspecao.tfcConteinerInspecaoIMODTO = new TfcConteinerInspecaoIMODTO();
        inspecao.tfcConteinerInspecaoIMODTO.TIPOOPERACAO = inspecao.tfcContainerInspecaoDto.TIPO;
        inspecao.tfcConteinerInspecaoIMODTO.TFCCONTEINERINSPECAOID = inspecao.tfcContainerInspecaoDto.TFCCONTEINERINSPECAOID;
        inspecao.tfcConteinerInspecaoIMODTO.NextAction = "Incluir";
        inspecao.tfcConteinerInspecaoIMODTO.UN = modelUn;
        inspecao.tfcConteinerInspecaoIMODTO.NROIMO = inspecao.tfcContainerInspecaoDto.TFCCONTEINERINSPECAOID;
        inspecao.tfcConteinerInspecaoIMODTO.imagemL = imageNovaL;
  
        
        const result = await salvar(inspecao.tfcConteinerInspecaoIMODTO);
        
        await buscarDadosApi();
        // Upload de arquivos
        await uploadImagem(inspecao.tfcContainerInspecaoDto, result, imageNovaL[0]);
  //(container, imo, imagem)
        setModelUn('');
        setImageNovaL([]);
        
      } catch (err) {
        console.log("ERRO", err);
        Alert.alert("Atenção", err.toString());
      } finally {
        dismissLoading();
      }
    }
  };
  
  const onRemove = async (imo) => {
    try {
      // Preparar os dados para exclusão      

      inspecao.tfcConteinerInspecaoIMODTO = new TfcConteinerInspecaoIMODTO();
      inspecao.tfcConteinerInspecaoIMODTO.TIPOOPERACAO = inspecao.tfcContainerInspecaoDto.TIPO;
      inspecao.tfcConteinerInspecaoIMODTO.TFCCONTEINERINSPECAOID = inspecao.tfcContainerInspecaoDto.TFCCONTEINERINSPECAOID;
      inspecao.tfcConteinerInspecaoIMODTO.NextAction = "Excluir";
      inspecao.tfcConteinerInspecaoIMODTO.TFCCONTEINERINSPECAOIMOID = imo.TFCCONTEINERINSPECAOIMOID;
    console.log("onRemove");    
      // Chama o serviço para salvar (excluir)
      await salvar(inspecao.tfcConteinerInspecaoIMODTO);
  
      // Atualiza os dados após exclusão
      await buscarDadosApi();
    } catch (err) {
      console.log("ERRO", err);
      Alert.alert("Atenção", extractErrorMessage(err));
    }
  };
  const adicionarImo = () => {
    if (modelUn) {
      setImoConfirmadoL([...imoConfirmadoL, { UN: modelUn, imagemL: imageNovaL }]);
      setModelUn('');
      setImageNovaL([]);
    }
  };

  const removeImage = (index) => {
    //console.log("removeImage", imo);
    //setImoConfirmadoL(imoConfirmadoL.filter(item => item !== imo));
    setImageNovaL(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const goToCamera = async () => {
    setCameraVisible(true);
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
        const photo = await cameraRef.current.takePhoto({
          flash: 'auto',
          qualityPrioritization: 'balanced',
        });
    
        // Obtenha o caminho do arquivo
        const fileUri = `file://${photo.path}`;
    
        // Verifique o tamanho da imagem
        const fileStat = await RNFS.stat(fileUri);
    
        const MAX_SIZE_MB = 3;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    
        if (fileStat.size > MAX_SIZE_BYTES) {
          // Redimensione a imagem para uma resolução menor
          const resizedImage = await ImageResizer.createResizedImage(
            fileUri,
            800, // nova largura
            600, // nova altura
            'JPEG', // formato
            80 // qualidade
          );
    
          // Substitua o caminho original pela imagem redimensionada
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
      const dto = imoConfirmadoL; // new TfcConteinerInspecaoIMODTO();
      console.log("imo", inspecao);
      await salvar(dto);
      navigation.navigate('MenuInspecao', { inspecao });
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
              <TouchableOpacity style={styles.button} onPress={goToCamera}>
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
});

export default GateImoScreen;

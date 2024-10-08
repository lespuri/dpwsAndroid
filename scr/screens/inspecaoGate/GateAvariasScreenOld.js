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
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SelectDropdown from 'react-native-select-dropdown';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import PageGateHeader from './GateHeaderScreen';
import ContainerServiceProvider from '../../services/container-service';
import { buscarLacre } from '../../services/lacre-service';
import { buscarAvaria } from '../../services/avarias-service';
import AlertProvider from '../../services/Alert';
import { _CAMERA_TARGET_HEIGHT, _CAMERA_TARGET_WIDTH, _AVARIA_PADRAO, _AVARIA_IGNORAR, _CAMERA_QUALITY } from '../../services/properties.service';
import TfcConteinerInspecaoAvaria from '../../models/TfcConteinerInspecaoAvaria';
import { TfcConteinerFinalizarInspecaoDTO } from '../../models/TfcConteinerFinalizarInspecaoDTO';
import { DamageType } from '../../models/DamageType';
import { ComponentModel } from '../../models/ComponentModel';

const GateAvariasScreen = ({ navigation, route }) => {
  const { inspecao } = route.params;
  const [isDemageReport, setIsDemageReport] = useState(false);
  const [imageNovaL, setImageNovaL] = useState([]);
  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [componenteSelecionado, setComponenteSelecionado] = useState(null);
  const [tipoL, setTipoL] = useState([]);
  const [componenteL, setComponenteL] = useState([]);
  const [tfcConteinerInspecaoAvariaL, setTfcConteinerInspecaoAvariaL] = useState([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const cameraRef = useRef(null);
  const devices = useCameraDevices();
  const device = devices.back || devices.find(dev => dev.position === 'back');

  useEffect(() => {
    presentLoading();
    buscarDadosApi();
  }, []);

  const presentLoading = () => {
    // Implement loading logic
  };

  const buscarDadosApi = async () => {
    try {
      const result = await buscarLacre(inspecao.tfcContainerInspecaoDto);
      inspecao.tfcConteinerFinalizarInspecaoDTO = TfcConteinerFinalizarInspecaoDTO.fromJSON(result);
      
      if (!inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOAVARIARESUMODTO) {
        buscarDadosApi(); // Retry if data not loaded
      } else {        
        prepararDadosLocal();
        buscarDadosApiAvariaCompleta();
      }
    } catch (err) {
      // Handle error
      console.log("ERRO", err);
      Alert.alert("Atenção", "Erro ao buscar dados da API");
    }
  };

  const prepararDadosLocal = () => {
    const tipos = [];
    const componentes = [];

    inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOAVARIARESUMODTO.TYPES.forEach(types => {
        const dt = new DamageType(types.ID, types.DESCRIPTION, types.CUSTDFF_REPORTDAMAGE);
        tipos.push(dt);
    });

    inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOAVARIARESUMODTO.COMPONENTS.forEach(components => {
        componentes.push(new ComponentModel(components.ID, components.DESCRIPTION));
    });

    setTipoL(tipos);
    setComponenteL(componentes);

    setIsDemageReport(inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOAVARIARESUMODTO.TFCCONTEINERINSPECAODTO.DAMAGEREPORT === 'Y');
  };

  const buscarDadosApiAvariaCompleta = async () => {
    try {
      const result = await buscarAvaria(inspecao.tfcContainerInspecaoDto);
      const avarias = Object.assign([], result);

      avarias.forEach(element => {
        let type = tipoL.find(item => item.ID === element.TIPO);
        let component = componenteL.find(item => item.ID === element.COMPONENTE);

        if (component) {
          element.COMPONENTEDESCRICAO = component.DESCRIPTION;
        }

        if (type) {
          element.TIPODESCRICAO = type.DESCRIPTION;
        }

        buscarImagensApi(element);
      });

      setTfcConteinerInspecaoAvariaL(avarias);
    } catch (err) {
      // Handle error
      console.log("ERRO", err);
      Alert.alert("Atenção", "Erro ao buscar dados completos da API");
    }
  };

  const buscarImagensApi = async (avaria) => {
    try {
      const result = await AvariaServiceProvider.buscarImagem(avaria);
      avaria.imagemL = result;
    } catch (err) {
      // Handle error
      console.log("ERRO", err);
      Alert.alert("Atenção", "Erro ao buscar imagens da API");
    }
  };

  const adicionarAvaria = (isConfirmar = false) => {
    if (tipoSelecionado && tipoSelecionado.ID && componenteSelecionado && componenteSelecionado.ID) {
      if (isDemageReport && (!imageNovaL || imageNovaL.length === 0)) {
        let isAvariaPadrao = verificarAvariaPadrao(tipoSelecionado.ID, componenteSelecionado.ID);
        if (!isAvariaPadrao) {
        Alert.alert("Atenção", "Adicione uma imagem para esta avaria");
          
        }
      } else {
        let type = tipoL.find(item => item.ID === tipoSelecionado.ID);
        let component = componenteL.find(item => item.ID === componenteSelecionado.ID);

        let tfcConteinerInspecaoAvaria = new TfcConteinerInspecaoAvaria();
        tfcConteinerInspecaoAvaria.imagemL = imageNovaL;
        tfcConteinerInspecaoAvaria.COMPONENTE = component.ID;
        tfcConteinerInspecaoAvaria.COMPONENTEDESCRICAO = component.DESCRIPTION;
        tfcConteinerInspecaoAvaria.TIPO = type.ID;
        tfcConteinerInspecaoAvaria.TIPODESCRICAO = type.DESCRIPTION;

        setTfcConteinerInspecaoAvariaL([...tfcConteinerInspecaoAvariaL, tfcConteinerInspecaoAvaria]);

        setTipoSelecionado(null);
        setComponenteSelecionado(null);
        setImageNovaL([]);

        if (isConfirmar) {
          finalizarAvaria(isConfirmar);
        }
      }
    } else {
        Alert.alert("Atenção", "Adicione um Tipo e Componente para prosseguir");
    }
  };

  const removerAvaria = (avaria) => {
    setTfcConteinerInspecaoAvariaL(tfcConteinerInspecaoAvariaL.filter(item => item !== avaria));
  };

  const verificarAvariaPadrao = (prTipo, prComponente) => {
    let listaAvariaPadrao = _AVARIA_PADRAO.split(",");
    return listaAvariaPadrao.some(avaria => {
      let [componente, tipo] = avaria.split(":");
      return prTipo === tipo && prComponente === componente;
    });
  };

  const verificarAvariaIgnorada = (prTipo, prComponente) => {
    let listaAvariaIgnore = _AVARIA_IGNORAR.split(",");
    return listaAvariaIgnore.some(avaria => {
      let [componente, tipo] = avaria.split(":");
      return prTipo === tipo && prComponente === componente;
    });
  };

  const finalizarAvaria = (isConfirmar) => {
    if (!isConfirmar) {
      adicionarAvaria(true);
    } else {
      let isAvariaSemImagem = false;

      inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOAVARIARESUMODTO.TFCCONTEINERINSPECAODTO.DAMAGEREPORT = isDemageReport ? 'Y' : null;
      inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOAVARIARESUMODTO.AVARIAS = "";
      inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOAVARIARESUMODTO.NextAction = "Next";

      tfcConteinerInspecaoAvariaL.forEach(avaria => {
        let isAvariaPadrao = verificarAvariaPadrao(avaria.TIPO, avaria.COMPONENTE);
        let isAvariaIgnorada = verificarAvariaIgnorada(avaria.TIPO, avaria.COMPONENTE);

        if (!isAvariaPadrao && !isAvariaIgnorada && isDemageReport && (!avaria.imagemL || avaria.imagemL.length === 0)) {
          isAvariaSemImagem = true;
        }

        inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOAVARIARESUMODTO.AVARIAS += `${avaria.COMPONENTE}:${avaria.TIPO},`;
      });

      if (isAvariaSemImagem) {
        Alert.alert("Atenção", "É necessário adicionar imagens para todas as Avarias informadas");
      } else {
        presentLoading();

        ContainerServiceProvider.salvar(inspecao.tfcConteinerFinalizarInspecaoDTO)
          .then(() => uploadFile())
          .catch(err => {
            console.log("ERRO", err);
            Alert.alert("Atenção", "Erro ao salvar os dados");
          });
      }
    }
  };

  const showModal = (index, url) => {
    setCurrentImageIndex(index);
    setCurrentImageUrl(url);
    setModalVisible(true);
  };

  const goToCamera = async () => {
    setCameraVisible(true);
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePhoto({
        flash: 'auto',
        qualityPrioritization: 'balanced',
        skipMetadata: true,
      });
      setImageNovaL([...imageNovaL, { uri: `file://${photo.path}` }]);
      setCameraVisible(false);
    }
  };

  const removePhoto = (index) => {
    setImageNovaL(imageNovaL.filter((_, i) => i !== index));
  };

  const uploadFile = async () => {
    let isOccurredError = false;
    let isHasImage = false;

    if (tfcConteinerInspecaoAvariaL && tfcConteinerInspecaoAvariaL.length) {
      for (const avaria of tfcConteinerInspecaoAvariaL) {
        if (!avaria.TFCCONTEINERINSPECAOAVARIAID || avaria.TFCCONTEINERINSPECAOAVARIAID === 0) {
          if (avaria.imagemL && avaria.imagemL.length) {
            isHasImage = true;

            for (const element of avaria.imagemL) {
              try {
                await AvariaServiceProvider.uploadImagem(inspecao.tfcContainerInspecaoDto, avaria, element);
              } catch (err) {
                console.log("this.uploadImagem ERRO", err);
                isOccurredError = true;
                Alert.alert("Atenção", "Erro ao enviar a imagem");
                break;
              }
            }
          }
        }

        if (!isHasImage) {
          navegarProximaEtapa();
        }
      }
    }
  };

  const navegarProximaEtapa = () => {
    navigation.navigate('MenuPage', { inspecao });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <PageGateHeader
        conteiner={inspecao.tfcContainerInspecaoDto.NROCONTEINER}
        modalidade={inspecao.tfcContainerInspecaoDto.SIGLAMODALIDADE}
        freightkind={inspecao.tfcContainerInspecaoDto.SIGLAFREIGHTKIND}
        tra={inspecao.tfcContainerInspecaoDto.TRA}
        checklist={inspecao.checklistSelecionado.name}
        inspecao={inspecao}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <View style={styles.toggleContainer}>
            <Text style={styles.label}>DAMAGE REPORT</Text>
            <Switch
              value={isDemageReport}
              onValueChange={(value) => setIsDemageReport(value)}
            />
          </View>

          {imageNovaL && imageNovaL.length > 0 && (
            <View style={styles.imageGrid}>
              {imageNovaL.map((imagem, index) => (
                <View key={index} style={styles.imageContainer}>
                  <TouchableOpacity onPress={() => showModal(index, imagem.uri)}>
                    <Image source={{ uri: imagem.uri }} style={styles.image} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.removeButton} onPress={() => removePhoto(index)}>
                    <Icon name="minus-circle" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.dropdown}>
            <SelectDropdown
              data={tipoL}
              onSelect={(selectedItem) => setTipoSelecionado(selectedItem)}
              defaultButtonText="Selecionar Tipo"
              buttonTextAfterSelection={(selectedItem) => selectedItem.IDDESCRIPTION}
              rowTextForSelection={(item) => item.IDDESCRIPTION}
            />
          </View>

          <View style={styles.dropdown}>
            <SelectDropdown
              data={componenteL}
              onSelect={(selectedItem) => setComponenteSelecionado(selectedItem)}
              defaultButtonText="Selecionar Componente"
              buttonTextAfterSelection={(selectedItem) => selectedItem.IDDESCRIPTION}
              rowTextForSelection={(item) => item.IDDESCRIPTION}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={goToCamera}>
              <Text style={styles.buttonText}>Fotos</Text>
              <Icon name="camera" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => adicionarAvaria()}>
              <Text style={styles.buttonText}>Adicionar</Text>
              <Icon name="plus" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {tfcConteinerInspecaoAvariaL.length > 0 && (
            <>
              <Text style={styles.subTitle}>Avarias Adicionadas</Text>
              <View style={styles.separator} />
              <FlatList
                data={tfcConteinerInspecaoAvariaL}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View key={index} style={styles.avariaItem}>
                    <Text style={styles.avariaTitle}>{`${item.TIPO} - ${item.TIPODESCRICAO}`}</Text>
                    <Text style={styles.avariaDescription}>{`${item.COMPONENTE} - ${item.COMPONENTEDESCRICAO}`}</Text>
                    <TouchableOpacity onPress={() => removerAvaria(item)}>
                      <Icon name="close" size={24} color="red" />
                    </TouchableOpacity>
                    {item.imagemL && item.imagemL.length > 0 && (
                      <View style={styles.imageGrid}>
                        {item.imagemL.map((imagem, index) => (
                          <TouchableOpacity key={index} onPress={() => showModal(index, imagem.url)}>
                            <Image source={{ uri: imagem.url }} style={styles.image} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              />
            </>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.finalizarButton} onPress={() => finalizarAvaria(true)}>
            <Text style={styles.finalizarButtonText}>Confirmar</Text>
            <Icon name="forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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
  },
  content: {
    padding: 16,
  },
  form: {
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    margin: 8,
  },
  image: {
    width: 100,
    height: 100,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 15,
    padding: 5,
  },
  dropdown: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#022E69',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 16,
  },
  avariaItem: {
    marginBottom: 16,
  },
  avariaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  avariaDescription: {
    fontSize: 14,
    color: '#555',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  finalizarButton: {
    backgroundColor: '#022E69',
    padding: 16,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalizarButtonText: {
    color: '#fff',
    fontSize: 16,
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
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default GateAvariasScreen;

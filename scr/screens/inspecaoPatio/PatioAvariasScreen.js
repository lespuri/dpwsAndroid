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
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SelectDropdown from 'react-native-select-dropdown';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import {salvar } from '../../services/container-service';
import { buscarLacre } from '../../services/lacre-service';
import { buscarAvaria, buscarImagem, uploadImagem } from '../../services/avarias-service';
import AlertProvider from '../../services/Alert';
import { _CAMERA_TARGET_HEIGHT, _CAMERA_TARGET_WIDTH, _AVARIA_PADRAO, _AVARIA_IGNORAR, _CAMERA_QUALITY } from '../../services/properties.service';
import TfcConteinerInspecaoAvaria from '../../models/TfcConteinerInspecaoAvaria';
import { TfcConteinerFinalizarInspecaoDTO } from '../../models/TfcConteinerFinalizarInspecaoDTO';
import { DamageType } from '../../models/DamageType';
import { ComponentModel } from '../../models/ComponentModel';
import {  launchCamera  } from 'react-native-image-picker';

const PatioAvariasScreen = ({ navigation, route }) => {
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
  
  useEffect(() => {
    if (tipoL.length > 0 && componenteL.length > 0) {      
      buscarDadosApiAvariaCompleta();
    }
  }, [tipoL, componenteL]);

  const presentLoading = () => {
    // Implement loading logic
  };

  const buscarDadosApi = async () => {
    try {      
      const result = await buscarLacre(inspecao.tfcContainerInspecaoDto);
      //inspecao.tfcConteinerFinalizarInspecaoDTO = TfcConteinerFinalizarInspecaoDTO.fromJSON(result);
      
      inspecao.tfcConteinerFinalizarInspecaoDTO = { ...new TfcConteinerFinalizarInspecaoDTO(), ...result };

      if (!inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOAVARIARESUMODTO) {
        buscarDadosApi(); // Retry if data not loaded
      } else {        
        prepararDadosLocal();
        //buscarDadosApiAvariaCompleta();
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
      const result = await buscarImagem(avaria);
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

        salvar(inspecao.tfcConteinerFinalizarInspecaoDTO)
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

  // Função para capturar imagem da câmera
  const captureImageWithCamera = () => {
  
  
  
    const options = {
      mediaType: 'photo',
      saveToPhotos: true, // Opcional, salva a foto no álbum do dispositivo
    };
  
    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.error) {
        console.log('Camera Error: ', response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        //setPhoto(source);
        setImageNovaL([...imageNovaL, { uri: `${source.uri}` }]);
      }
    });
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
                await uploadImagem(inspecao.tfcContainerInspecaoDto, avaria, element);
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
    navigation.navigate('MenuInspecao', { inspecao });
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
      <FlatList
        data={tfcConteinerInspecaoAvariaL}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={
          <View style={styles.form}>
            <View style={styles.toggleContainer}>
              <Text style={styles.label}>DAMAGE REPORT</Text>
              <Switch
                value={isDemageReport}
                onValueChange={(value) => setIsDemageReport(value)}
              />
            </View>

            <View style={styles.dropdown}>
              <SelectDropdown
                data={tipoL}
                onSelect={(selectedItem, index) => {
                  setTipoSelecionado(selectedItem);
                  console.log(selectedItem, index);
                }}
                renderButton={(selectedItem, isOpened) => {
                  return (
                    <View style={styles.dropdownButtonStyle}>
                      <Text style={styles.dropdownButtonTxtStyle}>
                        {(selectedItem && selectedItem.IDDESCRIPTION) || 'Selecionar Tipo'}
                      </Text>
                      <Icon name={isOpened ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
                    </View>
                  );
                }}
                renderItem={(item, index, isSelected) => {
                  return (
                    <View style={{ ...styles.dropdownItemStyle, ...(isSelected && { backgroundColor: '#D2D9DF' }) }}>
                      <Text style={styles.dropdownItemTxtStyle}>{item.IDDESCRIPTION}</Text>
                    </View>
                  );
                }}
                search
                searchInputStyle={styles.searchInput}
                searchPlaceHolder="Buscar..."
                searchPlaceHolderColor="#999"
                showsVerticalScrollIndicator={false}
                dropdownStyle={styles.dropdownMenuStyle}
              />
            </View>

            <View style={styles.dropdown}>
              <SelectDropdown
                data={componenteL}
                onSelect={(selectedItem, index) => {
                  setComponenteSelecionado(selectedItem);
                  console.log(selectedItem, index);
                }}
                renderButton={(selectedItem, isOpened) => {
                  return (
                    <View style={styles.dropdownButtonStyle}>
                      <Text style={styles.dropdownButtonTxtStyle}>
                        {(selectedItem && selectedItem.IDDESCRIPTION) || 'Selecionar Componente'}
                      </Text>
                      <Icon name={isOpened ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
                    </View>
                  );
                }}
                renderItem={(item, index, isSelected) => {
                  return (
                    <View style={{ ...styles.dropdownItemStyle, ...(isSelected && { backgroundColor: '#D2D9DF' }) }}>
                      <Text style={styles.dropdownItemTxtStyle}>{item.IDDESCRIPTION}</Text>
                    </View>
                  );
                }}
                showsVerticalScrollIndicator={false}
                dropdownStyle={styles.dropdownMenuStyle}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.button} onPress={captureImageWithCamera}>
                <Text style={styles.buttonText}>Adicionar Imagem</Text>
                <Icon name="camera" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => adicionarAvaria()}>
                <Text style={styles.buttonText}>Adicionar Avaria</Text>
                <Icon name="plus" size={24} color="#fff" />
              </TouchableOpacity>
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
          </View>
        }
        renderItem={({ item, index }) => (
          <View key={index} style={styles.avariaItem}>
            <View style={styles.avariaTextContainer}>
              <Text style={styles.avariaTitle}>{`${item.TIPO} - ${item.TIPODESCRICAO}`}</Text>
              <Text style={styles.avariaDescription}>{`${item.COMPONENTE} - ${item.COMPONENTEDESCRICAO}`}</Text>
            </View>
            <TouchableOpacity onPress={() => removerAvaria(item)}>
              <Icon name="close" size={24} color="red" style={styles.avariaIcon} />
            </TouchableOpacity>
            {item.imagemL && item.imagemL.length > 0 && (
              <View style={styles.imageGrid}>
                {item.imagemL.map((imagem, index) => (
                  <TouchableOpacity key={index} onPress={() => showModal(index, imagem.uri)}>
                    <Image source={{ uri: imagem.uri }} style={styles.image} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity style={styles.finalizarButton} onPress={() => finalizarAvaria(true)}>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 10
  },
  avariaTextContainer: {
    flex: 1,
  },
  avariaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  avariaDescription: {
    fontSize: 14,
    color: '#555',
  },
  avariaIcon: {
    marginLeft: 8,
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
  dropdownButtonStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 16,
  },
  dropdownButtonArrowStyle: {
    fontSize: 16,
  },
  dropdownItemStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 16,
  },
  dropdownMenuStyle: {
    borderRadius: 5,
  },
  searchInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
});

export default PatioAvariasScreen;

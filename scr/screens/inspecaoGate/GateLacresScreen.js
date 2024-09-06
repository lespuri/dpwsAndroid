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
    ActivityIndicator, // Importado para mostrar o indicador de carregamento
  } from 'react-native';
  import Icon from 'react-native-vector-icons/FontAwesome';
  import { Camera, useCameraDevices } from 'react-native-vision-camera';
  import { salvar } from '../../services/container-service';
  import { buscarLacre, buscarDadosCompletoLacre, uploadImagem, buscarImagemLacre } from '../../services/lacre-service';
  import ImageResizer from 'react-native-image-resizer';
  import RNFS from 'react-native-fs';
  import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
  import { useNavigation, useRoute } from '@react-navigation/native';

  const GateLacresScreen = ({ navigation }) => {
    const route = useRoute();
    const [inspecao, setInspecao] = useState(route.params.inspecao);
    const [lacrePrevistoConfirmadoL, setLacrePrevistoConfirmadoL] = useState([]);
    const [outrosLacresL, setOutrosLacresL] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [cameraVisible, setCameraVisible] = useState(false);
    const [currentImageUrl, setCurrentImageUrl] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(null);
    const [lacrePrevistoConfirmado, setLacrePrevistoConfirmado] = useState(null);
    const cameraRef = useRef(null);
    const [shouldNavigate, setShouldNavigate] = useState(false);
    const [loading, setLoading] = useState(true); // Estado de carregamento

    const devices = useCameraDevices();
    const device = devices.back || devices.find(dev => dev.position === 'back');

    useEffect(() => {
      console.log('From MenuInspecao', inspecao);
      setLacrePrevistoConfirmadoL( []);
      setOutrosLacresL([]);
      buscarDadosApi();
      requestCameraPermission();
    }, []);

    useEffect(() => {
      if (shouldNavigate) {
        navigation.replace('MenuInspecao', inspecao);
        setShouldNavigate(false);
      }
    }, [inspecao]);

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
      try {
        setLoading(true); // Inicia o carregamento
        const result = await buscarLacre(inspecao.tfcContainerInspecaoDto);

        let lacresColocados = "";

        if (
          inspecao.tfcConteinerFinalizarInspecaoDTO != null &&
          inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO != null &&
          inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.COLOCADOS
        ) {
          lacresColocados = inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.COLOCADOS;
        }

        inspecao.tfcConteinerFinalizarInspecaoDTO = { ...result };

        if (!inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO) {
          inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO = {};
        }

        inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.COLOCADOS = lacresColocados;
      
        if(inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.PREVISTOS.split(",").length > 0)
        prepararDadosLocal();
      else
        buscarDadosApi();

      } catch (err) {
        console.error("ERRO", err);
        Alert.alert("Atenção", "Erro ao buscar dados da API.");
      } finally {
        setLoading(false); // Termina o carregamento
      }
    };

    const prepararDadosLocal = () => {
      let outrosLacresL = inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.NOVOS.split(",");
      outrosLacresL = outrosLacresL.filter(element => element !== "");

      outrosLacresL.forEach(element => {
        setOutrosLacresL(prevLacres => [...prevLacres, { lacre: element, imagem: {} }]);
      });

      let outrosLacresQtd = 4 - outrosLacresL.length;
      for (let i = 0; i < outrosLacresQtd; i++) {
        adicionarOutroLacre();
      }

      let lacreConfirmadoL = inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.CONFIRMADOS.split(",");
      lacreConfirmadoL = lacreConfirmadoL.filter(element => element !== "");

      lacreConfirmadoL.forEach(element => {
        setLacrePrevistoConfirmadoL(prevLacres => {
          if (!prevLacres.some(lacre => lacre.lacre === element)) {
            return [...prevLacres, { lacre: element, status: "confirmado", imagem: {} }];
          }
          return prevLacres;
        });
      });

      let previstosL = inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.PREVISTOS.split(",");
      previstosL = previstosL.filter(element => element !== "");

      lacrePrevistoConfirmadoL.forEach(lacrePrevisto => {
        let index = previstosL.indexOf(lacrePrevisto.lacre);
        if (index !== -1) {
          previstosL.splice(index, 1);
        }
      });

      previstosL.forEach(lacre => {
        setLacrePrevistoConfirmadoL(prevLacres => {
          if (!prevLacres.some(lacreItem => lacreItem.lacre === lacre)) {
            return [...prevLacres, { lacre, status: "previsto", imagem: {} }];
          }
          return prevLacres;
        });
      });

      buscarDadosCompletoApi();
    };

    const buscarDadosCompletoApi = async () => {
      try {
        const result = await buscarDadosCompletoLacre(inspecao.tfcContainerInspecaoDto);
        const lacreL = [...result];

        lacreL.forEach(lacre => {
          outrosLacresL.forEach(lacreOutro => {
            buscarImagemApi(lacre, lacreOutro);
          });

          getLacreConfirmado().forEach(lacreConfirmado => {
            buscarImagemApi(lacre, lacreConfirmado);
          });
        });
      } catch (err) {
        console.error("ERRO", err);
        Alert.alert("Atenção", "Erro ao buscar dados completos da API.");
      }
    };

    const buscarImagemApi = async (lacreCompleto, lacreBusca) => {
      if (lacreCompleto.NUMERO === lacreBusca.lacre) {
        try {
          const resultImagem = await buscarImagemLacre(lacreCompleto);
          let imagem = { ...resultImagem };

          if (imagem && imagem.CAMINHO) {
            lacreBusca.imagem = { uri: imagem.CAMINHO };
          }
        } catch (err) {
          console.error("ERRO", err);
          Alert.alert("Atenção", "Erro ao buscar imagem da API.");
        }
      }
    };

    const goToCamera = (item, index, _lacrePrevistoColocado) => {
      console.log("index", index);
      setCurrentImageIndex(index);
      setCameraVisible(true);
      setLacrePrevistoConfirmado(_lacrePrevistoColocado);
    };

    const selectImage = () => {
      console.log("selectImage", selectImage);
      const options = {
        mediaType: 'photo',
      };

      launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else {
          const source = { uri: response.assets[0].uri };
          setPhoto(source);
        }
      });
    };

    const captureImageWithCamera = (index, _lacrePrevistoColocado) => {
      console.log("index", index);

      setLacrePrevistoConfirmado(_lacrePrevistoColocado);
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
          if (_lacrePrevistoColocado) {
            const updatedLacres = [...lacrePrevistoConfirmadoL];
            updatedLacres[index].imagem = { uri: source.uri };
            setLacrePrevistoConfirmadoL(updatedLacres);
          } else {
            const updatedLacres = [...outrosLacresL];
            updatedLacres[index].imagem = { uri: source.uri };
            setOutrosLacresL(updatedLacres);
          }
        }
      });
    };

    const capturePhoto = async () => {
      try {
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

            if (lacrePrevistoConfirmado) {
              const updatedLacres = [...lacrePrevistoConfirmadoL];
              updatedLacres[currentImageIndex].imagem = { uri: resizedImage.uri };
              setLacrePrevistoConfirmadoL(updatedLacres);
            } else {
              const updatedLacres = [...outrosLacresL];
              updatedLacres[currentImageIndex].imagem = { uri: resizedImage.uri };
              setOutrosLacresL(updatedLacres);
            }
          } else {
            setImageNovaL([...imageNovaL, { uri: fileUri }]);
          }

          setCameraVisible(false);
        }
      } catch (err) {
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

        inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.SEMLACRE = inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.SEMLACRE;
        inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.CONFIRMADOS = lacreConfirmadoL.map(lacre => lacre.lacre).join(",");
        inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.NOVOS = outrosLacresL.map(lacre => lacre.lacre).join(",");
        inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.TFCCONTEINERINSPECAOID = inspecao.tfcContainerInspecaoDto.TFCCONTEINERINSPECAOID;
        inspecao.tfcConteinerFinalizarInspecaoDTO.TFCCONTEINERINSPECAOLACRERESUMODTO.NextAction = "Next";

        const returna = await salvar(inspecao.tfcConteinerFinalizarInspecaoDTO);

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
        const imagemUploadL = [...outrosLacresL, ...getLacreConfirmado()];

        for (const lacre of imagemUploadL) {
          if (isLacreImagem(lacre)) {
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
          const updatedMenuL = inspecao.checklist.menuL.map(item => {
            if (item.page === "GateLacres") {
              return { ...item, isDadosPreenchidos: true };
            }
            return item;
          });

          setShouldNavigate(true);
          setInspecao(prevInspecao => ({
            ...prevInspecao,
            checklist: { ...prevInspecao.checklist, menuL: updatedMenuL }
          }));
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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text>Carregando Lacres...</Text>
            </View>
          ) : (
            <>
              {/* Lacres Previstos e Confirmados */}
              <FlatList
                data={lacrePrevistoConfirmadoL}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View key={index} style={styles.item}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>{`${item.status.toUpperCase()} (${index + 1})`}</Text>
                      <TextInput
                        style={styles.input}
                        value={item.lacre}
                        editable={false}
                      />
                    </View>
                    <View style={styles.iconContainer}>
                      {item.status === 'previsto' ? (
                        <Icon
                          name="check-circle"
                          size={24}
                          color="orange"
                          style={styles.icon}
                          onPress={() => handleConfirmarLacre(item)}
                        />
                      ) : (
                        <Icon
                          name="close"
                          size={24}
                          color="red"
                          style={styles.icon}
                          onPress={() => handleConfirmarLacre(item)}
                        />
                      )}
                      {!item.imagem?.uri && (
                        <Icon
                          name="camera"
                          size={24}
                          color="blue"
                          style={styles.icon}
                          onPress={() => captureImageWithCamera(index, true)}
                        />
                      )}
                      {item.imagem?.uri && (
                        <>
                          <TouchableOpacity onPress={() => showModal(index, item.imagem.uri)}>
                            <Image source={{ uri: item.imagem.uri }} style={styles.image} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => removerImagemLacre(item)}>
                            <Icon name="close" size={24} color="red" style={styles.icon} />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                )}
              />

              {/* Outros Lacres */}
              <FlatList
                data={outrosLacresL}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View key={index} style={styles.item}>
                    <View style={styles.inputContainer}>
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
                    </View>
                    <View style={styles.iconContainer}>
                      {!item.imagem?.uri && (
                        <Icon
                          name="camera"
                          size={24}
                          color="blue"
                          style={styles.icon}
                          onPress={() => captureImageWithCamera(index, false)}
                        />
                      )}
                      {item.imagem?.uri && (
                        <>
                          <TouchableOpacity onPress={() => showModal(index, item.imagem.uri)}>
                            <Image source={{ uri: item.imagem.uri }} style={styles.image} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => removerLacre(item)}>
                            <Icon name="close" size={24} color="red" style={styles.icon} />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                )}
              />

              <TouchableOpacity style={styles.button} onPress={adicionarOutroLacre}>
                <Text style={styles.buttonText}>Adicionar Lacre</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={adicionarOutroLacre}>
                <Text style={styles.buttonText}>Sem Lacre</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.finalizarButton} onPress={handleFinalizarLacre}>
          <Text style={styles.finalizarButtonText}>Confirmar</Text>
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    inputContainer: {
      flex: 1,
      flexDirection: 'column',
      marginRight: 10,
    },
    label: {
      fontSize: 14,
      marginBottom: 4,
      color: '#333',
    },
    input: {
      flex: 0.4, // Mantém o tamanho do TextInput menor
      height: 40,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 4,
      paddingHorizontal: 8,
      fontSize: 16,
      backgroundColor: '#f9f9f9',
    },
    iconContainer: {
      flexDirection: 'row',
      justifyContent: 'center', // Alinha os ícones ao centro da linha
      alignItems: 'center',
    },
    icon: {
      marginLeft: 20, // Aumenta o espaçamento entre os ícones
    },
    image: {
      width: 40,
      height: 40,
      marginLeft: 20, // Aumenta o espaçamento entre a imagem e outros ícones
      borderRadius: 4,
    },
    button: {
      backgroundColor: '#022E69',
      padding: 12,
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
      padding: 14,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 20,
    },
    finalizarButtonText: {
      color: '#fff',
      fontSize: 18,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '85%',
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
    },
    modalCloseButton: {
      backgroundColor: '#022E69',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 16,
      width: '100%',
    },
    modalCloseButtonText: {
      color: '#fff',
      fontSize: 16,
    },
    modalImage: {
      width: '100%',
      height: 300,
      resizeMode: 'contain',
      marginBottom: 16,
    },
    cameraContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      backgroundColor: 'black',
    },
    captureButton: {
      width: '90%',
      backgroundColor: '#022E69',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 30,
    },
    captureButtonText: {
      color: '#fff',
      fontSize: 18,
    },
  });


  export default GateLacresScreen;

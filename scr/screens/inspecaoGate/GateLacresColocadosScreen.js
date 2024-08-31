import React, { useState, useEffect, useRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import PageGateHeader from './GateHeaderScreen';
import { buscarLacreColocado, salvarLacreColocado } from '../../services/lacre-colocado-service';
import { TfcConteinerInspecaoLacreResumoDTO } from '../../models/TfcConteinerInspecaoLacreResumoDTO';
import {  launchCamera  } from 'react-native-image-picker';

const GateLacresColocadosScreen = ({ navigation, route }) => {  
  const [inspecao, setInspecao] = useState(route.params.inspecao);
  const [colocadosLacresL, setColocadosLacresL] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  useEffect(() => {
    console.log("buscarDadosApi", inspecao);
    buscarDadosApi();
    
    return () => {
      // Cleanup if necessary
    };
  }, []);
  useEffect(() => {
    if(shouldNavigate)  {
      navigation.replace('MenuInspecao', inspecao);    
      setShouldNavigate(false);
    }

  }, [inspecao]);
  const presentLoading = async () => {
    setLoading(true);
  };

  const dismissLoading = () => {
    setLoading(false);
  };

  const buscarDadosApi = async () => {
    //await presentLoading();
    //console.log("buscarDadosApi", inspecao);
    const result = await buscarLacreColocado(inspecao.tfcContainerInspecaoDto);
    //inspecao.tfcConteinerInspecaoLacreResumoDTO = Object.assign(new TfcConteinerInspecaoLacreResumoDTO(), result);
    inspecao.tfcConteinerInspecaoLacreResumoDTO = { ...new TfcConteinerInspecaoLacreResumoDTO(), ...result };
    console.log("buscarDadosApi", inspecao);
    prepararDadosLocal();
  };
  

  const prepararDadosLocal = () => {
    console.log("prepararDadosLocal")
    let lacres = inspecao.tfcConteinerInspecaoLacreResumoDTO.COLOCADOS.split(",");
    lacres = lacres.filter(element => element !== "");
    let outrosLacresQtd = 5 - lacres.length;
    for (let i = 0; i < outrosLacresQtd; i++) {
      lacres.push("");
    }
    console.log("setColocadosLacresL", lacres);
    setColocadosLacresL(lacres);
    //dismissLoading();
  };

  const adicionarOutroLacre = () => {
    setColocadosLacresL([...colocadosLacresL, ""]);
  };
  
  const finalizarLacre = async () => {
    try {
      console.log("finalizarLacre");
      let outrosLacres = colocadosLacresL.filter(element => element !== "");
      
      inspecao.tfcConteinerInspecaoLacreResumoDTO.COLOCADOS = outrosLacres.join(",");
      inspecao.tfcConteinerInspecaoLacreResumoDTO.NextAction = "Next";

      console.log("finalizarLacre0");
      console.log("finalizarLacre", inspecao);
  
      //await presentLoading();
      const result =  await salvarLacreColocado(inspecao.tfcConteinerInspecaoLacreResumoDTO);
      console.log("Salvamento com sucesso:", result);
  

      const updatedMenuL = inspecao.checklist.menuL.map(item => {
        if (item.page == "GateLacresColocados") {
          return { ...item, isDadosPreenchidos: true }; // Altera o isDadosPreenchidos para true
        }
        return item;
      });
  
      setShouldNavigate(true);
      setInspecao(prevInspecao => ({
            ...prevInspecao,
            checklist: { ...prevInspecao.checklist, menuL: updatedMenuL }
          }));        
      
      // Navegação após o sucesso
      //navigation.navigate('MenuInspecao', { inspecao });
  
    } catch (err) {
      console.log("ERRO", err);
      Alert.alert("Atenção", "Erro ao salvar os dados");
    } finally {
      dismissLoading();
    }
  };

  // Função para capturar imagem da câmera
const captureImageWithCamera = (index, _lacrePrevistoColocado) => {
  console.log("index", index);
  
  setLacrePrevistoConfirmado(_lacrePrevistoColocado);
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
      console.log("lacrePrevistoConfirmado", lacrePrevistoConfirmado);
      if (_lacrePrevistoColocado
      ){
        const updatedLacres = [...lacrePrevistoConfirmadoL];
        updatedLacres[index].imagem = { uri: source.uri }; // Prefixar com file://
        setLacrePrevistoConfirmadoL(updatedLacres);  
      }else{
        const updatedLacres = [...outrosLacresL];
        updatedLacres[index].imagem = { uri: source.uri }; // Prefixar com file://
        setOutrosLacresL(updatedLacres);  

      }    
    }
  });
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

      <ScrollView contentContainerStyle={styles.content}>
        {colocadosLacresL.map((lacre, index) => (
          <View key={index} style={styles.lacreItem}>
            <Text style={styles.label}>LACRE COLOCADO <Text style={styles.small}>({index + 1})</Text></Text>
            <TextInput
              style={styles.input}
              maxLength={15}
              value={lacre}
              onChangeText={text => {
                const newLacres = [...colocadosLacresL];
                newLacres[index] = text;
                setColocadosLacresL(newLacres);
              }}
            />
            <TouchableOpacity onPress={() => {
              const newLacres = colocadosLacresL.filter((_, i) => i !== index);
              setColocadosLacresL(newLacres);
            }}>
              <Icon name="close" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.button} onPress={adicionarOutroLacre}>
          <Text style={styles.buttonText}>Adicionar Lacre</Text>
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={finalizarLacre}>
          <Text style={styles.confirmButtonText}>Confirmar</Text>
         
        </TouchableOpacity>
      </View>
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
  lacreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    flex: 1,
  },
  small: {
    fontSize: 12,
    color: '#555',
  },
  input: {
    flex: 2,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    marginRight: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#022E69',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#022E69',
    padding: 16,
    borderRadius: 5,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
});

export default GateLacresColocadosScreen;

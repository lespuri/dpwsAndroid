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
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import PageGateHeader from './GateHeaderScreen';
import { buscarLacreColocado, salvarLacreColocado, uploadImagem } from '../../services/lacre-colocado-service';
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
    
    let lacres = inspecao.tfcConteinerInspecaoLacreResumoDTO.COLOCADOS.split(",");
    lacres = lacres.filter(element => element !== "");        

    let lista = [];
    
    lacres.forEach(element => {
      lista.push({
          lacre: element,
          imagem: {}
      });      
     });
  
    //setColocadosLacresL(lista);

    let outrosLacresQtd = 3 - lacres.length;
    for (let i = 0; i < outrosLacresQtd; i++) {
      lista.push({
        lacre: "",
        imagem: {}
    });  
    }    
    
    setColocadosLacresL(lista);
    console.log("prepararDadosLocal", lista);
    //dismissLoading();
  };

  const adicionarOutroLacre = () => {
    setColocadosLacresL([...colocadosLacresL, {lacre: "", imagem: {}}]);
  };
  
  const finalizarLacre = async () => {
    try {
      console.log("finalizarLacre");
      let outrosLacres = colocadosLacresL.filter(element => element !== "");
      
      inspecao.tfcConteinerInspecaoLacreResumoDTO.COLOCADOS = outrosLacres.map(lacre => lacre.lacre).join(",");
      inspecao.tfcConteinerInspecaoLacreResumoDTO.NextAction = "Next";

      console.log("finalizarLacre0");
      console.log("finalizarLacre", inspecao);
  
      //await presentLoading();
      const result =  await salvarLacreColocado(inspecao.tfcConteinerInspecaoLacreResumoDTO);
      console.log("Salvamento com sucesso:", result);
      await uploadFiles();
/*
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
      */
      // Navegação após o sucesso
      //navigation.navigate('MenuInspecao', { inspecao });
  
    } catch (err) {
      console.log("ERRO", err);
      Alert.alert("Atenção", "Erro ao salvar os dados");
    } finally {
      dismissLoading();
    }
  };

  const isLacreImagem = (lacre) => {
    return lacre.imagem && lacre.imagem.uri;
  };

  const uploadFiles = async () => {
    try {
      let isOccurredError = false;      

      for (const lacre of colocadosLacresL) {
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
          if (item.page === "GateLacresColocados") {
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
  // Função para capturar imagem da câmera
const captureImageWithCamera = (index, _lacrePrevistoColocado) => {
  console.log("index", index);
  
  //setColocadosLacresL(_lacrePrevistoColocado);
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
      console.log("colocadosLacresL", colocadosLacresL);
        const updatedLacres = [...colocadosLacresL];
        console.log("colocadosLacresL > updatedLacres", updatedLacres);
        updatedLacres[index].imagem = { uri: source.uri }; // Prefixar com file://
        setColocadosLacresL(updatedLacres);
        console.log("colocadosLacresL > updatedLacres > after", updatedLacres)
        //const updatedLacres = [...outrosLacresL];
        //updatedLacres[index].imagem = { uri: source.uri }; // Prefixar com file://
        //setOutrosLacresL(updatedLacres);            
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
      {colocadosLacresL.map((item, index) => (
  <View key={index} style={styles.lacreItem}>
    <Text style={styles.label}>
      LACRE COLOCADO <Text style={styles.small}>({index + 1})</Text>
    </Text>
    <TextInput
      style={styles.input}
      maxLength={15}
      value={item.lacre}
      onChangeText={text => {
        const newLacres = [...colocadosLacresL];
        newLacres[index] = { ...newLacres[index], lacre: text }; // Mantém o objeto e só altera o 'lacre'
        setColocadosLacresL(newLacres);
      }}
    />
    {!item.imagem?.uri && (
      <TouchableOpacity onPress={() => captureImageWithCamera(index, item)}>
      <Icon name="camera" size={24} color="#000" />
    </TouchableOpacity>

    )}

    {/* Exibir imagem se existir */}
   
    {item.imagem?.uri && (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        
        <TouchableOpacity >
          <Image source={{ uri: item.imagem?.uri }} style={styles.image} />
        </TouchableOpacity>
        
        <TouchableOpacity     
            onPress={() => {
              const updatedLacres = [...colocadosLacresL];
              const index = updatedLacres.indexOf(item);
              updatedLacres[index].imagem = null;
              setColocadosLacresL(updatedLacres);
            
        }}>
          <Icon name="close" size={24} color="red" style={styles.icon} />
        </TouchableOpacity>
      </View>
    )}
{! item.imagem?.uri && (
    <TouchableOpacity
    onPress={() => {
      const newLacres = colocadosLacresL.filter((_, i) => i !== index);
      setColocadosLacresL(newLacres);
    }}>
    <Icon name="close" size={24} color="red" />
  </TouchableOpacity>

)}
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
  lacreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Garante espaçamento entre os itens
    marginBottom: 16,
  } , 
  image: {
    width: 40,
    height: 40,
    marginLeft: 20, // Aumenta o espaçamento entre a imagem e outros ícones
    borderRadius: 4,
  },
});

export default GateLacresColocadosScreen;

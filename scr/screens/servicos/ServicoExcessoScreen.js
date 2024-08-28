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
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { pesquisar, salvarExcesso } from '../../services/container-service';
import { TfcConteinerInspecaoDTO } from '../../models/TfcConteinerInspecaoDTO';
import { KDTipo } from '../../enum/KDTipo';

const ServicoExcessoScreen = ({ navigation, route }) => {
  const { inspecao } = route.params;
  const [altura, setAltura] = useState('');
  const [direita, setDireita] = useState('');
  const [esquerda, setEsquerda] = useState('');
  const [frontal, setFrontal] = useState('');
  const [traseiro, setTraseiro] = useState('');
  const [iop, setIop] = useState(false);
  const [loading, setLoading] = useState(false);
  const alturaInputRef = useRef(null);

  useEffect(() => {
    // Fixando o tipo serviços
    inspecao.tfcContainerInspecaoDto.TIPO = KDTipo.kdServicos;
    inspecao.tfcContainerInspecaoDto.TIPOENUM = KDTipo.kdServicos;

    inspecao.tfcContainerInspecaoDto.CEALTURA = null;
    inspecao.tfcContainerInspecaoDto.CEDIREITA = null;
    inspecao.tfcContainerInspecaoDto.CEESQUERDA = null;
    inspecao.tfcContainerInspecaoDto.CEFRONTAL = null;
    inspecao.tfcContainerInspecaoDto.CETRASEIRO = null;

    buscarDadosApi();
  }, []);

  const presentLoading = async () => {
    setLoading(true);
  };

  const dismissLoading = () => {
    setLoading(false);
  };

  const buscarDadosApi = async () => {
    //console.log("pesquisar", inspecao.tfcContainerInspecaoDto.NROCONTEINER)
    const obj = {
      NROCONTEINER: inspecao.tfcContainerInspecaoDto.NROCONTEINER,
      TIPO: inspecao.tipo,
    };
    const result = await pesquisar(obj); 
    console.log(result);
    inspecao.tfcContainerInspecaoDto = { ...new TfcConteinerInspecaoDTO(), ...result };
    //console.log("resulta", JSON.stringify(result))
    setTimeout(() => {
      if (alturaInputRef.current) {
        alturaInputRef.current.focus();
      }
    }, 100);
  };

  const onConfirmar = async () => {
    //await presentLoading();
    
    inspecao.tfcContainerInspecaoDto.CEALTURA = altura;
    inspecao.tfcContainerInspecaoDto.CEDIREITA = direita;
    inspecao.tfcContainerInspecaoDto.CEESQUERDA = esquerda;
    inspecao.tfcContainerInspecaoDto.CEFRONTAL = frontal;
    inspecao.tfcContainerInspecaoDto.CETRASEIRO = traseiro;
    
    try{
      await salvarExcesso(inspecao.tfcContainerInspecaoDto);
      navigation.navigate('MenuInspecao', { inspecao });
    }catch(err){
      //console.error(err);
      Alert.alert("Erro", err.message);
    }
    
    
    

/*
    salvarExcesso(inspecao.tfcContainerInspecaoDto).then((result) => {
      navigation.navigate('MenuInspecao', { inspecao });
      dismissLoading();
    }).catch((err) => {
      dismissLoading();
      console.log("ERRO", err);
      Alert.alert("Atenção", "Erro ao salvar os dados");
    });
    */
  };

  const updateIOPStatus = () => {
    const dto = inspecao.tfcContainerInspecaoDto;
    //console.log("dto.CEALTURA",dto.CEALTURA);
    if (!dto.CEALTURA && !dto.CEDIREITA && !dto.CEESQUERDA && !dto.CEFRONTAL && !dto.CETRASEIRO) {
      setIop(false);      
    } else {
      setIop(true);      
    }
    dto._IOP = iop;
  };

  useEffect(() => {
    updateIOPStatus();    
  }, [altura, direita, esquerda, frontal, traseiro]);

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
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>ALTURA</Text>
            <TextInput
              style={styles.input}
              placeholder="ALTURA"
              value={altura}
              onChangeText={(text) => setAltura(text)}
              ref={alturaInputRef}
              onBlur={updateIOPStatus}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>DIREITA</Text>
            <TextInput
              style={styles.input}
              placeholder="DIREITA"
              value={direita}
              onChangeText={(text) => setDireita(text)}
              onBlur={updateIOPStatus}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>ESQUERDA</Text>
            <TextInput
              style={styles.input}
              placeholder="ESQUERDA"
              value={esquerda}
              onChangeText={(text) => setEsquerda(text)}
              onBlur={updateIOPStatus}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>FRONTAL</Text>
            <TextInput
              style={styles.input}
              placeholder="FRONTAL"
              value={frontal}
              onChangeText={(text) => setFrontal(text)}
              onBlur={updateIOPStatus}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>TRASEIRO</Text>
            <TextInput
              style={styles.input}
              placeholder="TRASEIRO"
              value={traseiro}
              onChangeText={(text) => setTraseiro(text)}
              onBlur={updateIOPStatus}
            />
          </View>
          <View style={styles.toggleContainer}>
            <Text style={styles.label}>IOP</Text>
            <Switch
              value={iop}
              onValueChange={(value) => setIop(value)}
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={onConfirmar}>
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    marginTop: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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

export default ServicoExcessoScreen;

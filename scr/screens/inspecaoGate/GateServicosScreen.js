import React, { useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  FlatList,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SelectDropdown from 'react-native-select-dropdown';
import { buscarServicos, buscarOpcao, salvar, excluir } from '../../services/servico-service';
import { pesquisar } from '../../services/container-service';
import { TfcConteinerInspecaoEventoDTO } from '../../models/TfcConteinerInspecaoEventoDTO';
import { TfcConteinerInspecaoDTO } from '../../models/TfcConteinerInspecaoDTO';
//TfcConteinerInspecaoDTO

const GateServicosScreen = ({ navigation, route }) => {
  const [inspecao, setInspecao] = useState(route.params.inspecao);
  const [opcaoL, setOpcaoL] = useState([]);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  useEffect(() => {    
    buscarOpcaoApi();
  }, []);
  useEffect(() => {
    if(shouldNavigate)  {
      navigation.replace('MenuInspecao', inspecao);    
      setShouldNavigate(false);
    }

  }, [inspecao]);

  const presentLoading = () => {
    setLoading(true);
  };

  const dismissLoading = () => {
    setLoading(false);
  };

  const buscarOpcaoApi = async () => {
    await presentLoading();
    const obj = {
      NROCONTEINER: inspecao.tfcContainerInspecaoDto.NROCONTEINER,
      TIPO: inspecao.tipo,
    };
    try {
      
      const result = await buscarOpcao(obj);      
      setOpcaoL(result);
      buscarDadosApi();
    } catch (err) {
      console.log('ERRO ao buscar opções', err);
      Alert.alert('Atenção', 'Erro ao buscar opções');
    } finally {
      //await dismissLoading();
    }
  };

  const buscarDadosApi = async () => {
    try {
      const obj = {
        NROCONTEINER: inspecao.tfcContainerInspecaoDto.NROCONTEINER,
        TIPO: inspecao.tipo,
      };  
      //const resultCOnteiner = await pesquisar(obj);
      //inspecao.tfcContainerInspecaoDto = { ...new TfcConteinerInspecaoDTO(), ...resultCOnteiner };
            
      const result = await buscarServicos(inspecao.tfcContainerInspecaoDto);
      inspecao.tfcConteinerInspecaoEventoDTO = { ...new TfcConteinerInspecaoEventoDTO(), ...result };
      //inspecao.tfcConteinerInspecaoEventoDTO = result;
      //setServicoSelecionado(inspecao.tfcConteinerInspecaoEventoDTO);
      const eventoServicos = result.map(item => ({ 
        EVENTODESCRICAO: item.EVENTODESCRICAO || item.DESCRICAO,
        TFCTIPOEVENTOINSPECAOID: item.TFCTIPOEVENTOINSPECAOID,
        TFCCONTEINERINSPECAOEVENTOID: item.TFCCONTEINERINSPECAOEVENTOID
      }));
      await setServicoSelecionado(eventoServicos);      
      console.log("Serviços carregados:", eventoServicos);
    } catch (err) {
      console.log('ERRO ao buscar dados', err);
      Alert.alert('Atenção', 'Erro ao buscar dados');
    } finally {
      await dismissLoading();
    }
  };

  const adicionarServico = async (item) => {
    console.log("adicionarServic > item", item);
    await presentLoading();
    
    const servicoToAdd = new TfcConteinerInspecaoEventoDTO();
    servicoToAdd.NROCONTEINER = inspecao.tfcContainerInspecaoDto.NROCONTEINER;
    servicoToAdd.TFCCONTEINERINSPECAOID = inspecao.tfcContainerInspecaoDto.TFCCONTEINERINSPECAOID;
    servicoToAdd.TIPO = inspecao.tfcContainerInspecaoDto.TIPO;
    servicoToAdd.TFCTIPOEVENTOINSPECAOID = item.TFCTIPOEVENTOINSPECAOID;
    servicoToAdd.EVENTODESCRICAO = item.DESCRICAO;

      //setServicoSelecionado(null);

      try {
        console.log("salvar");
        await salvar(servicoToAdd);
        buscarDadosApi();
      } catch (err) {
        console.log('ERRO ao salvar serviço', err);
        Alert.alert('Atenção', 'Erro ao salvar serviço');
      } finally {
        //await dismissLoading();
      }
    
  };

  const removerServico = async (servico) => {
    await presentLoading();
    const servicoToRm = new TfcConteinerInspecaoEventoDTO();
    servicoToRm.NROCONTEINER = inspecao.tfcContainerInspecaoDto.NROCONTEINER;
    servicoToRm.TFCCONTEINERINSPECAOID = inspecao.tfcContainerInspecaoDto.TFCCONTEINERINSPECAOID;
    servicoToRm.TIPO = inspecao.tfcContainerInspecaoDto.TIPO;
    servicoToRm.TFCTIPOEVENTOINSPECAOID = servico.TFCTIPOEVENTOINSPECAOID;
    servicoToRm.TFCCONTEINERINSPECAOEVENTOID = servico.TFCCONTEINERINSPECAOEVENTOID;

    try {
      await excluir(servicoToRm);
      buscarDadosApi();
    } catch (err) {
      console.log('ERRO ao remover serviço', err);
      Alert.alert('Atenção', 'Erro ao remover serviço');
    } finally {
      dismissLoading();
    }
  };

  const finalizarServico = () => {
    
    const updatedMenuL = inspecao.checklist.menuL.map(item => {
      if (item.page == "GateServicos") {
        return { ...item, isDadosPreenchidos: true }; // Altera o isDadosPreenchidos para true
      }
      return item;
    });

    setShouldNavigate(true);
    setInspecao(prevInspecao => ({
          ...prevInspecao,
          checklist: { ...prevInspecao.checklist, menuL: updatedMenuL }
        }));


    //navigation.navigate('MenuInspecao', { inspecao });
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

      <View style={styles.content}>
        {opcaoL.length > 0 && (
          <View style={styles.dropdown}>
            <SelectDropdown
              data={opcaoL}
              onSelect={(selectedItem, index) => {
                setServicoSelecionado(selectedItem);
                console.log("servico selcionado", selectedItem);
                adicionarServico(selectedItem);
              }}
              renderButton={(selectedItem, isOpened) => (
                <View style={styles.dropdownButtonStyle}>
                  <Text style={styles.dropdownButtonTxtStyle}>
                    {(selectedItem && selectedItem.DESCRICAO) || 'Selecionar Serviço'}
                  </Text>
                  <Icon name={isOpened ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
                </View>
              )}
              renderItem={(item, index, isSelected) => (
                <View style={{ ...styles.dropdownItemStyle, ...(isSelected && { backgroundColor: '#D2D9DF' }) }}>
                  <Text style={styles.dropdownItemTxtStyle}>{item.DESCRICAO}</Text>
                </View>
              )}
              search
              searchInputStyle={styles.searchInput}
              searchPlaceHolder="Buscar..."
              searchPlaceHolderColor="#999"
              showsVerticalScrollIndicator={false}
              dropdownStyle={styles.dropdownMenuStyle}
            />
          </View>
        )}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Carregando...</Text>
        </View>
      )}
      {!loading && (
        <FlatList
        data={servicoSelecionado}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.servicoItem}>
            <Text style={styles.servicoText}>{item.EVENTODESCRICAO || item.DESCRICAO}</Text>
            <TouchableOpacity onPress={() => removerServico(item)}>
              <Icon name="close" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />
      )}

      </View>

      <View style={styles.footer}>
      <TouchableOpacity 
  style={[styles.confirmButton, loading && { backgroundColor: '#ccc' }]} 
  onPress={finalizarServico}
  disabled={loading}
>
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
    flex: 1,
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
  dropdown: {
    marginBottom: 16,
  },
  dropdownButtonStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  dropdownButtonTxtStyle: {
    fontSize: 16,
  },
  dropdownButtonArrowStyle: {
    fontSize: 16,
    color: '#444',
  },
  dropdownItemStyle: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dropdownItemTxtStyle: {
    fontSize: 16,
  },
  searchInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
    padding: 10,
  },
  dropdownMenuStyle: {
    borderRadius: 5,
  },
  servicoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  servicoText: {
    fontSize: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default GateServicosScreen;

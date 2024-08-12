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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SelectDropdown from 'react-native-select-dropdown';
import { buscarServicos,buscarOpcao, salvar, excluir } from '../../services/servico-service';
import { TfcConteinerInspecaoEventoDTO } from '../../models/TfcConteinerInspecaoEventoDTO';

const GateServicosScreen = ({ navigation, route }) => {
  const { inspecao } = route.params;
  const [opcaoL, setOpcaoL] = useState([]);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    buscarOpcaoApi();    
  }, []);

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
    buscarOpcao(obj)
      .then((result) => {
        console.log("result", result);
        setOpcaoL(result);
        buscarDadosApi();
      })
      .catch((err) => {
        dismissLoading();
        console.log('ERRO', err);
        Alert.alert('Atenção', 'Erro ao buscar opções');
      });
  };

  const buscarDadosApi = () => {
    buscarServicos(inspecao.tfcContainerInspecaoDto)
      .then((result) => {
        console.log("buscarServicos",result);
        inspecao.tfcConteinerInspecaoEventoDTO = result;
        dismissLoading();
      })
      .catch((err) => {
        dismissLoading();
        console.log('ERRO', err);
        Alert.alert('Atenção', 'Erro ao buscar dados');
      });
  };

  const adicionarServico = async () => {
    if (!servicoSelecionado) {
      return;
    }
    await presentLoading();
    const servico = opcaoL.find((item) => item.TFCTIPOEVENTOINSPECAOID === servicoSelecionado);
    const servicoToAdd = new TfcConteinerInspecaoEventoDTO();
    servicoToAdd.NROCONTEINER = inspecao.tfcContainerInspecaoDto.NROCONTEINER;
    servicoToAdd.TFCCONTEINERINSPECAOID = inspecao.tfcContainerInspecaoDto.TFCCONTEINERINSPECAOID;
    servicoToAdd.TIPO = inspecao.tfcContainerInspecaoDto.TIPO;
    servicoToAdd.TFCTIPOEVENTOINSPECAOID = servico.TFCTIPOEVENTOINSPECAOID;
    servicoToAdd.EVENTODESCRICAO = servico.DESCRICAO;

    setServicoSelecionado(null);

    salvar(servicoToAdd)
      .then(() => {
        buscarDadosApi();
      })
      .catch((err) => {
        dismissLoading();
        console.log('ERRO', err);
        Alert.alert('Atenção', 'Erro ao salvar serviço');
      });
  };

  const removerServico = async (servico) => {
    await presentLoading();
    const servicoToRm = new TfcConteinerInspecaoEventoDTO();
    servicoToRm.NROCONTEINER = inspecao.tfcContainerInspecaoDto.NROCONTEINER;
    servicoToRm.TFCCONTEINERINSPECAOID = inspecao.tfcContainerInspecaoDto.TFCCONTEINERINSPECAOID;
    servicoToRm.TIPO = inspecao.tfcContainerInspecaoDto.TIPO;
    servicoToRm.TFCTIPOEVENTOINSPECAOID = servico.TFCTIPOEVENTOINSPECAOID;
    servicoToRm.TFCCONTEINERINSPECAOEVENTOID = servico.TFCCONTEINERINSPECAOEVENTOID;

    excluir(servicoToRm)
      .then(() => {
        buscarDadosApi();
      })
      .catch((err) => {
        dismissLoading();
        console.log('ERRO', err);
        Alert.alert('Atenção', 'Erro ao remover serviço');
      });
  };

  const finalizarServico = () => {
    navigation.navigate('MenuPage', { inspecao });
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
        <View style={styles.form}>
          {opcaoL && opcaoL.length > 0 && (
            <View style={styles.dropdown}>
              <Text style={styles.label}>ADICIONAR SERVIÇO</Text>
              <SelectDropdown
                data={opcaoL}
                onSelect={(selectedItem) => {
                  setServicoSelecionado(selectedItem.TFCTIPOEVENTOINSPECAOID);
                  adicionarServico();
                }}
                renderButtonText={(selectedItem) => selectedItem.DESCRICAO}
                renderItem={(item, index, isSelected) => (
                  <View style={{ ...styles.dropdownItem, ...(isSelected && styles.selectedItem) }}>
                    <Text style={styles.dropdownItemText}>{item.DESCRICAO}</Text>
                  </View>
                )}
                buttonTextAfterSelection={(selectedItem) => selectedItem.DESCRICAO}
                rowTextForSelection={(item) => item.DESCRICAO}
                defaultButtonText="Selecionar Serviço"
                buttonStyle={styles.dropdownButton}
                buttonTextStyle={styles.dropdownButtonText}
                rowStyle={styles.dropdownRow}
                rowTextStyle={styles.dropdownRowText}
              />
            </View>
          )}

          <FlatList
            data={inspecao.tfcConteinerInspecaoEventoDTO}
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
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.confirmButton} onPress={finalizarServico}>
            <Text style={styles.confirmButtonText}>Confirmar</Text>            
          </TouchableOpacity>
        </View>
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
  form: {
    marginBottom: 16,
  },
  dropdown: {
    marginBottom: 16,
  },
  dropdownButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  dropdownButtonText: {
    fontSize: 16,
  },
  dropdownRow: {
    backgroundColor: '#fff',
    borderBottomColor: '#ccc',
  },
  dropdownRowText: {
    fontSize: 16,
  },
  dropdownItem: {
    padding: 10,
  },
  selectedItem: {
    backgroundColor: '#D2D9DF',
  },
  dropdownItemText: {
    fontSize: 16,
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
});

export default GateServicosScreen;

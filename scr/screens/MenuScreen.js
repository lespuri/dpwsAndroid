import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { KDTipo } from '../enum/KDTipo';
import { INSPECAO_CHECKLIST } from '../utils/constants.page';
import {logout} from '../services/login-service';

const handleMenuPress = (title, navigation) => {
  if (title === 'Inspeção de Gate') {
    const inspecaoData = {
      tipo: KDTipo.kdInspecaoGate
    };

    const checklist = INSPECAO_CHECKLIST["kdInspecaoGate"];

    if (checklist) {
      inspecaoData.checklist = checklist;
      inspecaoData.checklist.menuL.forEach((eachObj) => {
        eachObj.isDadosPreenchidos = false;
      });
    }

    navigation.navigate('PesquisarContainer', inspecaoData);
  } else if (title === 'Inspeção de Patio') {
    const inspecaoData = {
      tipo: KDTipo.kdInspecaoPatio
    };

    const checklist = INSPECAO_CHECKLIST["kdInspecaoPatio"];

    if (checklist) {
      inspecaoData.checklist = checklist;
      inspecaoData.checklist.menuL.forEach((eachObj) => {
        eachObj.isDadosPreenchidos = false;
      });
    }

    navigation.navigate('PesquisarContainer', inspecaoData);
  } else {
    Alert.alert('Menu Pressionado', title);
  }
};

const handleLogout = (navigation) => {
  navigation.navigate("Login") 
  logout();
  
};

const fetchData = async (setMenuItems) => {
  try {
    const token = await AsyncStorage.getItem('userToken');

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.dpworldsantos.com/TsaMenu/Get',
      //url: 'http://187.60.22.181:8100/TsaMenu/Get',
      //url: 'http://qa.embraportonline.com.br:8100/TsaMenu/Get',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };

    axios.request(config)
      .then((response) => {
        setMenuItems(response.data
          .filter(item => item.NOME === "Inspeção de Gate" || item.NOME === "Inspeção de Patio")
          .map(item => ({
            id: item.TSARECURSOID.toString(),
            title: item.NOME,
            icon: 'microchip'
          })));
      })
      .catch((error) => {
        console.log("menu", error);
      });
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
};

const renderItem = ({ item, navigation }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={() => handleMenuPress(item.title, navigation)}>
    <Icon name={item.icon || 'default-icon'} size={40} color="#000" style={styles.icon} />
    <Text style={styles.title}>{item.title}</Text>
  </TouchableOpacity>
);

const MenuScreen = () => {
  const [menuItems, setMenuItems] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchData(setMenuItems);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={menuItems}
        renderItem={({ item }) => renderItem({ item, navigation })}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity style={styles.logoutButton} onPress={() => handleLogout(navigation) }>
        <Text style={styles.logoutButtonText}>Sair do Sistema</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    margin: 10,
    width: '45%',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#022E69',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
});

export default MenuScreen;

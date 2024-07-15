import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';


const menuItems = [
  { id: '1', title: 'Conferência Física', icon: 'list-alt' },
  { id: '2', title: 'Menu Customizado ', icon: 'cog' },
  { id: '3', title: 'Menu Customizado ', icon: 'cog' },
  { id: '4', title: 'Menu Customizado ', icon: 'cog' },
  { id: '5', title: 'Menu Customizado ', icon: 'cog' },
  { id: '6', title: 'Menu Customizado ', icon: 'cog' },
];

const handleMenuPress = (title) => {
  Alert.alert('Menu Pressionado', title);
};


const fetchData = async (setMenuItems) => {
  try {
    
    const response = await axios.get('https://api.dpworldsantos.com/TsaMenu/Get');
    const data = response.data.map(item => ({
      id: item.id.toString(),
      title: item.title,
      icon: item.icon,
    }));
    
    
    setMenuItems( 

      [
        { id: '1', title: 'Conferência Física', icon: 'list-alt' },
        { id: '2', title: 'Menu Customizado ', icon: 'cog' },
        { id: '3', title: 'Menu Customizado ', icon: 'cog' },
        { id: '4', title: 'Menu Customizado ', icon: 'cog' },
        { id: '5', title: 'Menu Customizado ', icon: 'cog' },
        { id: '6', title: 'Menu Customizado ', icon: 'cog' },
      ]
    );
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
};

const renderItem = ({ item }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={() => handleMenuPress(item.title)} >
    <Icon name={item.icon} size={40} color="#000" style={styles.icon} />
    <Text style={styles.title}>{item.title}</Text>
    <Icon name="" size={20} color="#000" style={styles.settingsIcon} />
  </TouchableOpacity>
);

const MenuScreen = () => {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    fetchData(setMenuItems);
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
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
  settingsIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default MenuScreen;
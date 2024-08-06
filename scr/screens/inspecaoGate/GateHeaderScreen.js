import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const GateHeaderScreen = ({ conteiner, modalidade, freightkind, tra, checklist, inspecao }) => {
  const navigation = useNavigation();

  const voltarMenu = () => {
    navigation.navigate('MenuInspecao', { inspecao });
  };

  return (
    <View style={styles.header}>
      <View style={styles.navbar}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{conteiner}</Text>
          <Text style={styles.subtitle}>
            {modalidade} {freightkind}
          </Text>
          <Text style={styles.tra}>{tra}</Text>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#f8f8f8',
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
  },
  tra: {
    fontSize: 12,
  },
  buttonEnd: {
    marginLeft: 10,
  },
});

export default GateHeaderScreen;

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const bannerImage = require('../assets/images/LogoDPW.png');

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://api.dpworldsantos.com/token', {
        username,
        password,
        grant_type: 'password'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token } = response.data;

      await AsyncStorage.setItem('userToken', access_token);
      navigation.navigate('Menu');

    } catch (error) {
      Alert.alert('Erro', 'Usuário ou senha inválidos');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={bannerImage}
        style={styles.bannerImage}
      />
      <View style={styles.loginContainer}>
        <Text style={styles.labelText}>E-mail / Login</Text>
        <TextInput
          style={styles.input}
          placeholder="E-mail / Login"
          placeholderTextColor="#A9A9A9"
          value={username}
          onChangeText={setUsername}
        />
        <Text style={styles.labelText}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#A9A9A9"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  loginContainer: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  labelText: {
    width: '100%',
    fontSize: 16,
    color: '#000000',
    marginBottom: 5,
    fontFamily: 'Arial',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#D3D3D3',
    borderBottomWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 16,
    fontFamily: 'Arial',
    color: '#000000',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  forgotPassword: {
    color: '#007BFF',
    fontSize: 14,
    fontFamily: 'Arial',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#022E69',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Arial',
  },
  signUpContainer: {
    marginTop: 10,
  },
  signUp: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'Arial',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;

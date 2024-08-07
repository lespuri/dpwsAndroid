import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './scr/screens/LoginScreen';
import MenuScreen from './scr/screens/MenuScreen';
import PesquisarContainerScreen from './scr/screens/PesquisarContainerScreen';
import MenuInspecaoScreen from './scr/screens/MenuInspecaoScreen';
import GateDadosScreen from './scr/screens/inspecaoGate/GateDadosScreen';
import GateLacresScreen from './scr/screens/inspecaoGate/GateLacresScreen';
import GateAvariaScreen from './scr/screens/inspecaoGate/GateAvariasScreen';
import GateLacresColocadosScreen from './scr/screens/inspecaoGate/GateLacresColocadosScreen';

import { Image, View, StyleSheet } from 'react-native';
import GateAvariasScreen from './scr/screens/inspecaoGate/GateAvariasScreen';

const Stack = createNativeStackNavigator();


function LogoTitle() {
  return (
    <View style={styles.logoContainer}>
      <Image
        style={styles.logo}
        source={require('./scr/assets/images/LogoDPW.png')} // Certifique-se de que o caminho para o logotipo está correto
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 100,
  },
});

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PesquisarContainer" component={PesquisarContainerScreen} />
        <Stack.Screen name="MenuInspecao" component={MenuInspecaoScreen} />
        <Stack.Screen name="GateDados" component={GateDadosScreen} />
        <Stack.Screen name="GateLacres" component={GateLacresScreen} />        
        <Stack.Screen name="GateAvarias" component={GateAvariasScreen} />        
        <Stack.Screen name="GateLacresColocados" component={GateLacresColocadosScreen} />
        <Stack.Screen 
          name="Menu" 
          component={MenuScreen} 
          options={{ 
            headerTitle: (props) => <LogoTitle />,
            headerBackVisible: false, // Remove o botão de voltar
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

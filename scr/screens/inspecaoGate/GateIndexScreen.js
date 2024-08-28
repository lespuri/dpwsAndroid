import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import PesquisarContainerScreen from '../PesquisarContainerScreen';
import GateAvariasScreen from './GateAvariasScreen';
import GateLacresScreen from './GateLacresScreen';
import { useNavigation, useRoute } from '@react-navigation/native';
import GateImoScreen from './GateIMOScreen';

const initialLayout = { width: Dimensions.get('window').width };

export default function GateIndexScreen()  {
  const route = useRoute();
  const navigation = useNavigation();
  const inspecaoData = route.params; // Recebe os dados passados  
    
  const [index, setIndex] = React.useState(0);
  const [inspecao, setInspecao] = useState(inspecaoData);

  const [routes] = React.useState([
    { key: 'pesquisa', title: 'Conteiner' },
    
    { key: 'avarias', title: 'Avarias' },
    
    { key: 'lacres', title: 'Lacres' },

    { key: 'imo', title: 'IMO' },
    
  ]);
      
  const renderScene = SceneMap({    
    pesquisa: () => <PesquisarContainerScreen setInspecaoGlobal={setInspecao} setIndex={setIndex} />, // Passa setIndex como prop
    avarias: () => <GateAvariasScreen inspecao={inspecao}  setIndex={setIndex}/>,    
    lacres: () => <GateLacresScreen inspecao={inspecao} setIndex={setIndex} />,
    imo: () => <GateImoScreen inspecao={inspecao} setIndex={setIndex} />,
    
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={initialLayout}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          scrollEnabled
          indicatorStyle={{ backgroundColor: '#022E69' }}
          style={{ backgroundColor: 'white' }}
          activeColor="#022E69"
          inactiveColor="gray"
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
  },
});

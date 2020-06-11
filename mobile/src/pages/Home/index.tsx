import React, { useState, useEffect } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { StyleSheet, Image, ImageBackground, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import PickerSelect from 'react-native-picker-select';

import { ibge } from '../../services/api';

interface City {
  id: number;
  name: string;
}

interface Uf {
  initials: string;
  name: string;
}

interface IBGEUFResponse {
  sigla: string;
  nome: string;
}

interface IBGECityResponse {
  id: number;
  nome: string;
}

const Home = () => {
  const navigation = useNavigation();

  const [cities, setCities] = useState<City[]>([]);
  const [ufs, setUFs] = useState<Uf[]>([]);

  const [uf, setUf] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    ibge.get<IBGEUFResponse[]>('localidades/estados').then(response => {
      const ufs = response.data.map(uf => ({ initials: uf.sigla, name: uf.nome }));
      ufs.sort((a, b) => a.initials.localeCompare(b.initials));
      setUFs(ufs);
    });
  }, []);

  useEffect(() => {
    if (uf === '0') {
      return;
    }

    ibge.get<IBGECityResponse[]>(`localidades/estados/${uf}/municipios`).then(response => {
      const cities = response.data.map(city => ({ id: city.id, name: city.nome }));

      setCities(cities);
    });
  }, [uf]);

  function handleNavigateToPoints() {
    navigation.navigate('Points', { uf, city });
  }

  return (
    <KeyboardAvoidingView 
      behavior={ Platform.OS === 'ios' ? 'padding' : undefined } 
      style={{flex: 1}}>
      <ImageBackground 
        style={styles.container} 
        source={require('../../assets/home-background.png')}
        imageStyle={{ width: 274, height: 368 }}
      >
        <View style={styles.main}>
          <Image source={require('../../assets/logo.png')} />
          <View>
            <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
            <Text style={styles.description}>Ajudamos pessoas a encontrar pontos de coleta de forma eficiente</Text>
          </View>
        </View>
    
        <View style={styles.footer}>
          <PickerSelect 
            placeholder={{ label: 'Selecione a UF', value: '' }}
            items={ufs.map(uf => ({ label: `${uf.initials} - ${uf.name}`, value: uf.initials }))}
            onValueChange={uf => setUf(uf)}
            style={{ inputAndroid: styles.input, inputIOS: styles.input }}
          />
          <PickerSelect 
            disabled={!uf}
            placeholder={{ label: 'Selecione a cidade', value: '' }}
            items={cities.map(city => ({ label: city.name, value: city.name }))}
            onValueChange={city => setCity(city)}
            style={{ inputAndroid: styles.input, inputIOS: styles.input }}
          />
          <RectButton style={styles.button} onPress={handleNavigateToPoints}>
            <View style={styles.buttonIcon}>
              <Text> 
                <Icon name="arrow-right" color="#fff" size={24}/>
              </Text>
            </View>
            <Text style={styles.buttonText}>
              Entrar
            </Text>
          </RectButton>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {
    backgroundColor: Platform.OS === 'android' ? '#f0f0f5' : undefined
  },

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});
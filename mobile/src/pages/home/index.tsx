import React, {useEffect, useState} from 'react';
import { View, ImageBackground, Image, StyleSheet, Text, KeyboardAvoidingView, Platform} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import {Feather as Icon } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';


interface UFProps {
  label: string,
  value: string,
}
interface UF {
  sigla: string,
  nome: string,
}
interface Cities {
  nome: string,
}
const Home = () => {
  const navigation = useNavigation();
  function handleNavigationToPoints(){
    navigation.navigate('Points',{
      uf: selectedUF,
      city: selectedCity
    });
  };

  const [UFs, setUFs] = useState<UFProps[]>([])
  const [cities, setCities] = useState<UFProps[]>([])
  const [selectedUF, setSelectedUF] = useState('0')
  const [selectedCity, setSelectedCity] = useState('0')

  useEffect(() => {
    axios
      .get<UF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => {
        const UFinitials = response.data.sort((a, b) => a.nome.localeCompare(b.nome)).map(uf => {
          return { label: uf.nome, value: uf.sigla }

        })
        setUFs(UFinitials);
      })
  }, [])


  useEffect(() => {
    if (selectedUF === '0') {
      return
    }
    axios
      .get<Cities[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
      .then(response => {
        const getCities = response.data.map(city => { return { label: city.nome, value: city.nome } })
        setCities(getCities)
      })
  }, [selectedUF])


  function handleSeletecdUF(id: string) {
    setSelectedUF(id)
  }
  function handleSeletecdCitie(id: string) {
    setSelectedCity(id)
  }

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ImageBackground
          source={require('../../assets/home-background.png')}
          style={styles.container}
          imageStyle={{ width: 274, height: 368 }}
        >
          <Image source={require('../../assets/logo.png')} />

          <Text style={styles.title}>
            Seu marketplace de coleta de resíduos
          </Text>
          <Text style={styles.description}>
            Ajudamos pessoas a encrontrarem pontos de coleta de forma eficiente.{' '}
          </Text>

          <View style={styles.footer}>
          
            <View style={styles.select}>
              <View style={styles.input}>
                <RNPickerSelect
                  value={selectedUF}
                  onValueChange={(value) => handleSeletecdUF(value)}
                  items={UFs}
                />
              </View>
              <View style={styles.input}>
                <RNPickerSelect
                  value={selectedCity}
                  onValueChange={(value) => handleSeletecdCitie(value)}
                  items={cities}
                />
              </View>
            </View>  
            
           
            
            
            <RectButton
              style={styles.button}
              onPress={handleNavigationToPoints}
            >
              <View style={styles.buttonIcon}>
                <Text>
                  <Icon name="arrow-right" color="#FFF" size={24} />
                </Text>
              </View>

              <Text style={styles.buttonText}>Entrar</Text>
            </RectButton>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
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
      flex: 1,
      justifyContent: "flex-start",
      alignContent: "space-between",
      marginTop: 40,
      marginEnd: 5
    },

    select: {
      marginBottom: 10 
    },

    input: {
      height: 60,
      backgroundColor: '#FFF',
      borderRadius: 10,
      justifyContent: "center",
      marginBottom: 8,
      paddingTop: 20,
      paddingHorizontal: 24,
      padding: 20,
      fontSize: 20,
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


export default Home;
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Image } from "react-native";
import {Link} from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, startAfter, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyC1eKSV7e9L_nQMYEkPmD2qjcwNAALS1rU",
  authDomain: "smartcontainerapp.firebaseapp.com",
  projectId: "smartcontainerapp",
  storageBucket: "smartcontainerapp.appspot.com",
  messagingSenderId: "1086527239265",
  appId: "1:1086527239265:web:94cd36d5f08a3245cf6620",
  databaseURL: "https://smartcontainerapp-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

export default function Page() {
    const [humi, setHumi] = useState(null);
  const [temp, setTemp] = useState(null);
  useEffect(() => {

    const updateHumi = (value) => {
      setHumi(value);
    };

    const updateTemp = (value) => {
      setTemp(value);
    };

    const humiRef = ref(getDatabase(), '/humidity');
    const tempRef = ref(getDatabase(), '/temperature');


    onValue(humiRef, (snapshot) => {
      const data = snapshot.val();
      updateHumi(data);
    });

    onValue(tempRef, (snapshot) => {
      const data = snapshot.val();
      updateTemp(data);
    });
},[]);
  return (
    <View style={styles.container}>
            <View style={{flexDirection:'row'}}>
      <Link href="/home">
        <Icon name="chevron-left" size={35} color="#900" />
      </Link>
      <Text style={{top:'3%', fontSize:18}}>Sensor Readings</Text>
      </View>
      <View style={{width:"100%",height:"100%", flexDirection:"column", left:"10%", top:"5%"}}>
        <View style={styles.section}>
          <View style={styles.icon}>
          <Icon name="thermometer" size={70} color="#900" />
          <Text style={styles.reading}>{temp}°C</Text>
        </View>
        </View>
        <View style={styles.section}>
          <View style={styles.icon}>
          <Icon name="droplet" size={70} color="#900"/>
          <Text style={styles.reading}>{humi}g.m-3</Text>
        </View>
        </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
  section:{
    backgroundColor: '#87CEEB',
    width: '85%',
    height: '40%',
    borderRadius:30,
  },
  icon:{
    flex: 1,
    alignItems: 'center', 
    top:"20%",
  },
  reading:{
    top:'8%',
    fontSize:60,
    fontWeight:'bold'
  },
});

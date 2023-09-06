import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Alert, Pressable, Image } from "react-native";
import { Link } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage'; // Import Storage dependencies

const firebaseConfig = {
  apiKey: "AIzaSyC1eKSV7e9L_nQMYEkPmD2qjcwNAALS1rU",
  authDomain: "smartcontainerapp.firebaseapp.com",
  projectId: "smartcontainerapp",
  storageBucket: "smartcontainerapp.appspot.com",
  messagingSenderId: "1086527239265",
  appId: "1:1086527239265:web:94cd36d5f08a3245cf6620",
  databaseURL: "https://smartcontainerapp-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase();

export default function Page() {
  const [intrudervar, setIntruder] = useState(null);
  const [doorStatus, setDoorStatus] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  
  const toggleDoorStatus = () => {
    const newStatus = doorStatus === 1 ? 0 : 1;
    setDoorStatus(newStatus);

    // Update the "door_status" value in Firebase
    set(ref(db, '/door_status'), newStatus)
      .then(() => console.log('Door status updated in Firebase'))
      .catch(error => console.error('Error updating door status:', error));
  };

  const createTwoButtonAlert = () =>
    Alert.alert('Look out', 'Intruder alert', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      { text: 'OK', onPress: () => console.log('OK Pressed') },
    ]);

  useEffect(() => {
    const intruder = ref(getDatabase(), '/intruder');

    onValue(intruder, (snapshot) => {
      const data = snapshot.val();
      setIntruder(data); // Update the intruder state

      if (data === 1) {
        createTwoButtonAlert(); // Trigger the alert when intruder value is 1
      }
    });
  }, []);

    const handleBoxPress = async () => {
    try {
      const storage = getStorage();
      const imageRef = storageRef(storage, 'data/photo.jpg'); // Replace with your image path
      const imageUrl = await getDownloadURL(imageRef);

      // Now you can set the URL in your state to display the image
      setImageUrl(imageUrl); // Assuming you have a state variable to store the image URL
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  return (
    <View style={styles.container}>
     <Image source={require('../icon/logo.jpg')} style={{width:"18%", height:"10%"}}/>
      <Text style={styles.title}>Contag</Text>
      <Text style={styles.subtitle}>Control, monitor and more with just one app.</Text>
      <View style={{ flexDirection: 'row', top: '5%' }}>
        <Link href="/map"><Icon name="map" size={80} color="#900" /></Link>
        <View style={{ width: "20%" }} />
        <Link href="/sensors"><Icon name="smile" size={80} color="#900" /></Link>
      </View>
      <View style={{backgroundColor:"#87CEEB", width:"90%", height:"15%", borderRadius:25, top:"25%", justifyContent:"center", alignItems:"center"}}>
        <Pressable  onPress={handleBoxPress}>
        <Icon name="box" size={80} color="#900"/>
        </Pressable>
      </View>
      {imageUrl && <Image source={{ uri: imageUrl }} style={{ width: 250, height: 250, marginTop:225}} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 50,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 13,
    color: "#38434D",
  },
});

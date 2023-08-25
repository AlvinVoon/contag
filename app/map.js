import React, { useEffect, useState, useRef } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { Link } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';

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

export default function App() {
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [polylineCoordinates, setPolylineCoordinates] = useState([]);
  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [isOnline, setIsOnline] = useState(false);
  const offlineTimerRef = useRef(null);

  const handleSwitchToggle = () => {
    setIsSwitchOn((prevState) => !prevState);
    updateFirebaseValue(!isSwitchOn);
  };

  const updateFirebaseValue = (value) => {
    const firebaseRef = ref(db, '/door_status');
    set(firebaseRef, value ? 1 : 0);
  };

  const startOfflineTimer = () => {
    offlineTimerRef.current = setTimeout(() => {
      setIsOnline(false);
    }, 60000); // 1 minute
  };

  const resetOfflineTimer = () => {
    clearTimeout(offlineTimerRef.current);
    startOfflineTimer();
  };

  useEffect(() => {
    const firebaseRef = ref(db, '/location_history');
    const unsubscribe = onValue(firebaseRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const coordinates = Object.values(data).map((point) => ({
          latitude: point.latitude,
          longitude: point.longitude,
        }));
        setPolylineCoordinates(coordinates);
        const latestPoint = coordinates[coordinates.length - 1];
        setMarkerCoordinate(latestPoint);
        setIsOnline(true);
        resetOfflineTimer();
      } else {
        setIsOnline(false);
      }
    });

    startOfflineTimer();

    return () => {
      unsubscribe();
      clearTimeout(offlineTimerRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Link href="/home">
        <Icon name="chevron-left" size={35} color="#900" />
      </Link>
      {markerCoordinate.latitude !== 0 && markerCoordinate.longitude !== 0 && (
        <MapView
          style={styles.map}
          region={{
            latitude: markerCoordinate.latitude,
            longitude: markerCoordinate.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          <Marker coordinate={markerCoordinate} pinColor="red" />
          <Polyline
            coordinates={polylineCoordinates}
            strokeColors={['#DB3434']}
            strokeWidth={8}
          />
        </MapView>
      )}
      <View style={styles.tab}>
        <Pressable
          onPress={() => {
            console.log('Hello World1');
          }}
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white',
            },
          ]}
        >
          <Icon name="clock" size={35} color="#900" />
        </Pressable>
        <View style={{ width: 5, height: '100%', backgroundColor: '#000000' }} />
        <Pressable>
          <Icon name="list" size={35} color="#900" />
        </Pressable>
      </View>
      <View
        style={[
          styles.statusIndicator,
          {
            backgroundColor: isOnline ? 'green' : 'red',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    width: '100%',
    height: '100%',
  },
  map: {
    width: '100%',
    height: '85%',
  },
  tab: {
    backgroundColor: '#ffffff',
    width: '100%',
    height: '15%',
    flexDirection: 'row',
    marginTop:'3%',
    justifyContent: 'space-evenly',
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    top: '10%',
    right: '5%',
  },
});

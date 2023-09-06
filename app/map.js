import React, { useEffect, useState, useRef } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
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
    latitude: 1.8581,
    longitude: 103.50252,
  });
  const [isOnline, setIsOnline] = useState(false);
  const offlineTimerRef = useRef(null);
  const [isMarkerVisible, setIsMarkerVisible] = useState(false);
  const [mapCoordinate, setMapCooridnate] = useState({
    latitude: markerCoordinate.latitude,
    longitude: markerCoordinate.longitude,
  });
  const [mapRegion, setMapRegion] = useState({
    latitude: markerCoordinate.latitude,
    longitude: markerCoordinate.longitude,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });
  const [lastMarker, setLastMarker] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [lastPoly, setLastPoly] = useState({
    latitude: 0,
    longitude: 0,
  });

  const handleClockIconPress = () => {
    setIsMarkerVisible(true);
    console.log(isMarkerVisible);
  };

  const handleListIconPress = () => {
    setIsMarkerVisible(false);
    console.log(isMarkerVisible);
  };

  const handleSwitchToggle = () => {
    setIsSwitchOn((prevState) => !prevState);
    updateFirebaseValue(!isSwitchOn);
  };

  const startOfflineTimer = () => {
    offlineTimerRef.current = setTimeout(() => {
      setIsOnline(false);
    }, 30000); // 30 seconds
  };

  const resetOfflineTimer = () => {
    clearTimeout(offlineTimerRef.current);
    startOfflineTimer();
  };

  useEffect(() => {
    const markerfirebaseRef = ref(db, '/location_real');
    const polylineFirebaseRef = ref(db, '/location_history');

    const markerUnsubscribe = onValue(markerfirebaseRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMarkerCoordinate({
          latitude: data.latitude,
          longitude: data.longitude,
        });
        setMapCooridnate({
          latitude: data.latitude,
          longitude: data.longitude,
        });
        setLastMarker({
          latitude: data.latitude,
          longitude: data.longitude,
        });
        setIsOnline(true);
        resetOfflineTimer();
      } else {
        setIsOnline(false);
      }
    });

    const polylineUnsubscribe = onValue(polylineFirebaseRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const coordinates = Object.values(data).map((point) => ({
          latitude: point.latitude,
          longitude: point.longitude,
        }));

        if (coordinates.length > 0) {
          const minLat = Math.min(...coordinates.map(point => point.latitude));
          const maxLat = Math.max(...coordinates.map(point => point.latitude));
          const minLng = Math.min(...coordinates.map(point => point.longitude));
          const maxLng = Math.max(...coordinates.map(point => point.longitude));

          const centerLat = (minLat + maxLat) / 2;
          const centerLng = (minLng + maxLng) / 2;
          const latDelta = Math.abs(maxLat - minLat) * 1.5;
          const lngDelta = Math.abs(maxLng - minLng) * 1.5;

          setMapCooridnate({
            latitude: centerLat,
            longitude: centerLng,
          });

          setMapRegion({
            latitude: centerLat,
            longitude: centerLng,
            latitudeDelta: latDelta,
            longitudeDelta: lngDelta,
          });

          setLastPoly({
            latitude: centerLat,
            longitude: centerLng,
          });
        }

        setPolylineCoordinates(coordinates);
      }
    });

    startOfflineTimer();

    return () => {
      markerUnsubscribe();
      polylineUnsubscribe();
      clearTimeout(offlineTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isMarkerVisible) {
      setMapCooridnate(lastMarker);
    } else {
      setMapCooridnate(lastPoly);
    }
  }, [isMarkerVisible]);

  return (
    <View style={styles.container}>
      <View style={{flexDirection:'row'}}>
      <Link href="/home">
        <Icon name="chevron-left" size={35} color="#900" />
      </Link>
      <Text style={{left:'325%', top:'3%', fontSize:18}}>MAP</Text>
      </View>
      {markerCoordinate.latitude !== 0 && markerCoordinate.longitude !== 0 && (
        <MapView
          style={styles.map}
          region={isMarkerVisible ? mapCoordinate : mapRegion}
        >
          {isMarkerVisible && <Marker coordinate={markerCoordinate} pinColor="red" />}
          {!isMarkerVisible && (
            <Polyline coordinates={polylineCoordinates} strokeColors={['#DB3434']} strokeWidth={8} />
          )}
        </MapView>
      )}
      <View style={styles.tab}>
        <Pressable
          onPress={handleClockIconPress}

        >
          <Icon name="clock" size={35} color="#900" />
          <Text>REALTIME</Text>
        </Pressable>
        <View style={{ width: 5, height: '100%', backgroundColor: '#000000' }} />
        <Pressable onPress={handleListIconPress}>
          <Icon name="list" size={35} color="#900" />
          <Text>HISTORY</Text>
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
    marginTop: '3%',
    justifyContent: 'space-evenly',
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    top: '2%',
    right: '5%',
  },
});

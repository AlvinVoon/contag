import { StyleSheet, Text, View, Button } from "react-native";
import {Link} from 'expo-router';

export default function Page() {
  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Main</Text>
        <Text style={styles.subtitle}>This is the first page of your app.</Text>
        <Link href="/map">Map</Link>
        <View style={styles.tab}></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
  tab:{
    backgroundColor:"#000000",
    width:"100%",
  },
});

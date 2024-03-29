/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useRef, useState } from 'react';
import { 
  NativeModules, 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Text, 
  View,
  TouchableOpacity
} from 'react-native';
import { Button } from './components/Button';
import { Modal } from './components/Modal';

interface ILog {
  command: string;
  result: any;
}

export default function App() {
  const [mapping, setMapping] = useState(null);
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const toggleModalVisibility = () => {
    setIsModalVisible(visible => !visible);
  }

  // Function to handle button click and display the mapping values
  const handleButtonClick = async () => {
    const newMapping = await NativeModules.SimData.getSimCardsNative();
    setMapping(newMapping);
  };

  const getEIDs = async () => {
    try {
      const eid = await NativeModules.EuiccManager.getEID();
      console.log("EID: ", eid);
    } catch(e) {
      console.log("error occurred: ", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View style={styles.separator} />
      <Button title="button" onPress={toggleModalVisibility} />
      <Modal isVisible={isModalVisible}>
        <View style={{ flex: 1 }}>
          <Text>Hello!</Text>
          <Button title="Hide modal" onPress={toggleModalVisibility} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  text: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});

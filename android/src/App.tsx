/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  NativeModules,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PermissionsAndroid
} from 'react-native';
import { Button } from './components/Button';
import { Modal } from './components/Modal';

import { MMKVLoader, useMMKVStorage } from 'react-native-mmkv-storage';

interface ILog {
  command: string;
  result: any;
}

export default function App() {
  const [mapping, setMapping] = useState(null);
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [identifier, setIdentifier] = React.useState('');
  const storageObj = new MMKVLoader().initialize();

  const toggleModalVisibility = () => {
    setIsModalVisible(visible => !visible);
  }

  // Store and retrieve data
  //TODO Handle other datatypes
  const storeData = (key, value) => {
    storageObj.setString(key, value); 
  };

  const retrieveData = (key) => {
    return storageObj.getString(key);
  }
  
  const getEIDs = async () => {
    try {
      const eid = await NativeModules.EuiccManager.getEID();
      console.log("EID: ", eid);
    } catch (e) {
      console.log("error occurred: ", e);
    }
  };

  const requestPhoneStatePermission = async () => {
    try {
      console.log('Asking permission');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
        {
          title: 'Read Phone Number Permission',
          message:
            'LPA App needs acces to your phone state ' +
            'Grant permission for accessing eid',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Phone Number Access Granted');
      } else {
        console.log('Permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    console.log('UseEffect Asking permission');
    (async () => { await requestPhoneStatePermission(); })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!isModalVisible) return;
      const id = await getUniqueIdentifier();
      setIdentifier(id);
    })();
  }, [isModalVisible])

  const getUniqueIdentifier = async () => {
    try {
      const phNumber = await NativeModules.IdentityManager.getDefaultPhoneNumber();
      console.log("phNumber: ", phNumber);

      const uniqueIdentifier = await NativeModules.IdentityManager.generateIdentifier(phNumber);
      console.log("uniqueIdentifier: ", uniqueIdentifier);
      storeData(phNumber, uniqueIdentifier);

      return retrieveData(phNumber);
    } catch (error) {
      console.log('error', error);
      return 'Error';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Homepage</Text>
      <View style={styles.separator} />
      <Button title="button" onPress={toggleModalVisibility} />
      <Modal isVisible={isModalVisible}>
        <Modal.Container>
          <Modal.Header title="Device Data" />
          <Modal.Body>
            <Text style={styles.text}>{identifier}</Text>
          </Modal.Body>
          <Modal.Footer>
            <Button title="Back" onPress={toggleModalVisibility} />
          </Modal.Footer>
        </Modal.Container>
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

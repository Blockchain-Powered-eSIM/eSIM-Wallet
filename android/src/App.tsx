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
  // TODO: Handle other datatypes
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
      await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE, PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS]).then((result) => {
          if (result['android.permission.READ_PHONE_STATE'] && result['android.permission.READ_PHONE_NUMBERS'] === 'granted') {
            this.setState({ permissionsGranted: true });
          } 
          else if (result['android.permission.READ_PHONE_STATE'] || result['android.permission.READ_PHONE_NUMBERS']  === 'never_ask_again') {
            this.refs.toast.show('Please Go into Settings -> Applications -> APP_NAME -> Permissions and Allow permissions to continue');
          }
        });
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

    const phNumber = await NativeModules.IdentityManager.getDefaultPhoneNumber();
    console.log("phNumber: ", phNumber);

    try {
      const retrievedHash = retrieveData(phNumber);
      console.log("retrievedHash: ", retrievedHash);

      return retrievedHash;
    } catch (error) {
      try {
        const uniqueIdentifier = await NativeModules.IdentityManager.generateIdentifier(phNumber);
        console.log("uniqueIdentifier: ", uniqueIdentifier);
        storeData(phNumber, uniqueIdentifier);

        return retrieveData(phNumber);
      } catch (error) {
        console.log("error: ", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>eSIM Wallet app</Text>
      <View style={styles.separator} />
      <Button title="Fetch Unique ID" onPress={toggleModalVisibility} />
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

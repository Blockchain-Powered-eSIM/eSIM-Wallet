/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useRef, useState} from 'react';
import {
  NativeModules,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PermissionsAndroid,
} from 'react-native';

import { Button } from './components/Button';
import { Modal } from './components/Modal';
var RNFS = require('react-native-fs');

import {MMKVLoader, useMMKVStorage} from 'react-native-mmkv-storage';

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
  };

  // Store and retrieve data
  // TODO: Handle other datatypes
  const storeData = (key, value) => {
    storageObj.setString(key, value);
  };

  const retrieveData = key => {
    return storageObj.getString(key);
  };

  const getEIDs = async () => {
    try {
      const eid = await NativeModules.EuiccManager.getEID();
      console.log('EID: ', eid);
    } catch (e) {
      console.log('error occurred: ', e);
    }
  };

  const requestPhoneStatePermission = async () => {
    try {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
      ]).then(result => {
        if (
          result['android.permission.READ_PHONE_STATE'] &&
          result['android.permission.READ_PHONE_NUMBERS'] === 'granted'
        ) {
          this.setState({permissionsGranted: true});
        } else if (
          result['android.permission.READ_PHONE_STATE'] ||
          result['android.permission.READ_PHONE_NUMBERS'] === 'never_ask_again'
        ) {
          this.refs.toast.show(
            'Please Go into Settings -> Applications -> APP_NAME -> Permissions and Allow permissions to continue',
          );
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    console.log('UseEffect Asking permission');
    (async () => {
      await requestPhoneStatePermission();
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!isModalVisible) return;
      const id = await getUniqueIdentifier();
      setIdentifier(id);
    })();
  }, [isModalVisible]);

  const getUniqueIdentifier = async () => {
    const phNumber =
      await NativeModules.IdentityManager.getDefaultPhoneNumber();
    console.log('phNumber: ', phNumber);

    const retrievedHash = retrieveData(phNumber);
    console.log('retrievedHash: ', retrievedHash);

    await checkKeyStore();

    if(retrievedHash == null) {
      try {
        const uniqueIdentifier =
          await NativeModules.IdentityManager.generateIdentifier(phNumber);
        console.log('uniqueIdentifier: ', uniqueIdentifier);
        storeData(phNumber, uniqueIdentifier);

        return retrieveData(phNumber);
      } catch (error) {
        console.log('error: ', error);
      }
    } else {
      return retrieveData(phNumber);
    }
  };

  const checkKeyStore = async () => {
    try {
      const msg = await NativeModules.KeyStore.generateAndStoreECKeyPairWithSignature("LPAapp", "Test123");
      console.log(msg);

      const keys = await NativeModules.KeyStore.retrieveKeyPair("LPAapp");
      console.log("Keys: ", keys);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const handleKMM = async () => {
    // Generate mnemonic
    const mnemonic = await NativeModules.ECKeyManager.generateBIP39Mnemonic();
    console.log(mnemonic);

    // Create wallet for the mnemonic and save the JSON file in the Downloads folder
    const fileName = await NativeModules.ECKeyManager.generateAndSaveWallet(mnemonic, "Test123", RNFS.DownloadDirectoryPath);
    console.log("fileName: ", fileName);

    // Fetch address after unlocking the keystore JSON file
    const address = await NativeModules.ECKeyManager.loadCredentialsFromFile("Test123", RNFS.DownloadDirectoryPath + "/" + fileName);
    console.log("address: ", address);
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});

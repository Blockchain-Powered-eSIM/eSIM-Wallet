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

import {Button} from './components/Button';
import {Modal} from './components/Modal';
import {getData} from './endpoints/api_handles';
var RNFS = require('react-native-fs');

import {MMKVLoader, useMMKVStorage} from 'react-native-mmkv-storage';

interface ILog {
  command: string;
  result: any;
}

export default function App() {
  const [mapping, setMapping] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [encryptedKey, setEncryptedKey] = useState('');
  const [isKeyModalVisible, setIsKeyModalVisible] = useState(false);
  const [isTransactionModalVisible, setIsTransactionModalVisible] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const storageObj = new MMKVLoader().initialize();

  const toggleModalVisibility = () => {
    setIsModalVisible(visible => !visible);
  };

  const toggleKeyModalVisibility = () => {
    setIsKeyModalVisible(visible => !visible);
  };

  const toggleTransactionModalVisibility = () => {
      setIsTransactionModalVisible(visible => !visible);
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

  // Template to get data associated to device identifier from database
  //useEffect(() => {
  //    const fetchData = async () => {
  //    try {
  //    const result = await getData('some-user-id');
  //    setData(result);
  //    } catch (err) {
  //    setError(err);
  //    }
  //    };

  //    fetchData();
  //    }, []);

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
    try {
      const phNumber =
        await NativeModules.IdentityManager.getDefaultPhoneNumber();
      console.log('phNumber: ', phNumber);

      const retrievedHash = retrieveData(phNumber);
      console.log('retrievedHash: ', retrievedHash);

      await checkKeyStore();

      if (retrievedHash == null) {
        const uniqueIdentifier =
          await NativeModules.IdentityManager.generateIdentifier(phNumber);
        console.log('uniqueIdentifier: ', uniqueIdentifier);
        storeData(phNumber, uniqueIdentifier);

        return retrieveData(phNumber);
      } else {
        return retrieveData(phNumber);
      }
    } catch (error) {
      console.log('error: ', error);
    }
  };

  const checkKeyStore = async () => {
    try {
      const appAlias = 'TestAPP';
      const {encrypted_key, msg} =
        await NativeModules.KeyStore.generateAndStoreECKeyPair(
          appAlias,
          'Test123',
          RNFS.DownloadDirectoryPath,
        );
      console.log(msg);
      console.log(encrypted_key);

      storeData(appAlias, encrypted_key);
      console.log('Encrypted Key Securely Stored');

      setEncryptedKey(encrypted_key);
      toggleKeyModalVisibility();
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  const handleKMM = async () => {
    try {
      const mnemonic = await NativeModules.ECKeyManager.generateBIP39Mnemonic();
      console.log(mnemonic);

      const fileName = await NativeModules.ECKeyManager.generateAndSaveWallet(
        mnemonic,
        'Test123',
        RNFS.DownloadDirectoryPath,
      );
      console.log('fileName: ', fileName);

      const address = await NativeModules.ECKeyManager.loadCredentialsFromFile(
        'Test123',
        `${RNFS.DownloadDirectoryPath}/${fileName}`,
      );
      console.log('address: ', address);
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  // Call the exposed method when the "Sign Transaction" button is pressed
  const handleSignTransaction = async () => {
    try {
      const keystorePath = '/path/to/keystore/file';
      const walletPassword = 'walletPassword';
      const to = '0xC479b44CF3Af681700F900ed7767154be43177e1';
      const from = '0x7E97763E973F4E3D3D347559BD7D812EB8EA88DA'; // Temporary
      const value = '1000000000000000'; // in wei
      const calldata = ''; // Fill with appropriate value if needed
      const gasPrice = '27000000000'; // in wei
      const gasLimit = '21000';
      const nonce = ''; // Fill with appropriate value

      const transactionHash =
        await NativeModules.ECTransactionManager.initiateTransaction(
          keystorePath,
          walletPassword,
          to,
          from,
          value,
          calldata,
          gasPrice,
          gasLimit,
          nonce,
        );

      console.log('Transaction hash:', transactionHash);
      toggleTransactionModalVisibility();
    } catch (error) {
      console.error('Error:', error);
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
      <Button title="Generate EC KeyPair" onPress={checkKeyStore} />
      <Modal isVisible={isKeyModalVisible}>
        <Modal.Container>
          <Modal.Header title="Encrypted Private Key" />
          <Modal.Body>
            <Text style={styles.text}>{encryptedKey}</Text>
          </Modal.Body>
          <Modal.Footer>
            <Button title="Back" onPress={toggleKeyModalVisibility} />
          </Modal.Footer>
        </Modal.Container>
      </Modal>
      <Button title="Sign Transaction" onPress={handleSignTransaction} />
      <Modal isVisible={isTransactionModalVisible}>
              <Modal.Container>
                <Modal.Header title="Transaction Details" />
                <Modal.Body>
                  <Text style={styles.text}>{"TEST-Tx"}</Text>
                </Modal.Body>
                <Modal.Footer>
                  <Button title="Back" onPress={toggleTransactionModalVisibility} />
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

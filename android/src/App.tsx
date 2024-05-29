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
import Config from 'react-native-config';

import {Button} from './components/Button';
import {Modal} from './components/Modal';
import {getData} from './endpoints/api_handles';
var RNFS = require('react-native-fs');

import {MMKVLoader, useMMKVStorage} from 'react-native-mmkv-storage';

import axios from 'axios';
import {Image} from 'react-native';
// import https from 'follow-redirects/https';

// import {encode} from 'base64-arraybuffer';

// import dotenv from 'dotenv';
// dotenv.config({path: '../../.env'});

module.exports;

interface ILog {
  command: string;
  result: any;
}

interface Plan {
  id: number;
  description: string;
}

export default function App() {
  const [mapping, setMapping] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imagePlace, setImage] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [masterKeyStoreAddress, setMasterKeyStoreAddress] = useState('');
  const [isKeyModalVisible, setIsKeyModalVisible] = useState(false);
  const [isTransactionModalVisible, setIsTransactionModalVisible] =
    useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const storageObj = new MMKVLoader().initialize();

  // console.log(Config);

  const [isPlanModalVisible, setPlanModalVisibility] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);
  const [eSIMPlans, setEsimPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [orgData, setOrgData] = useState<any>(null);
  const [isOrgModalVisible, setIsOrgModalVisible] = useState(false);

  // const REACT_APP_eSIM_GO_API_KEY = process.env['REACT_APP_eSIM_GO_API_KEY'];

  const [pngImage, setPngImage] = useState<string | null>(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  const DEVICE_IDENTIFIER = 'deviceIDKey';
  const EC_PUBLIC_KEY = 'ecPubKey';
  const ENCRYPTED_EC_PRIVATE_KEY = 'encryptPrivKey';
  const appAlias = 'TestAPP';
  const PURCHASE_RESPONSE = 'TestPurchasedESIM';
  const MASTER_KEYSTORE_ADDRESS = 'ecAddress';

  const fetchOrgData = async () => {
    try {
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.esim-go.com/v2.3/organisation',
        headers: {
          'X-API-Key': '', // Replace with your actual API key
          'Content-Type': 'application/json',
        },
      };

      const response = await axios.request(config); // Await Axios request
      const orgDetail = response.data?.organisations[0]?.productDescription;

      // console.log(JSON.stringify(response.data));
      console.log(orgDetail);
      setOrgData(orgDetail);
      setIsOrgModalVisible(true);
    } catch (error) {
      console.error('Error fetching organization data:', error);
    }
  };

  const handleBuyESIM = async () => {
    // const plans = await getCatalogue();
    // Using test values for eSIM plans instead of fetching from an API
    const testPlans = [
      {id: 1, description: 'Plan A - 5GB for $10'},
      {id: 2, description: 'Plan B - 10GB for $15'},
      {id: 3, description: 'esim_1GB_7D_IN_V2'},
    ];
    setEsimPlans(testPlans);
    setPlanModalVisibility(true);
  };

  const handlePlanSelection = (selectedPlan: Plan) => {
    setSelectedPlan(selectedPlan);
    setPlanModalVisibility(false);
    setConfirmModalVisibility(true);
  };

  // const fetchPngImage = async (iccid: string) => {
  //   const options = {
  //     method: 'GET',
  //     hostname: 'api.esim-go.com',
  //     path: `/v2.3/esims/${iccid}/qr`,
  //     headers: {
  //       'X-API-Key': '',
  //       'Content-Type': 'application/json',
  //     },
  //     maxRedirects: 20,
  //   };

  //   const req = https.request(options, function (res) {
  //     const chunks: Uint8Array[] = [];

  //     res.on('data', function (chunk) {
  //       chunks.push(chunk);
  //     });

  //     res.on('end', function () {
  //       const body = Buffer.concat(chunks);
  //       const imageBase64 = body.toString('base64');
  //       setPngImage(imageBase64);
  //       setIsImageModalVisible(true);
  //     });

  //     res.on('error', function (error) {
  //       console.error(error);
  //     });
  //   });

  //   req.end();
  // };

  const fetchPngImage = async (iccid: string) => {
    try {
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.esim-go.com/v2.3/esims/${iccid}/qr`,
        headers: {
          'X-API-Key': '', // Replace with your actual API key
          'Content-Type': 'application/json',
        },
      };

      const response = await axios.request(config);

      const imageBase64 = response.data;
      console.log('[QR_IMAGE_RESPONSE]:', imageBase64);

      const path = RNFS.DownloadDirectoryPath + '/esim_qr.png';
      RNFS.writeFile(path, response.data)
        .then(success => {
          console.log('File Written');
        })
        .catch(e => {
          console.log(e);
        });

      setPngImage(imageBase64);
      setIsImageModalVisible(true);
    } catch (error) {
      console.log('Error fetching PNG image:', error);
    }
  };

  // Inside the handleConfirmPurchase function
  const handleConfirmPurchase = async () => {
    if (selectedPlan) {
      console.log('Purchasing:', selectedPlan);

      // Prepare data for the API request

      let data = JSON.stringify({
        type: "validate",
        assign: false,
        Order: [
          {
            type: 'bundle',
            quantity: 1,
            item: selectedPlan.description,
          }
        ]
      });

      // Request body for /esims/apply 
      //let data = JSON.stringify({
      //  bundles: [
      //    {
      //      name: selectedPlan.description, // Assuming the plan description is the name
      //      startTime: new Date().toISOString(), // Assuming the purchase time is the current time
      //    },
      //  ],
      //});

      console.log('[HandleConfirmPurchase-DATA]:', data);

      // Configure the API request
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.esim-go.com/v2.3/orders',
        headers: {
          'X-API-Key': '', // Replace 'YOUR_API_KEY' with your actual API key
          'Content-Type': 'application/json',
        },
        data: data,
      };
      // Make the API request
      try {
        const response = await axios.request(config);
        console.log('---------------------');
        console.log('[RESPONSE]', response);
        console.log('Purchase successful:', response.data);
        const Res = JSON.stringify(response.data);
        storeData(PURCHASE_RESPONSE, Res);
        setConfirmModalVisibility(false);

        // // Fetch the PNG image using the ICCID from the response
        // const iccid = response.data?.iccid;
        // if (iccid) {
        //   await fetchPngImage(iccid);
        // }
      } catch (error) {
        console.error('Error purchasing eSIM:', error);
        // Handle error scenario, display error message to the user, etc.
      }
    } else {
      console.error('No plan selected.');
    }
  };

  const handleCancelPurchase = () => {
    setConfirmModalVisibility(false);
  };

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
      const androidID = await NativeModules.IdentityManager.getAndroidID();
      console.log('Android_ID: ', androidID);

      const retrievedHash = retrieveData(DEVICE_IDENTIFIER);
      console.log('retrievedHash: ', retrievedHash);

      if (retrievedHash == null) {
        const uniqueIdentifier =
          await NativeModules.IdentityManager.generateIdentifier(androidID);
        console.log('uniqueIdentifier: ', uniqueIdentifier);
        storeData(DEVICE_IDENTIFIER, uniqueIdentifier);

        return retrieveData(DEVICE_IDENTIFIER);
      } else {
        return retrieveData(DEVICE_IDENTIFIER);
      }
    } catch (e) {
      console.log('error: ', e);
    }
  };

  const generateKeyStore = async () => {
    try {
      const publicKey = retrieveData(EC_PUBLIC_KEY);
      console.log('EC Public Key: ', publicKey);

      const privateKey = retrieveData(ENCRYPTED_EC_PRIVATE_KEY);
      console.log('Encrypted EC Private Key: ', privateKey);

      if (publicKey == null || privateKey == null) {
        const {ecPublicKey, encrypted_key, address, msg} =
          await NativeModules.KeyStore.generateAndStoreECKeyPair(
            appAlias,
            'Test123',
            RNFS.DownloadDirectoryPath,
          );
        console.log('EC Public Key: ', ecPublicKey);
        console.log(msg);
        console.log('Encrypted Private Key: ', encrypted_key);
        console.log('master keystore address: ', address);

        storeData(EC_PUBLIC_KEY, ecPublicKey);
        storeData(ENCRYPTED_EC_PRIVATE_KEY, encrypted_key);
        storeData(MASTER_KEYSTORE_ADDRESS, address);
        console.log('Keys Securely Stored');
      }

      const address = retrieveData(MASTER_KEYSTORE_ADDRESS);
      console.log('address: ', address);
      setMasterKeyStoreAddress(address);
      toggleKeyModalVisibility();
    } catch (e) {
      console.log('Error: ', e);
    }
  };

  const getECPrivateKey = async () => {
    try {
      const private_key = await NativeModules.KeyStore.retrieveECPrivateKey(
        retrieveData(ENCRYPTED_EC_PRIVATE_KEY),
        appAlias,
      );
      return private_key;
    } catch (e) {
      console.log('Error: ', e);
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
    } catch (e) {
      console.log('Error: ', e);
    }
  };

  // Call the exposed method when the "Sign Transaction" button is pressed
  const handleSignTransaction = async () => {
    try {
      const privateKey = await getECPrivateKey();
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
          privateKey,
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
    } catch (e) {
      console.error('Error:', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>eSIM Wallet app</Text>
      <View style={styles.separator} />
      {/* Modal for fetch QR */}
      <Button
        title="Fetch QR"
        onPress={() => fetchPngImage('8943108165007773976')}
      />
      {/* Modal for displaying QR code */}
      <Modal isVisible={isImageModalVisible}>
        <Modal.Container>
          <Modal.Header title="Your QR Code" />
          <Modal.Body>
            {pngImage ? (
              <Image
                source={{uri: `data:image/png;base64,${pngImage}`}}
                style={{width: 200, height: 200}}
              />
            ) : (
              <Text style={styles.text}>No image available</Text>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              title="Close"
              onPress={() => setIsImageModalVisible(false)}
            />
          </Modal.Footer>
        </Modal.Container>
      </Modal>
      {/* Modal for fetch Unique ID */}
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
      <Button title="Generate EC KeyPair" onPress={generateKeyStore} />
      <Modal isVisible={isKeyModalVisible}>
        <Modal.Container>
          <Modal.Header title="Master Keystore Address" />
          <Modal.Body>
            <Text style={styles.text}>{masterKeyStoreAddress}</Text>
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
            <Text style={styles.text}>{'TEST-Tx'}</Text>
          </Modal.Body>
          <Modal.Footer>
            <Button title="Back" onPress={toggleTransactionModalVisibility} />
          </Modal.Footer>
        </Modal.Container>
      </Modal>
      <Button title="Buy eSIM" onPress={handleBuyESIM} />
      {/* Modal for displaying eSIM plans */}
      <Modal isVisible={isPlanModalVisible}>
        <Modal.Container>
          <Modal.Header title="Select eSIM Plan" />
          <Modal.Body>
            {eSIMPlans.map((testPlans, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handlePlanSelection(testPlans)}>
                <Text style={styles.planText}>{testPlans.description}</Text>
              </TouchableOpacity>
            ))}
          </Modal.Body>
          <Modal.Footer>
            <Button
              title="Close"
              onPress={() => setPlanModalVisibility(false)}
            />
          </Modal.Footer>
        </Modal.Container>
      </Modal>
      {/* Modal for confirming the purchase */}
      <Modal isVisible={isConfirmModalVisible}>
        <Modal.Container>
          <Modal.Header title="Confirm The Purchase" />
          <Modal.Body>
            <Text style={styles.text}>
              Do you want to buy{' '}
              {selectedPlan ? selectedPlan.description : 'this eSIM plan'}?
            </Text>
          </Modal.Body>
          <Modal.Footer>
            <Button title="Yes" onPress={handleConfirmPurchase} />
            <Button title="No" onPress={handleCancelPurchase} />
          </Modal.Footer>
        </Modal.Container>
      </Modal>
      {/* Modal for fetching org details */}
      <Button title="Org" onPress={fetchOrgData} />
      <Modal isVisible={isOrgModalVisible}>
        <Modal.Container>
          <Modal.Header title="Organization Data" />
          <Modal.Body>
            <Text style={styles.text}>{JSON.stringify(orgData, null, 2)}</Text>
          </Modal.Body>
          <Modal.Footer>
            <Button title="Close" onPress={() => setIsOrgModalVisible(false)} />
          </Modal.Footer>
        </Modal.Container>
      </Modal>
      <Modal isVisible={isImageModalVisible}>
        <Modal.Container>
          <Modal.Header title="Your QR Code" />
          <Modal.Body>
            {pngImage ? (
              <Image
                source={{uri: `data:image/png;base64,${pngImage}`}}
                style={{width: 200, height: 200}}
              />
            ) : (
              <Text style={styles.text}>No image available</Text>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              title="Close"
              onPress={() => setIsImageModalVisible(false)}
            />
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

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useRef, useState } from 'react';
import {PERMISSIONS, request} from 'react-native-permissions';
import { Button, NativeModules, PermissionsAndroid, StatusBar, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
interface ILog {
  command: string;
  result: any;
}
/** const requestPhoneStatePermission = async () => {
*   try {
*     const granted = await PermissionsAndroid.request(
*       PermissionsAndroid.READ_PHONE_STATE,
*       {
*         title: 'Phone State Permission',
*         message:
*           'LPA App needs acces to your phone state ' +
*           'Grant permission for accessing eid',
*         buttonNeutral: 'Ask Me Later',
*         buttonNegative: 'Cancel',
*         buttonPositive: 'OK',
*       },
*     );
*     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
*       console.log('Phone State Access Granted');
*     } else {
*       console.log('Permission denied');
*     }
*   } catch (err) {
*     console.log(err);
*   }
* };
*/

export default function App() {
  const [logs, setLogs] = useState<Array<ILog>>([]);

  const scrollViewRef = useRef<any>();

  const getEIDs = async () => {
    try {
      //await requestPhoneStatePermission();
      console.log("NativeModules.EuiccManager: ", NativeModules.EuiccManager);
      const eid = await NativeModules.EuiccManager.getEID();
      console.log("eid: ", eid);
    } catch(e) {
      console.log("error occurred: ", e);
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.mainView}>
        <View style={styles.header}>
          <Text style={styles.headerText}>RN eSIM Manager</Text>
        </View>
        <ScrollView
          style={styles.logsContainer}
          contentContainerStyle={{ paddingHorizontal: 4 }}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef?.current?.scrollToEnd({ animated: true })}
        >
          {logs.map((log, index) => (
            <>
              <Text style={styles.logText} key={index}>
                {log.command} :
              </Text>
              <Text style={styles.logTextResult} key={`result-${index}`}>
                {`${log.result}`}
              </Text>
            </>
          ))}
        </ScrollView>
        <View style={styles.button}>
          <Button title={'Get EIDs'} onPress={getEIDs}></Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
  },
  button: {
    paddingVertical: 10,
  },
  activateEsimContainer: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainView: {
    paddingHorizontal: 18,
  },
  logsContainer: {
    height: 300,
    backgroundColor: 'black',
    borderRadius: 5,
  },
  logText: {
    color: 'lightgrey',
  },
  logTextResult: {
    color: 'lightgrey',
    marginLeft: 20,
    marginBottom: 5,
  },
});

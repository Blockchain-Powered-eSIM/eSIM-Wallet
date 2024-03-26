/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useRef, useState } from 'react';
import { Button, NativeModules, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

interface ILog {
  command: string;
  result: any;
}

export default function App() {
  const [logs, setLogs] = useState<Array<ILog>>([]);

  const scrollViewRef = useRef<any>();

  const getEIDs = () => {
    // Comment or remove the below line if the log works perfectly
    console.log('Print NativeModules.EuiccManagerModule: ', NativeModules.EuiccManagerModule);

    NativeModules.EuiccManagerModule.getEid()
      .then((array: Array<any>) => {
        setLogs([
          ...logs,
          {
            command: 'getEid',
            result: JSON.stringify(array, null, 5),
          },
        ]);
      })
      .catch((error: any) => {
        setLogs([
          ...logs,
          {
            command: 'getEidError',
            result: JSON.stringify(error, null, 5),
          },
        ]);
      });
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

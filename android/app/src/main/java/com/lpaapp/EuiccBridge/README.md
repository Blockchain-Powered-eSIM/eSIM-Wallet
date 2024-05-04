# EuiccBridge for React Native
The `EuiccBridge` provides an interface for React Native applications to interact with the embedded Universal Integrated Circuit Card (eUICC), provided the application has the necessary carrier privileges.

## Dependencies
This module depends on the React Native framework and relies on the Android's 'TelephonyManager' and 'EuiccManager' APIs.

## Methods
To use the `EuiccBridge` in your React Native application, you need to add it to the list of native modules in your Android project and exposes the below methods to React Native:

### getEID
Retrieves the EID of the eSIM. This method should be called with a promise that will resolve with the EID if successful or reject with an error if not.

## Example Usage
```java
import { NativeModules } from 'react-native';

const { EuiccManager } = NativeModules;

EuiccManager.getEID()
  .then(eid => console.log(`EID: ${eid}`))
  .catch(error => console.error(`Failed to get EID: ${error.message}`));
```

The module uses promises to handle asynchronous operations and will reject these promises with an error code and message when something goes wrong. Handle these errors appropriately in your application to ensure reliable functionality.

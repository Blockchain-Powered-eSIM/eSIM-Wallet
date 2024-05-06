# DeviceInfoBridge for React Native
The 'DeviceInfoBridge' provides functionality to React Native applications to interact with SIM card data on Android devices. It allows the retrieval of SIM card information, eSIM support checks, and eSIM setup functionalities (given relevant permissions are given to the application).

## Dependencies
This module depends on the React Native framework and specific Android APIs. The module uses Android's `TelephonyManager`, `SubscriptionManager`, and `EuiccManager` APIs and relevant React Native libraries.

## Methods
To use the `DeviceInfoBridge` in your React Native application, you need to add it to the list of native modules in your Android project and exposes the below methods to React Native:

### getSimCardsNative
Fetches detailed information about the available SIM cards in the device. This method returns a list of SIM card details if successful or rejects with an error otherwise.

### isEsimSupported
Checks if the device supports eSIM. This method resolves with `true` if eSIM is supported and enabled, `false` otherwise.

### setupEsim
Takes in an input parameter `config` of type `ReadableMap`. Attempts to set up an eSIM with provided configuration. This method is only operational on devices with `Android 9 (API 28)` or higher.

#### EsimConfig

| **Property**       | **Type** | **Required** | **Description** |
|--------------------|----------|--------------|-----------------|
| `address`          | string   | **true**     | The address of the carrier network’s eSIM server. |
| `confirmationCode` | string   | false        | The provisioning request’s confirmation code, provided by the network operator when initiating an eSIM download. |
| `eid`              | string   | false        | The provisioning request’s eUICC identifier (EID). |
| `iccid`            | string   | false        | The provisioning request’s Integrated Circuit Card Identifier (ICCID). |
| `matchingId`       | string   | false        | The provisioning request’s matching identifier (MatchingID). |
| `oid`              | string   | false        | The provisioning request’s Object Identifier (OID). |

#### EsimSetupResultStatus

| **StatusType** | **Value** |
|----------------|-----------|
| `Unknown`      | 0         |
| `Fail`      | 1         |
| `Success`      | 2         |

## Example Usage
```java
import { NativeModules } from 'react-native';

const { SimData } = NativeModules;

SimData.getSimCardsNative()
  .then(simCards => console.log('SIM cards:', simCards))
  .catch(error => console.error('Failed to fetch SIM cards:', error));

SimData.isEsimSupported()
  .then(isSupported => console.log('eSIM support:', isSupported))
  .catch(error => console.error('Failed to check eSIM support:', error));

// Example eSIM setup
const config = {
  address: "";
  confirmationCode: "";
  eid: "";
  iccid: "";
  matchingId: "";
  oid: "";
};
SimData.setupEsim(esimConfig)
  .then(result => console.log('eSIM setup successful:', result))
  .catch(error => console.error('Failed to setup eSIM:', error));
```

The module uses promises to handle asynchronous operations and will reject these promises with an error code and message when something goes wrong. Handle these errors appropriately in your application to ensure reliable functionality.

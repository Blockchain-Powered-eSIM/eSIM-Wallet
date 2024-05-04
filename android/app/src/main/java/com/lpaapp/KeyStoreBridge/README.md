# KeyStoreBridge for React Native
The `KeyStoreBridge` provides secure key management (`RSA` and `ECDSA`) functionalities within a React Native application, leveraging Android's native KeyStore system to generate, store, and manage cryptographic keys and certificates. This module is specifically tailored for Android devices and offers methods to securely handle encryption keys and perform encryption/decryption operations.

## Dependencies
This module depends on the React Native framework and uses Android's 'KeyGenParameterSpec', 'KeyProperties' and `KeyProtection` APIs along with Bouncy Castle Provider (if using specific cryptographic algorithms not supported by Android natively). Make sure to have appropriate permissions in your application to use the secure element associated with Android Key Store.

## Methods
To use the `KeyStoreBridge` in your React Native application, you need to add it to the list of native modules in your Android project and exposes the below methods to React Native:

### retrieveKeyPair
Takes in input parameter of `alias` for which the KeyPair is to be retrieved.
Retrieves an existing key pair (public and private key) from the Android KeyStore, given a key alias. Returns a java `KeyPair` object.

### generateAndStoreECKeyPair
Generates an Elliptic Curve (EC) key pair `(secp256k1)` and encrypts the private key using a generated RSA key pair. The encrypted EC private key is stored in the Android KeyStore.
The input parameters are:
- `alias` : Alias for identifying the stored key pair.
- `password` : Password used to protect the EC key pair (needed for derivation).
- `directoryPath` : Directory location (in String format) to store the keystore file.

On success the promise resolves with the base64 encoded, encrypted EC private key and a success message.

### generateAndStoreECKeyPairWithSignature
Generates an EC key pair `(secp256k1)`, creates a self-signed certificate associated with the key pair and securely stores the key pair and certificate in the Android KeyStore.
The input parameters are:
- `alias` : Alias for identifying the stored key pair.
- `password` : Password used to protect the EC key pair (needed for derivation).
- `directoryPath` : Directory location (in String format) to store the keystore file.

On success the promise resolves with the base64 encoded, encrypted EC private key and a success message. This method does not work for android versions below `Marshmallow`.

### checkCertificateValidity
Performs a basic validity check on a certificate stored in the Android KeyStore. Take in the input a string `alias` for which the stored certificate is to be validated.

## Example Usage
```java
import { NativeModules } from 'react-native';

const { KeyStore } = NativeModules;

// Retrieve an RSA Key Pair associated with a given alias
KeyStore.retrieveKeyPair('myKeyAlias')
  .then(keyPair => {
    console.log('Public Key:', keyPair.publicKey);
    console.log('Private Key:', keyPair.privateKey);
  })
  .catch(error => console.error('Failed to retrieve key pair:', error));

// Generate and store an EC key pair, encrypt it, and then store it securely under the specified alias
KeyStore.generateAndStoreECKeyPair('myECAlias', 'myPassword', '/myDirectoryPath')
  .then(result => {
    console.log('Encrypted Key:', result.encrypted_key);
    console.log('Message:', result.msg);
  })
  .catch(error => console.error('Failed to generate and store EC key pair:', error));

// Generate and store an EC key pair with a self-signed certificate
KeyStore.generateAndStoreECKeyPairWithSignature('myECSignatureAlias', 'myPassword', '/myDirectoryPath')
  .then(message => console.log(message))
  .catch(error => console.error('Failed to store EC key pair with signature:', error));

// Check the validity of a certificate associated with a given alias
KeyStore.checkCertificateValidity('myCertAlias')
  .then(() => console.log('Certificate is valid'))
  .catch(error => console.error('Certificate validation failed:', error));
```

The module uses promises to handle asynchronous operations and will reject these promises with an error code and message when something goes wrong. Handle these errors appropriately in your application to ensure reliable functionality.

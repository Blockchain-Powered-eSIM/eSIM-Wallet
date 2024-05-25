# ECKeyManager Native Module
This native module exposes java functions and react methods that deal with the generation and management of ECDSA keys. To generate Ethereum keys, the native module uses Web3j and BouncyCastle libraries. The EC key pair is generated using the `secp256k1` EC.  

## compressPublicKey
This react method can be used to compress the EC Public key.  

### Input parameters
* `pubKey`: EC Public Key (in Big Integer format) to be compressed. 

### Return parameters
Compressed EC public key in String format.

## deriveAddress
This react method can be used to derive ETH address from a given public key.  

### Input parameters
* `publicKey`: EC Public Key (in Big Integer format).

### Return parameters
ETH address in String format

## generateKeystoreJSON
This react method can be used to generate a keystore JSON file for a given EC Key pair.

### Input parameters
* `walletPassword`: String password to protect the kyestore file.  
* `storagePath`: Directory location (in String format) to store the keystore file.  
* `ecKeyPair`: EC Key pair to generate keystore file for.  

### Return parameters
Filename (in String format) of the newly generated Keystore file.  

## decryptCredentials
This react method can be used to decrypt a keystore wallet and derive the credentials.  

### Input parameters
* `keystorePath`: File path of the keystore JSON, to load credentials from.  
* `walletPassword`: Password (in String format) of the keystore JSON file.

### Return parameters
Returns the EC key pair in the `org.web3j.crypto.Credentials` format.

## generateBIP39Mnemonic
This method generates a BIP39 seed phrase (mnemonic) which can be used to derive EC key pair.

### Input parameters
Not required.

### Return parameters
Mnemonic (in String format).

## generateECKeyPairFromMnemonic
This method is used to generate EC key pair from the mnemonic (generated using the `generateBIP39Mnemonic` function).

### Input parameters
* `mnemonic`: Seed phrase (in String format).  
* `password`: Password (in String format) to create EC key pair.  

### Return parameters
EC key pair (in the format `org.web3j.crypto.ECKeyPair`).

## convertECKeyPairToKeyPair
This method is used to convert the format of keypair from Bouncycastle's ECKeyPair to Android's KeyPair.  

### Input parameters
* `ecKeyPair`: EC key pair (in the format supported by bouncycastle).

### Return parameters
`KeyPair`, in the format supported by Android keystore.  

## generateAndSaveWallet
This React method can be used to generate a password protected keystore wallet from a given seed phrase.  

### Input parameters
* `mnemonic`: Seed phrase (in String format).  
* `password`: Password (in String format) to encrypt the file.  
* `destinationDirectory`: Directory path (in String format) to save the keystore JSON file in.  

### Return parameters
Filename (in String format) of the newly created keystore JSON file.  

## loadCredentialsFromFile
This react method can be used to load EC key pairs from an externally stored keystore JSON file, provided the file path in user's mobile device.  

### Input parameters
* `password`: Password (in String format) to decrypt the file.  
* `filePath`: File path (in String format) of the keystore JSON file.

### Return parameters
Nothing.
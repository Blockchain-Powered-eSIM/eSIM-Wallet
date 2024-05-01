# ECKeyManager Native Module
This native module exposes java functions and react methods that deal with the generation and management of ECDSA keys. To generate Ethereum keys, the native module uses Web3j and BouncyCastle libraries. The EC key pair is generated using the `secp256k1` EC.  

## compressPublicKey
This react method can be used to compress the EC Public key.  

### Input parameters
`pubKey`: EC Public Key (in Big Integer format) to be compressed. 

### Return parameters
Compressed EC public key in String format.

## deriveAddress
This react method can be used to derive ETH address from a given public key.  

### Input parameters
`publicKey`: EC Public Key (in Big Integer format).

### Return parameters
ETH address in String format

## generateKeystoreJSON
This react method can be used to generate a keystore JSON file for a given EC Key pair.

### Input parameters
`walletPassword`: String password to protect the kyestore file.  
`storagePath`: Directory location (in String format) to store the keystore file.  
`ecKeyPair`: EC Key pair to generate keystore file for.  

### Return parameters
Filename (in String format) of the newly generated Keystore file.  

## decryptCredentials
This react method can be used to decrypt a keystore wallet and derive the credentials.  

### Input parameters
`keystorePath`: File path of the keystore JSON, to load credentials from.  
`walletPassword`: Password (in String format) of the keystore JSON file.

### Retunr parameters
Returns the EC key pair in the `org.web3j.crypto.Credentials` format.



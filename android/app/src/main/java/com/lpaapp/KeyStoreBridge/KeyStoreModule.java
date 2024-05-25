package com.lpaapp.KeyStoreBridge;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.security.keystore.KeyProtection;
import android.util.Base64;
import android.util.Log;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.Provider;
import java.security.PublicKey;
import java.security.Security;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.security.spec.ECGenParameterSpec;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.cert.X509v3CertificateBuilder;
import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter;
import org.bouncycastle.cert.jcajce.JcaX509v3CertificateBuilder;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;

import org.web3j.crypto.Credentials;
import org.web3j.crypto.ECKeyPair;
import org.web3j.crypto.Keys;
import org.web3j.crypto.Sign;
import org.web3j.crypto.WalletUtils;
import org.web3j.utils.Numeric;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import com.lpaapp.ECKeyManager.ECKeyManagementModule;

public class KeyStoreModule extends ReactContextBaseJavaModule {

  private final static String TAG = KeyStoreModule.class.getCanonicalName();
  private static final String KEYSTORE_PROVIDER = "AndroidKeyStore";
  private static final String EC_CURVE = "secp256k1";
  private static final String E_KEYSTORE_ALIAS_EXISTS = "keyAlias_already_exists";
  private static final String E_MIN_ANDROID_VERSION = "incompatible_android_version";
  private static final String E_ALIAS_PASS_NULL = "alias_or_password_null";
  private static ReactApplicationContext mReactContext;

  KeyStoreModule(ReactApplicationContext reactContext) {
    super(reactContext);
    mReactContext = reactContext;
  }

  @Override
  public String getName() {
    return "KeyStore"; // Name exposed to React Native
  }

  // Generate RSA KeyPair which is by default stored in Android Key Store
  private KeyPair generateRSAKeyPair(String alias) throws Exception {
    KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(
      KeyProperties.KEY_ALGORITHM_RSA, KEYSTORE_PROVIDER);

    // .setUserAuthenticationRequired(true) for enabling user authentication for decryption
    keyPairGenerator.initialize(new KeyGenParameterSpec.Builder(
      alias,
      KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
      .setKeySize(2048)
      .setDigests(KeyProperties.DIGEST_SHA256, KeyProperties.DIGEST_SHA512)
      .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_RSA_PKCS1)
      .build());

    return keyPairGenerator.generateKeyPair();
  }

  public byte[] encryptData(byte[] data, PublicKey publicKey) throws Exception {
    Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
    cipher.init(Cipher.ENCRYPT_MODE, publicKey);
    return cipher.doFinal(data);
  }

  public byte[] decryptData(byte[] encryptedData, PrivateKey privateKey) throws Exception {
    Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
    cipher.init(Cipher.DECRYPT_MODE, privateKey);
    return cipher.doFinal(encryptedData);
  }

  private KeyPair retrieveKeyPair(String alias) throws Exception {
    // Create and load the KeyStore instance
    KeyStore keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER);
    keyStore.load(null);

    // Retrieve the entry from the KeyStore
    KeyStore.Entry keyEntry = keyStore.getEntry(alias, null);
    if (keyEntry instanceof KeyStore.PrivateKeyEntry) {
      // Extract public and private keys
      Certificate cert = keyStore.getCertificate(alias);
      PublicKey publicKey = cert.getPublicKey();
      PrivateKey privateKey = ((KeyStore.PrivateKeyEntry) keyEntry).getPrivateKey();

      // Return the key pair
      return new KeyPair(publicKey, privateKey);
    } else {
      // Throw an exception if the entry is not a PrivateKeyEntry
      throw new Exception("KeyStore Entry corresponding to given alias is not a private key");
    }
  }

  // @TODO Remove this function, retreiving keys from secure element is not required from frontend
  //  @ReactMethod
  //  public void retrieveKeyPair(String alias, Promise promise) {
  //    try {
  //      KeyStore keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER);
  //      keyStore.load(null); 
  //
  //      KeyStore.Entry keyEntry = keyStore.getEntry(alias, null);
  //      if (keyEntry instanceof KeyStore.PrivateKeyEntry) {
  //        Certificate cert = keyStore.getCertificate(alias);
  //        PublicKey publicKey = cert.getPublicKey();
  //        PrivateKey privateKey = ((KeyStore.PrivateKeyEntry) keyEntry).getPrivateKey();
  //        KeyPair retrievedKeyPair = new KeyPair(publicKey, privateKey);
  //        promise.resolve(retrievedKeyPair);
  //      } else {
  //        promise.reject("KeyStore Entry corresponding to given alias is not a private key"); // or exception
  //      } 
  //    } catch (Exception e) {
  //      promise.reject(TAG, "Exception encountered: " + e.getMessage());
  //    }
  //  }

  private X509Certificate generateSelfSignedCertificate(String alias, KeyPair ecKey) throws Exception {

    // Key Pair Generation (assuming EC)
    PrivateKey privateKey = ecKey.getPrivate();
    PublicKey publicKey = ecKey.getPublic();

    // Certificate Details
    Calendar startDate = Calendar.getInstance();
    Calendar expiryDate = Calendar.getInstance();
    expiryDate.add(Calendar.YEAR, 1); // 1-year validity
    BigInteger serialNumber = BigInteger.valueOf(System.currentTimeMillis()); 
    X500Name issuerName = new X500Name("CN=LPA, O=GMMS, L=BAN, ST=KN, C=IN"); 
    X500Name subjectName = issuerName; // Self-signed

    // Build Certificate
    X509v3CertificateBuilder builder = new JcaX509v3CertificateBuilder(
      issuerName, serialNumber,
      startDate.getTime(), expiryDate.getTime(),
      subjectName, 
      publicKey
    );

    // Sign using Private Key
    JcaContentSignerBuilder signerBuilder = new JcaContentSignerBuilder("SHA256WithECDSA");
    X509Certificate certificate = new JcaX509CertificateConverter()
    .getCertificate(builder.build(signerBuilder.build(privateKey)));

    return certificate;
  }

  @ReactMethod
  public void checkCertificateValidity(String alias, Promise promise) {
    try {
      KeyStore keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER);
      keyStore.load(null); 

      Certificate certificate = keyStore.getCertificate(alias);
      certificate.verify(certificate.getPublicKey()); // Basic validity check

      // ... Additional validation logic as needed
    } catch (Exception e) {
      // Handle exceptions
      promise.reject(TAG, "Exception encountered: " + e.getMessage());
    }
  }

  // Encrypting generated secp256k1 keys by RSA
  @ReactMethod
  public void generateAndStoreECKeyPair(String alias, String password, String directoryPath, Promise promise) {
    try {
      if (alias == null || password == null) { // regex check can also be placed here
        promise.reject("Alias or password cannot be null!");
      }

      KeyStore keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER);
      keyStore.load(null);
      if(keyStore.containsAlias(alias)){
        promise.reject(E_KEYSTORE_ALIAS_EXISTS, "There is already an entry in AndroidKeyStore against the given alias");
      }

      //Generate EC Key Pair using bouncycastle
      String mnemonic = ECKeyManagementModule.generateBIP39Mnemonic();
      ECKeyPair ecKey = ECKeyManagementModule.generateECKeyPairFromMnemonic(mnemonic, password, directoryPath);

      // Generate RSA Keys to encrypt the EC private key
      KeyPair RSAKey = generateRSAKeyPair(alias);

      byte[] ecPrivateKey = ecKey.getPrivateKey().toString(16).getBytes("UTF-8");

      //Encrypt the EC private key
      byte[] encryptedECKey = encryptData(ecPrivateKey, RSAKey.getPublic());

      WritableMap result = new WritableNativeMap();
      String base64EncryptedKey = Base64.encodeToString(encryptedECKey, Base64.DEFAULT);
      result.putString("ecPublicKey", ecPublicKey);
      result.putString("encrypted_key", base64EncryptedKey);
      result.putString("msg", "Private Key Encrypted");

      promise.resolve(result);
    } catch (Exception e) {
      promise.reject(TAG, "Exception encountered: " + e.getMessage());
    }
  }

  @ReactMethod
  public void retrieveECPrivateKey(String encrypted_key, String appAlias, Promise promise){
    try {
      byte[] formatted_key = Base64.getDecoder.decode(encrypted_key);
      byte[] ecPrivateKey = decryptData(formatted_key, retrieveKeyPair(appAlias).getPrivate());
      String privateKey = Base64.encodeToString(ecPrivateKey, Base64.DEFAULT);
      promise.resolve(privateKey);

    } catch (Exception e) {
      promise.reject(TAG, "Could not get EC Private Key: ", e.getMessage());
    }
  }

  @ReactMethod
  public void generateAndStoreECKeyPairWithSignature(String alias, String password, String directoryPath, Promise promise) {
    try {
      if (alias == null || password == null) { // regex check can also be placed here
        promise.reject("Alias or password cannot be null!");
      }
      // 1. Instance Keystore
      KeyStore keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER);
      keyStore.load(null);

      Provider provider = keyStore.getProvider();

      Log.d(TAG, "Android KeyStore Provider: " + provider.getName()); 
      Log.d(TAG, "Available Algorithms:");

      // Iterate over all registered security providers
      for (Provider p : Security.getProviders()) {
        // Print algorithms supported by each provider
        Log.d(TAG, "Provider: "  + p.getName());
        for (Provider.Service service : p.getServices()) {
          String algorithm = service.getAlgorithm();
          Log.d(TAG, "- " + algorithm);
        }
      }

      if(keyStore.containsAlias(alias)){
        promise.reject(E_KEYSTORE_ALIAS_EXISTS, "There is already an entry in AndroidKeyStore against the given alias");
      }

      // 2. Generate EC keyPair
      String mnemonic = ECKeyManagementModule.generateBIP39Mnemonic();
      ECKeyPair ecKey = ECKeyManagementModule.generateECKeyPairFromMnemonic(mnemonic, password, directoryPath);
      // Convert to Java KeyPair object for ease of use with AndroidKeyStore
      KeyPair convertedECKey = ECKeyManagementModule.convertECKeyPairToKeyPair(ecKey);

      // 3. Prepare Certificate (Self-signed)
      Certificate certificate = generateSelfSignedCertificate(alias, convertedECKey); 

      // 4. Store the key
      KeyStore.PrivateKeyEntry privateKeyEntry = new KeyStore.PrivateKeyEntry(convertedECKey.getPrivate(), new Certificate[] { certificate });
      Log.d(TAG, "PrivateKeyEntry generated");
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
        keyStore.setEntry(alias, privateKeyEntry,
          new KeyProtection.Builder(KeyProperties.PURPOSE_SIGN | KeyProperties.PURPOSE_VERIFY | KeyProperties.SECURITY_LEVEL_TRUSTED_ENVIRONMENT).build());
        promise.resolve("Private key securely stored");
      } else {
        promise.reject(E_MIN_ANDROID_VERSION, "Only Android Marshmallow and above versions are supported");
      }

    } catch (Exception e) {
      promise.reject(TAG, "Exception encountered: " + e.getMessage());
    }
  }

}

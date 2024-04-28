package com.lpaapp.KeyStoreBridge;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.security.keystore.KeyProtection;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.KeyStore;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.spec.ECGenParameterSpec;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import org.web3j.crypto.ECKeyPair;
import org.web3j.crypto.Keys;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.Sign;
import org.web3j.crypto.WalletUtils;
import org.web3j.utils.Numeric;
import android.util.Base64;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.cert.X509v3CertificateBuilder;
import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter;
import org.bouncycastle.cert.jcajce.JcaX509v3CertificateBuilder;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.cert.X509Certificate;
import java.security.cert.Certificate;
import java.math.BigInteger;
import java.util.Date;
import java.util.Calendar;
import java.util.Locale;

import android.util.Log;

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

  @ReactMethod
  public void generateAndStoreECKeyPairWithSignature(String alias, String password, Promise promise) {
    try {
      if (alias == null || password == null) { // regex check can also be placed here
        promise.reject("Alias or password cannot be null!");
      }
      // 1. Instance Keystore
      KeyStore keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER);
      keyStore.load(null);

      if(keyStore.containsAlias(alias)){
        promise.reject(E_KEYSTORE_ALIAS_EXISTS, "There is already an entry in AndroidKeyStore against the given alias");
      }

      // 2. Generate EC keyPair
      String mnemonic = ECKeyManagementModule.generateBIP39Mnemonic();
      ECKeyPair ecKey = ECKeyManagementModule.generateECKeyPairFromMnemonic(mnemonic, password);
      // Convert to Java KeyPair object for ease of use with AndroidKeyStore
      KeyPair convertedECKey = ECKeyManagementModule.convertECKeyPairToKeyPair(ecKey);
      Log.d(TAG, "PublicKey: " + convertedECKey.getPublic() + "Private Key: " + convertedECKey.getPrivate());

      // 3. Prepare Certificate (Self-signed)
      Certificate certificate = generateSelfSignedCertificate(alias, convertedECKey); 
      Log.d(TAG, "Certificate generated");

      // 4. Store the key
      KeyStore.PrivateKeyEntry privateKeyEntry = new KeyStore.PrivateKeyEntry(convertedECKey.getPrivate(), new Certificate[] { certificate });
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
        keyStore.setEntry(alias, privateKeyEntry,
          new KeyProtection.Builder(KeyProperties.PURPOSE_SIGN | KeyProperties.PURPOSE_VERIFY)
          .build());
        promise.resolve("Private key securely stored");
      } else {
        promise.reject(E_MIN_ANDROID_VERSION, "Only Android Marshmallow and above versions are supported");
      }

    } catch (Exception e) {
      promise.reject(e);
    }
  }

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
  public void retrieveKeyPair(String alias, Promise promise) {
    try {
      KeyStore keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER);
      keyStore.load(null); 

      KeyStore.Entry keyEntry = keyStore.getEntry(alias, null);
      if (keyEntry instanceof KeyStore.PrivateKeyEntry) {
        Certificate cert = keyStore.getCertificate(alias);
        PublicKey publicKey = cert.getPublicKey();
        PrivateKey privateKey = ((KeyStore.PrivateKeyEntry) keyEntry).getPrivateKey();
        KeyPair ecKey = new KeyPair(publicKey, privateKey);
        promise.resolve(ecKey);
      } else {
        promise.reject("KeyStore Entry corresponding to given alias is not a private key"); // or exception
      } 
    } catch (Exception e) {
      promise.reject(e);
    }
  }

  @ReactMethod
  public void checkCertificateValidity(String alias) {
    try {
      KeyStore keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER);
      keyStore.load(null); 

      Certificate certificate = keyStore.getCertificate(alias);
      certificate.verify(certificate.getPublicKey()); // Basic validity check

      // ... Additional validation logic as needed
    } catch (Exception e) {
      // Handle exceptions
    }
  }

}

package com.lpaapp.ECDSAManager;

import java.util.*;
import java.io.File;
import java.io.PrintStream;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.Provider;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.Security;
import java.security.spec.ECParameterSpec;
import java.security.spec.ECPrivateKeySpec;
import java.security.spec.ECPublicKeySpec;
import java.security.spec.EllipticCurve;
import org.bouncycastle.jcajce.provider.asymmetric.util.EC5Util;
import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.spec.ECNamedCurveParameterSpec;
import org.bouncycastle.jce.spec.ECNamedCurveSpec;
import org.bouncycastle.math.ec.ECPoint;
import org.web3j.crypto.Bip39Wallet;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.ECKeyPair;
import org.web3j.crypto.Hash;
import org.web3j.crypto.Keys;
import org.web3j.crypto.MnemonicUtils;
import org.web3j.crypto.Sign;
import org.web3j.crypto.WalletUtils;
import org.web3j.utils.Numeric;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import android.util.Log;

public class ECKeyManagementModule extends ReactContextBaseJavaModule {

  private final static String TAG = ECKeyManagementModule.class.getCanonicalName();
  private final static String EC_CURVE = "secp256k1";
  private static ReactApplicationContext mReactContext;

  public ECKeyManagementModule(ReactApplicationContext reactContext) {
    super(reactContext);
    mReactContext = reactContext;
  }

  @Override
  public String getName() {
    return "ECKeyManager"; // Name exposed to React Native
  }

  // https://github.com/web3j/web3j/issues/915#issuecomment-483145928
  private static final void setupBouncyCastle() {
    final Provider p = Security.getProvider(BouncyCastleProvider.PROVIDER_NAME);
    if (p == null || p.getClass().equals(BouncyCastleProvider.class)) {
      return;
    }
    Security.removeProvider(BouncyCastleProvider.PROVIDER_NAME);
    Security.insertProviderAt(new BouncyCastleProvider(), 1);
  }

  @ReactMethod
  public static String compressPublicKey(BigInteger pubKey) {
    String pubKeyYPrefix = pubKey.testBit(0) ? "03" : "02";
    String pubKeyHex = pubKey.toString(16);
    String pubKeyX = pubKeyHex.substring(0, 64);

    return pubKeyYPrefix + pubKeyX;
  }

  @ReactMethod
  public static String signMessage(String message, ECKeyPair ecKeyPair) {
    byte[] hash = message.getBytes(StandardCharsets.UTF_8);
    Sign.SignatureData signature = Sign.signPrefixedMessage(hash, ecKeyPair);
    String r = Numeric.toHexString(signature.getR());
    String s = Numeric.toHexString(signature.getS()).substring(2);
    String v = Numeric.toHexString(signature.getV()).substring(2);

    return r + s + v;
  }

  @ReactMethod
  public void generateECKeyPair(Promise promise) throws Exception {
    try {
      // Setup Bouncy Castle.
      ECKeyManagementModule.setupBouncyCastle();
      // Generate a random private key
      BigInteger privateKey = Keys.createEcKeyPair().getPrivateKey();
      BigInteger publicKey = Sign.publicKeyFromPrivate(privateKey);

      ECKeyPair ec = new ECKeyPair(privateKey, publicKey);

      promise.resolve(ec);
    } catch (Exception e) {
      promise.reject(e);
    }
  }

  public static String deriveAddress(BigInteger publicKey) {
    return "0x" + Keys.getAddress(publicKey);
  }

  @ReactMethod
  public static void generateKeystoreJSON(String walletPassword, String storagePath, ECKeyPair ecKeyPair, Promise promise) throws Exception {

    try {
      promise.resolve(
        WalletUtils.generateWalletFile(
          walletPassword,
          ecKeyPair,
          new File(storagePath),
          true
        )
      );
    } catch (Exception e) {
      promise.reject(e);
    }
  }

  @ReactMethod
  public static Credentials decryptCredentials(String keystorePath, String walletPassword) throws Exception {
    return WalletUtils.loadCredentials(walletPassword, keystorePath);
  }

  public static String generateBIP39Mnemonic() throws Exception {
    try {
      SecureRandom random = new SecureRandom();
      byte[] initialEntropy = new byte[16];
      random.nextBytes(initialEntropy);

      String mnemonic = MnemonicUtils.generateMnemonic(initialEntropy);
      Log.d(TAG, "mnemonic: " + mnemonic);

      return mnemonic;
    } catch (Exception e) {
      Log.e(TAG, "Error: " + e.getMessage());
      e.printStackTrace();
      return null;
    }
  }

  // To be used by other native modules, to generate EC Key Pair and securely store it in the android keystore
  // Also creates a password protected Kyestore JSON file in user's mobile device
  public static ECKeyPair generateECKeyPairFromMnemonic(String mnemonic, String password, String destinationDirectory) throws Exception {
    try {
      byte[] seed = MnemonicUtils.generateSeed(mnemonic, password);

      ECKeyManagementModule.setupBouncyCastle();
      ECKeyPair keyPair = ECKeyPair.create(Hash.sha256(seed));
      Log.d(TAG, "privateKey: " + keyPair.getPrivateKey().toString(16));
      Log.d(TAG, "publicKey: " + keyPair.getPublicKey().toString(16));

      String walletFile = WalletUtils.generateWalletFile(password, keyPair, new File(destinationDirectory), false);
      Log.d(TAG, "walletFile name: " + walletFile);

      return keyPair;
    } catch (Exception e) {
      Log.e(TAG, "Error: " + e.getMessage());
      e.printStackTrace();
      return null;
    }
  }

  private static java.security.spec.ECPoint getECPoint(BigInteger publicKeyInt, ECNamedCurveParameterSpec ecParams) {
    byte[] publicKeyBytes = publicKeyInt.toByteArray();
    byte[] correctedBytes;

    if (publicKeyBytes[0] == 0) { // If there's a leading zero byte (sign bit), remove it
      correctedBytes = new byte[publicKeyBytes.length - 1];
      System.arraycopy(publicKeyBytes, 1, correctedBytes, 0, correctedBytes.length);
    } else {
      correctedBytes = publicKeyBytes;
    }

    // Check length to decide if it's just X or X and Y
    ECPoint point;
    if (correctedBytes.length == 32) { // Only X coordinate
      // Prefix with 0x02 or 0x03 to indicate compressed encoding (requires knowing if Y is even or odd)
      byte[] encodedPoint = new byte[33];
      encodedPoint[0] = 0x02; // Assume Y is even, change to 0x03 if Y is odd
      System.arraycopy(correctedBytes, 0, encodedPoint, 1, 32);
      return EC5Util.convertPoint(ecParams.getCurve().decodePoint(encodedPoint));
    } else if (correctedBytes.length == 64) { // Both X and Y coordinates
      byte[] encodedPoint = new byte[65];
      encodedPoint[0] = 0x04; // Uncompressed encoding
      System.arraycopy(correctedBytes, 0, encodedPoint, 1, 64);
      return EC5Util.convertPoint(ecParams.getCurve().decodePoint(encodedPoint));
    } else {
      throw new IllegalArgumentException("Invalid byte array length: " + correctedBytes.length);
    }
  }

  public static KeyPair convertECKeyPairToKeyPair(ECKeyPair ecKeyPair) throws Exception {
    try {
      // Extract components from ECKeyPair
      BigInteger privateKeyInt = ecKeyPair.getPrivateKey();
      BigInteger publicKeyInt = ecKeyPair.getPublicKey();

      ECNamedCurveParameterSpec paramSpec = ECNamedCurveTable.getParameterSpec(EC_CURVE);
      ECNamedCurveSpec curveSpec = new ECNamedCurveSpec(EC_CURVE, paramSpec.getCurve(), paramSpec.getG(), paramSpec.getN());
      // Create EC private and public key specifications
      ECPrivateKeySpec privateKeySpec = new ECPrivateKeySpec(privateKeyInt, curveSpec);
      ECPublicKeySpec publicKeySpec = new ECPublicKeySpec(getECPoint(publicKeyInt, paramSpec), curveSpec);

      // Generate PrivateKey and PublicKey objects
      KeyFactory keyFactory = KeyFactory.getInstance("EC");
      PrivateKey privateKey = keyFactory.generatePrivate(privateKeySpec);
      PublicKey publicKey = keyFactory.generatePublic(publicKeySpec);

      return new KeyPair(publicKey, privateKey);

    } catch (Exception e) {
      Log.e(TAG, "Error in converting ECKeyPair to KeyPair: " + e.getMessage());
      e.printStackTrace();
      return null;
    }
  }

  // Generate Wallet from Mnemonic and save into a JSON file
  @ReactMethod
  public static void generateAndSaveWallet(String mnemonic, String password, String destinationDirectory, Promise promise) throws Exception {
    try {
      byte[] seed = MnemonicUtils.generateSeed(mnemonic, password);

      ECKeyPair keyPair = ECKeyPair.create(Hash.sha256(seed));
      Log.d(TAG, "privateKey: " + keyPair.getPrivateKey().toString(16));
      Log.d(TAG, "publicKey: " + keyPair.getPublicKey().toString(16));

      String walletFile = WalletUtils.generateWalletFile(password, keyPair, new File(destinationDirectory), false);
      Log.d(TAG, "walletFile name: " + walletFile);

      promise.resolve(walletFile);
    } catch (Exception e) {
      promise.reject(e);
    }
  }
}
  // TODO: Remove. Only for testing
  //@ReactMethod
  //public static void loadCredentialsFromFile(String password, String filePath, Promise promise) throws Exception {
  //  try {
  //    Credentials cred = WalletUtils.loadCredentials(password, filePath);
  //    ECKeyPair keyPair = cred.getEcKeyPair();
  //    String address = cred.getAddress();
  //    String privateKey = keyPair.getPrivateKey().toString(16);
  //    String publicKey = keyPair.getPublicKey().toString(16);
  //    Log.d(TAG, "getAddress: " + address);
  //    Log.d(TAG, "privateKey: " + privateKey);
  //    Log.d(TAG, "publicKey: " + publicKey);

  //    promise.resolve(address);
  //  } catch (Exception e) {
  //    promise.reject(e);
  //  }
  //}

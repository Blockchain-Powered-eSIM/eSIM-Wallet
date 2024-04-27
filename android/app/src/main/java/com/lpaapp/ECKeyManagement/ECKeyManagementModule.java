package com.lpaapp.ECKeyManager;

import java.io.File;
import java.io.PrintStream;
import java.math.BigInteger;
import java.security.Security;
import java.security.Provider;
import java.security.SecureRandom;
import java.nio.charset.StandardCharsets;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.ECKeyPair;
import org.web3j.crypto.Keys;
import org.web3j.crypto.Sign;
import org.web3j.crypto.WalletUtils;
import org.web3j.crypto.MnemonicUtils;
import org.web3j.crypto.Hash;
import org.web3j.utils.Numeric;
import org.web3j.crypto.Bip39Wallet;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import android.util.Log;

public class ECKeyManagementModule extends ReactContextBaseJavaModule {

    private final static String TAG = ECKeyManagementModule.class.getCanonicalName();
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

    @ReactMethod
    public static String deriveAddress(BigInteger publicKey) {
        return "0x" + Keys.getAddress((publicKey));
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

    @ReactMethod
    public static void generateBIP39Mnemonic(Promise promise) throws Exception {
        try {
            SecureRandom random = new SecureRandom();
            byte[] initialEntropy = new byte[16];
            random.nextBytes(initialEntropy);

            String mnemonic = MnemonicUtils.generateMnemonic(initialEntropy);
            Log.d("mnemonic: ", mnemonic);

            promise.resolve(mnemonic);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    // To be used by other native modules, to generate EC Key Pair and securely store it in the android keystore
    public static void generateECKeyPairFromMnemonic(String mnemonic, String password, String destinationDirectory, Promise promise) throws Exception {
        try {
            byte[] seed = MnemonicUtils.generateSeed(mnemonic, password);

            ECKeyPair keyPair = ECKeyPair.create(Hash.sha256(seed));
            Log.d("privateKey: ", keyPair.getPrivateKey().toString(16));
            Log.d("publicKey: ", keyPair.getPublicKey().toString(16));

            promise.resolve(keyPair);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    // Generate Wallet from Mnemonic and save into a JSON file
    @ReactMethod
    public static void generateAndSaveWallet(String mnemonic, String password, String destinationDirectory, Promise promise) throws Exception {
        try {
            byte[] seed = MnemonicUtils.generateSeed(mnemonic, password);

            ECKeyPair keyPair = ECKeyPair.create(Hash.sha256(seed));
            Log.d("privateKey: ", keyPair.getPrivateKey().toString(16));
            Log.d("publicKey: ", keyPair.getPublicKey().toString(16));

            String walletFile = WalletUtils.generateWalletFile(password, keyPair, new File(destinationDirectory), false);
            Log.d("walletFile name: ", walletFile);

            promise.resolve(walletFile);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    // TODO: Remove. Only for testing
    @ReactMethod
    public static void loadCredentialsFromFile(String password, String filePath, Promise promise) throws Exception {
        try {
            Credentials cred = WalletUtils.loadCredentials(password, filePath);
            ECKeyPair keyPair = cred.getEcKeyPair();
            String address = cred.getAddress();
            String privateKey = keyPair.getPrivateKey().toString(16);
            String publicKey = keyPair.getPublicKey().toString(16);
            Log.d("getAddress: ", address);
            Log.d("privateKey: ", privateKey);
            Log.d("publicKey: ", publicKey);

            promise.resolve(address);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

//    @ReactMethod
//    public static void test(String[] args) throws Exception {
//        String walletPassword = "Test123";
//        String walletPath = "./target/sampleKeystores";
//
//        // Generate a random EC Key Pair
//        ECKeyPair keyPair = generateECKeyPair();
//
//        // Derive private key from the EC Key Pair
//        BigInteger privateKey = keyPair.getPrivateKey();
//        System.out.println("Private key (256 bits): " + privateKey.toString(16));
//
//        // Derive public key from the EC Key Pair
//        BigInteger publicKey = keyPair.getPublicKey();
//        System.out.println("Public key (512 bits): " + publicKey.toString(16));
//        System.out.println("Public key (compressed): " + compressPublicKey(publicKey));
//
//        // Derive address from the public key
//        String address = deriveAddress(publicKey);
//        System.out.println("Address: " + address);
//
//        // Generate keystore file for the EC Key Pair
//        String walletFileName = generateKeystoreJSON(walletPassword, walletPath, keyPair);
//        System.out.println(walletFileName);
//
//        String keystorePath = walletPath + File.separator + walletFileName;
//
//        // Unlock keystore
//        ECKeyPair derivedKeys = decryptCredentials(keystorePath, walletPassword).getEcKeyPair();
//        System.out.println("Unlocked Private key: " + derivedKeys.getPrivateKey().toString(16));
//        System.out.println("Unlocked Public Key " + derivedKeys.getPublicKey().toString(16));
//
//        // Sign message
//        String msg = "TEST";
//        String signedMessage = signMessage(msg, keyPair);
//        System.out.println("SignedMessage: " + signedMessage);
//    }
}

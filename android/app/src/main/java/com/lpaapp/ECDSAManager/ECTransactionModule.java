package com.lpaapp.ECDSAManager;

import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.crypto.WalletUtils;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.EthGetTransactionCount;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.response.PollingTransactionReceiptProcessor;
import org.web3j.utils.Numeric;
import com.facebook.react.bridge.Promise;

import java.math.BigInteger;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

public class ECTransactionModule extends ReactContextBaseJavaModule {

    private static final String NODE_PROVIDER_URL = "https://opt-sepolia.g.alchemy.com/v2/exbaDHVaccqlKu42xqkdxB1av48xGEp5";
    //web3j instance connecting to the Ethereum network using node provider
    private static final Web3j web3j = Web3j.build(new HttpService(NODE_PROVIDER_URL));
    private static ReactApplicationContext mReactContext;

    ECTransactionModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactContext = reactContext;
    }

    @Override
    public String getName() {
    return "ECTransactionManager"; // Name exposed to React Native
    }

    //creates and signs a transaction with the provided parameters, then sends it to the Ethereum network
    /*params
     * - ECDSA SECP256K1 Private Key
     * - recipient address (to)
     * - sender address (from)
     * - transaction value
     * - calldata (for smart contract interactions)
     * - gas price
     * - gas limit
     * - nonce
     */
    @ReactMethod
    public static void initiateTransaction(String privateKey, String to, String from, BigInteger value, String calldata, BigInteger gasPrice, BigInteger gasLimit, BigInteger nonce, Promise promise) {
        try {
            RawTransaction rawTransaction = RawTransaction.createTransaction(
                    nonce,
                    gasPrice,
                    gasLimit,
                    to,
                    value,
                    calldata
            );

            Credentials txnCredentials = Credentials.create(privateKey);      
            byte[] signedMessage = TransactionEncoder.signMessage(rawTransaction, txnCredentials);
            String hexValue = Numeric.toHexString(signedMessage);

            //signed transaction is sent using ethSendRawTransaction
            EthSendTransaction ethSendTransaction = web3j.ethSendRawTransaction(hexValue).send();
            if (ethSendTransaction.hasError()) {
                promise.reject(ethSendTransaction.getError().getMessage());
            } else {
              //the transaction hash is returned via the promise
                String transactionHash = ethSendTransaction.getTransactionHash();
                promise.resolve(transactionHash);
            }
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    public static BigInteger getNonce(String address) throws Exception {
        EthGetTransactionCount ethGetTransactionCount = web3j.ethGetTransactionCount(
                address, org.web3j.protocol.core.DefaultBlockParameterName.LATEST).send();
        return ethGetTransactionCount.getTransactionCount();
    }

    public static TransactionReceipt getTransactionReceipt(String transactionHash) throws Exception {
        PollingTransactionReceiptProcessor receiptProcessor = new PollingTransactionReceiptProcessor(web3j, 1000, 15);
        return receiptProcessor.waitForTransactionReceipt(transactionHash);
    }
}

// @ReactMethod
// public static void main(String[] args) {
//   try {
//       // Decrypt credentials
//       Credentials credentials = ECTransactionManager.decryptPrivateKey("/path/to/keystore/file", "walletPassword");

//       // Get nonce for the sender address
//       BigInteger nonce = ECTransactionManager.getNonce(credentials.getAddress());

//       // Define transaction parameters
//       String to = "0xC479b44CF3Af681700F900ed7767154be43177e1";//MAC_DEV
//       String from = ""
//       // String from = credentials.getAddress();
//       BigInteger value = BigInteger.valueOf(1000000000000000L); // 1 ETH = 1000000000000000000L :: 0.001 ETH = 1000000000000000L
//       String calldata = ""; // Smart contract call data if needed
//       BigInteger gasPrice = BigInteger.valueOf(27000000000L); // 27 Gwei
//       BigInteger gasLimit = BigInteger.valueOf(21000);

//       // Promise to handle the result
//       Promise promise = new Promise() {
//           @Override
//           public void resolve(Object value) {
//               System.out.println("Transaction hash: " + value);
//           }

//           @Override
//           public void reject(String code, String message) {
//               System.err.println("Error: " + message);
//           }

//           @Override
//           public void reject(String code, Throwable e) {
//               e.printStackTrace();
//           }

//           @Override
//           public void reject(String code, String message, Throwable e) {
//               System.err.println("Error: " + message);
//               e.printStackTrace();
//           }

//           @Override
//           public void reject(Throwable e) {
//               e.printStackTrace();
//           }
//       };

//       // Initiate the transaction
//       ECTransactionManager.initiateTransaction(credentials, to, from, value, calldata, gasPrice, gasLimit, nonce, promise);

//   } catch (Exception e) {
//       e.printStackTrace();
//   }
// }

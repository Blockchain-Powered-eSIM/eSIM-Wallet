package com.lpaapp.IdentityManager;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.telephony.TelephonyManager;
import android.telephony.SubscriptionManager;
import android.telephony.SubscriptionInfo;
import android.util.Log;
import android.util.DisplayMetrics;
import android.graphics.Point;
import android.view.Display;
import android.view.WindowManager;
import android.view.WindowMetrics;
import androidx.core.app.ActivityCompat;
import androidx.core.util.Pair;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import java.time.Instant;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.UUID;

public class IdentityManagerModule extends ReactContextBaseJavaModule {

    private final static String TAG = IdentityManagerModule.class.getCanonicalName();
    private final static String E_NO_DEFAULT_SUBSCRIPTION = "no_defalut_subscription";
    private final static String E_NO_PHONE_NUMBER_PERMISSION = "no_phoneNumber_permission_available";
    private static ReactApplicationContext mReactContext;
    private TelephonyManager mTelephonyManager;
    private SubscriptionManager mSubscriptionManager;

    IdentityManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mTelephonyManager = (TelephonyManager) reactContext.getSystemService(Context.TELEPHONY_SERVICE);

        mReactContext = reactContext;
        initSubscriptionManager();
    }

    private void initSubscriptionManager() {
        if (mSubscriptionManager == null) {
            mSubscriptionManager = (SubscriptionManager) mReactContext.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE);
        }
    }

    @Override
    public String getName() {
        return "IdentityManager"; // Name exposed to React Native
    }

    private long getUnixTimestamp(){
      return Instant.now().getEpochSecond();
    }

    //Function to get screen resolution, returns a Pair<>(height, width). The values are integers 
    private Pair<Integer, Integer> getScreenResolution(){
      int width, height;
      WindowManager mWindowManager = (WindowManager) mReactContext.getSystemService(Context.WINDOW_SERVICE);
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
          // For Android 11 (API Level 30) and higher
          WindowMetrics display = mWindowManager.getCurrentWindowMetrics();
          width = display.getBounds().width();
          height = display.getBounds().height();
      } else {
          // For older Android versions
          Display display = mWindowManager.getDefaultDisplay();
          Point size = new Point();
          display.getSize(size);
          width = size.x;
          height = size.y;
      }
      // Ensure vertical orientation format
      if (width > height) {
          int temp = width;
          width = height;
          height = temp;
      }
      return new Pair<>(height, width);
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    private String hash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes());
            return bytesToHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return null;
        }
    }

    private String fetchPhoneNumber() {
      String phoneNumber = null; // Initialize for potential failure 
        try {
            getDefaultPhoneNumber(new Promise() {
                @Override
                public void resolve(Object result) {
                    phoneNumber = (String) result; // Cast and store if successful
                }

                @Override
                public void reject(String code, String message) {
                    // Handle error cases 
                    System.out.println("Error fetching phone number: " + code + " - " + message);  // Replace with proper error logging
                }
            });
        } catch (Exception e) {
            System.out.println("Exception calling getDefaultPhoneNumber: " + e.getMessage());  // Replace with proper error logging
        }
      return phoneNumber;   
    }

    // Example: Getting the Phone number for default Subscription
    // TODO : Add prompt to select the subscription user wants to use 
    @ReactMethod 
    public void getDefaultPhoneNumber(Promise promise) {
        if (ActivityCompat.checkSelfPermission(mReactContext, Manifest.permission.READ_PHONE_NUMBERS) == PackageManager.PERMISSION_GRANTED) {
          initSubscriptionManager();
          int defaultSubscriptionID = mSubscriptionManager.getDefaultSubscriptionId();
          SubscriptionInfo defaultSubscription = mSubscriptionManager.getActiveSubscriptionInfo(defaultSubscriptionID);
          if (defaultSubscription != null) {
              int subscriptionId = defaultSubscription.getSubscriptionId();
              String phoneNumber = mSubscriptionManager.getPhoneNumber(subscriptionId);
              promise.resolve(phoneNumber); // Return phone number if found
          } else {
              promise.reject(E_NO_DEFAULT_SUBSCRIPTION, "Default Subscription is null"); // Promise reject if no default subscription
          }
          // FALLBACK
          // A way to get all valid subscriptions and pick one phone number from it if default subscription is not valid.
          //List<SubscriptionInfo> activeSubscriptions = mSubscriptionManager.getActiveSubscriptionInfoList();
          //if (activeSubscriptions != null) {
          //    for (SubscriptionInfo info : activeSubscriptions) {
          //        int subscriptionId = info.getSubscriptionId();
          //        String phoneNumber = mSubscriptionManager.getPhoneNumber(subscriptionId);
      
          //        if (phoneNumber != null && !phoneNumber.isEmpty()) {
          //            // Use the retrieved phoneNumber
          //        } else {
          //            // Handle case where phone number wasn't found for this subscription
          //        }
          //    }
          //} else {
          //    // Handle case where there are no active subscriptions
          //}
      } else {
          promise.reject(E_NO_PHONE_NUMBER_PERMISSION, "READ_PHONE_NUMBERS permission not granted");
      }
    }

    @ReactMethod
    public void generateIdentifier() {
        // Get system time
        long timestamp = getUnixTimestamp();

        // Get hardware identifiers
        Pair<Integer,Instant> screenResolution = getScreenResolution();
        height = screenResolution.first;
        width = screenResolution.second;
        String phoneNumber = fetchPhoneNumber();

        // Generate random bytes using CSPRNG
        SecureRandom random = new SecureRandom();
        byte[] randomBytes = new byte[16]; // 128 bits
        random.nextBytes(randomBytes);

        // Combine entropy: system time, hardware identifiers, and random bytes
        String combinedEntropy = timestamp + height + width + phoneNumber + bytesToHex(randomBytes);

        // Apply hash function to the combined entropy
        String identifier = hash(combinedEntropy);

        // Emit the generated identifier to JavaScript
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("IdentifierGenerated", identifier);
    }
}

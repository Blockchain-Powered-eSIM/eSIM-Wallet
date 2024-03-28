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
}

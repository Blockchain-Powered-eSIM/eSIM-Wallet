package com.lpaapp.EuiccBridge;

import android.content.Context;
import android.telephony.TelephonyManager;
import android.telephony.euicc.EuiccManager;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class EuiccManagerModule extends ReactContextBaseJavaModule {

    private final static String TAG = EuiccManagerModule.class.getCanonicalName();
    private final static String E_NO_CARRIER_NAME = "no_carrier_name";
    private final static String E_NO_ISO_COUNTRY_CODE = "no_iso_country_code";
    private final static String E_NO_MOBILE_COUNTRY_CODE = "no_mobile_country_code";
    private final static String E_NO_MOBILE_NETWORK = "no_mobile_network";
    private final static String E_NO_NETWORK_OPERATOR = "no_network_operator";
    private final static String E_NO_EID = "no_eid_available";
    private final static String E_NO_CARRIER_PRIVILEGES = "no_carrier_privilege_available";
    private static ReactApplicationContext mReactContext;
    private TelephonyManager mTelephonyManager;
    private EuiccManager mEuiccManager;

    EuiccManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mTelephonyManager = (TelephonyManager) reactContext.getSystemService(Context.TELEPHONY_SERVICE);

        mReactContext = reactContext;
        initEuiccManager();
    }

    private void initEuiccManager() {
        if (mEuiccManager == null) {
            mEuiccManager = (EuiccManager) mReactContext.getSystemService(Context.EUICC_SERVICE);
        }
    }

    @Override
    public String getName() {
        return "EuiccManager"; // Name exposed to React Native
    }

    // Getting the EID
    @ReactMethod 
    public void getEID(Promise promise) {
        //Log.d(TAG, "Carrier Privilege State is:" + mTelephonyManager.hasCarrierPrivileges());
        try {
            initEuiccManager();
            if(mTelephonyManager.hasCarrierPrivileges()){
              if (mEuiccManager.isEnabled()) {
                  String eid = mEuiccManager.getEid();
                  promise.resolve(eid);
              } else {
                  promise.reject(E_NO_EID, "eUICC Manager is not enabled");
              }
            } else {
                promise.reject(E_NO_CARRIER_PRIVILEGES, "hasCarrierPrivileges check failed");
            }
        } catch (Exception e) {
            promise.reject("Error", e.getMessage()); 
        }
    }
}

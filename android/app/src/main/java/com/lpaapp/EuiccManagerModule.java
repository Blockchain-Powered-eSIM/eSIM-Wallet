package com.lpaapp;

import android.content.Context;
import android.telephony.TelephonyManager;
import android.telephony.euicc.EuiccManager;

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
    private TelephonyManager TelephonyManagerObj;
    private EuiccManager EuiccManagerObj;

    public EuiccManagerModule(ReactApplicationContext reactContext) {
        super(reactContext); 
        TelephonyManagerObj = (TelephonyManager) reactContext.getSystemService(Context.TELEPHONY_SERVICE);
        EuiccManagerObj = (EuiccManager) reactContext.getSystemService(Context.EUICC_SERVICE);
    }

    @Override
    public String getName() {
        return "EuiccManager"; // Name exposed to React Native
    }

  // Example: Getting the EID
    @ReactMethod 
    public void getEid(Promise promise) {
        String eid = EuiccManagerObj.getEid();
        try {
            EuiccManager euiccManager = (EuiccManager) getReactApplicationContext().getSystemService(Context.EUICC_SERVICE);
            if (euiccManager.isEnabled()) {
                promise.resolve(eid);
            } else {
                promise.reject(E_NO_EID, "eUICC Manager is not enabled");
            }
        } catch (Exception e) {
            promise.reject("Error", e.getMessage()); 
        }
    }

    @ReactMethod
    public void carrierName(Promise promise) {
        String carrierName = TelephonyManagerObj.getSimOperatorName();
        if (carrierName != null && !"".equals(carrierName)) {
            promise.resolve(carrierName);
        } else {
            promise.reject(E_NO_CARRIER_NAME, "No carrier name");
        }
    }

    @ReactMethod
    public void isoCountryCode(Promise promise) {
        String iso = TelephonyManagerObj.getSimCountryIso();
        if (iso != null && !"".equals(iso)) {
            promise.resolve(iso);
        } else {
            promise.reject(E_NO_ISO_COUNTRY_CODE, "No iso country code");
        }
    }

    // returns MCC (3 digits)
    @ReactMethod
    public void mobileCountryCode(Promise promise) {
        String plmn = TelephonyManagerObj.getSimOperator();
        if (plmn != null && !"".equals(plmn)) {
            promise.resolve(plmn.substring(0, 3));
        } else {
            promise.reject(E_NO_MOBILE_COUNTRY_CODE, "No mobile country code");
        }
    }

    // returns MNC (2 or 3 digits)
    @ReactMethod
    public void mobileNetworkCode(Promise promise) {
        String plmn = TelephonyManagerObj.getSimOperator();
        if (plmn != null && !"".equals(plmn)) {
            promise.resolve(plmn.substring(3));
        } else {
            promise.reject(E_NO_MOBILE_NETWORK, "No mobile network code");
        }
    }

    // return MCC + MNC (5 or 6 digits), e.g. 20601
    @ReactMethod
    public void mobileNetworkOperator(Promise promise) {
        String plmn = TelephonyManagerObj.getSimOperator();
        if (plmn != null && !"".equals(plmn)) {
            promise.resolve(plmn);
        } else {
            promise.reject(E_NO_NETWORK_OPERATOR, "No mobile network operator");
        }
    }
}

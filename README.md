# Blockchain Powered Local Profile Assistant App

This project is the codebase for a LPA app developed to create eSIM based wallets which allow users to interact with blockchain.
Right now this app only works on android. iOS support is planned in the future.

## Project setup

_This project assumes that the machine running ths code has JDK, Android SDK and other basic dependencies install to run an Android project._

This app is a react-native based app with java bridges to interface between android core API's and the react-native component.
Basic setup instructions for react-native projects along with dependencies can be found [here](https://reactnative.dev/docs/environment-setup?guide=native&platform=android)
Please follow this guide exactly.

Create a `local.properties` file in `/android` folder and define the sdk path as shown below:

```
sdk.dir=/Users/<USERNAME>/Library/Android/sdk
```

Replace the `<USERNAME>` with your device username

Please run the following command if you run into missing package dependencies during intial build.

```sh
npm install
```

## Running the project

After successful installation of packages and dependencies,
Start the project by running the below command:

```sh
npm run start
```

and then press `a` to run on Android

## Test Environment

The deployed code is tested on macOS 14.1.1 for Android OS and node version 19.5.0. Refer to [package.json](https://github.com/Blockchain-Powered-eSIM/LPA/blob/main/package.json) for more details on versions of tools used for development and testing.

**Minimum API Level required is 29**

## Permissions required for Android

### List of core android services used in the project:

- https://developer.android.com/reference/android/telephony/euicc/EuiccManager#downloadSubscription
- https://developer.android.com/reference/android/telephony/TelephonyManager
- https://developer.android.com/reference/android/telephony/SubscriptionManager
- https://developer.android.com/reference/android/telephony/SubscriptionInfo

### Add these permissions in your Android Manifest if it doesn't exist:

```xml
    <uses-permission android:name="android.permission.READ_PHONE_STATE"/>
    <uses-permission android:name="android.permission.READ_PHONE_NUMBERS"/>
    <uses-permission android:name="android.permission.READ_PRECISE_PHONE_STATE"/>
    <uses-permission android:name="android.permission.READ_PRIVILEGED_PHONE_STATE"/>
    <uses-permission android:name="android.permission.WRITE_EMBEDDED_SUBSCRIPTIONS"/>
```

eSIM services provided by the EuiccManager API needs either **carrier privileges** for regular apps or **READ_PRIVILEGED_PHONE_STATE** for system apps on android.
For more details about these permissions reference

- https://developer.android.com/reference/android/Manifest.permission#READ_PRECISE_PHONE_STATE
- https://source.android.com/docs/core/connect/esim-overview#carrier-privileges

## Fetch Methods

### EID: [getEID()](https://github.com/Blockchain-Powered-eSIM/LPA/blob/main/android/app/src/main/java/com/lpaapp/EuiccBridge/EuiccManagerModule.java)

```
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
```

### SIM Info: [subscriptionInfos<>](https://github.com/Blockchain-Powered-eSIM/LPA/blob/main/android/app/src/main/java/com/lpaapp/DeviceInfoBridge/SimDataModule.java)

```
//via
TelephonyManager mTelephonyManager = (TelephonyManager) mReactContext.getSystemService(Context.TELEPHONY_SERVICE);

//through
SubscriptionManager mSubscriptionManager = (SubscriptionManager) mReactContext.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE);

//Listing SIM Info
List<SubscriptionInfo> subscriptionInfos = mSubscriptionManager.getActiveSubscriptionInfoList();

            //List
            CharSequence carrierName = subInfo.getCarrierName();
            String countryIso = subInfo.getCountryIso();
            int dataRoaming = subInfo.getDataRoaming(); // 1 is enabled ; 0 is disabled
            CharSequence displayName = subInfo.getDisplayName();
            String iccId = subInfo.getIccId();
            int mcc = subInfo.getMcc();
            int mnc = subInfo.getMnc();
            int simSlotIndex = subInfo.getSimSlotIndex();
            int subscriptionId = subInfo.getSubscriptionId();
            int networkRoaming = mTelephonyManager.isNetworkRoaming() ? 1 : 0;

```

### Phone Number: [getDefaultPhoneNumber()](https://github.com/Blockchain-Powered-eSIM/LPA/blob/main/android/app/src/main/java/com/lpaapp/IdentityManager/IdentityManagerModule.java)

```
@ReactMethod
    public void getDefaultPhoneNumber(Promise promise) {
      if (ActivityCompat.checkSelfPermission(mReactContext, Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED) {
        initSubscriptionManager();
        int defaultSubscriptionID = mSubscriptionManager.getDefaultSubscriptionId();
        SubscriptionInfo defaultSubscription = mSubscriptionManager.getActiveSubscriptionInfo(defaultSubscriptionID);
        if (defaultSubscription != null) {
            String phoneNumber;
            int subscriptionId = defaultSubscription.getSubscriptionId();
            // getPhoneNumber() method only works for android 13 and above
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
              phoneNumber = mSubscriptionManager.getPhoneNumber(subscriptionId);
            } else {
              phoneNumber = mTelephonyManager.getLine1Number();
            }
            promise.resolve(phoneNumber);
        } else {
            promise.reject(E_NO_DEFAULT_SUBSCRIPTION, "Default Subscription is null"); // Promise reject if no default subscription
        }
      }
    }
```

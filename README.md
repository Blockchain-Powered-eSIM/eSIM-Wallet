# Blockchain Powered Local Profile Assistant App

This project is the codebase for a LPA app developed to create eSIM based wallets which allow users to interact with blockchain.
Right now this app only works on android. iOS support is planned in the future.

## Project setup

This app is a react-native based app with java bridges to interface between android core API's and the react-native component.
Basic setup instructions for react-native projects along with dependencies can be found [here](https://reactnative.dev/docs/environment-setup?guide=native&platform=android)
Please follow this guide exactly.

Please run the following command if you run into missing package dependencies during intial build.

```sh
npm install
```

The deployed code is tested on macOS 14.1.1 for Android OS. Refer to [package.json](https://github.com/Blockchain-Powered-eSIM/LPA/blob/main/package.json) for more details on versions of tools used for development and testing.

**Minimum API Level required is 29**

## Permissions required for Android

List of core android services used in the project:

- https://developer.android.com/reference/android/telephony/euicc/EuiccManager#downloadSubscription
- https://developer.android.com/reference/android/telephony/TelephonyManager
- https://developer.android.com/reference/android/telephony/SubscriptionManager
- https://developer.android.com/reference/android/telephony/SubscriptionInfo

Add these permissions in your Android Manifest:

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

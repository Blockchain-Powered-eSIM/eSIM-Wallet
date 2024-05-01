# Blockchain Powered Local Profile Assistant App

This project is the codebase for a LPA app developed to create eSIM based wallets which allow users to interact with blockchain.
Right now this app only works on android. iOS support is planned in the future.

## Project setup

The instructions provided below are for macOS. Detailed setup instructions for react-native projects along with dependencies for other operating systems can be found [here](https://reactnative.dev/docs/environment-setup?guide=native&platform=android)

### Node and JDK setup

This app is a react-native based app with java bridges to interface between android core API's and the react-native component.
Install node and watchman. Make sure to use Node 18 or higher version. Watchman, a tool by Facebook, allows watching changes in the filesystem. It is highly recommended to install it for better performance.

```sh
brew install node
brew install watchman
```
We recommend installing the OpenJDK distribution Azul Zulu.

```sh
brew tap homebrew/cask-versions
brew install --cask zulu17

# Get path to where cask was installed to double-click installer
brew info --cask zulu17
```

After installing the JDK, update the JAVA_HOME environment variable. Using above steps, JDK will likely be at `/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home`

We recommend JDK 17 as higher JDK versions might cause some issues. To make sure JDK version 17 is used, update the `JAVA_HOME` and `PATH` variable to reflect the same.

```sh
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home/
export PATH=$JAVA_HOME/bin:$PATH
```

### Setup Android Studio

[Download and Install Android Studio](https://developer.android.com/studio/index.html)

While on Android Studio installation wizard, make sure the boxes next to all of the following items are checked:

- Android SDK
- Android SDK Platform
- Android Virtual Device

Then, click "Next" to install all of these components.

Android Studio installs the latest Android SDK by default. Building a React Native app with native code, however, requires the `Android 14 (UpsideDownCake)` SDK in particular. Additional Android SDKs can be installed through the SDK Manager in Android Studio.

To do that, open Android Studio, click on "More Actions" button and select "SDK Manager".

Select the "SDK Platforms" tab from within the SDK Manager, then check the box next to "Show Package Details" in the bottom right corner. Look for and expand the `Android 14 (UpsideDownCake)` entry, then make sure the following items are checked:

- Android SDK Platform
- `Intel x86 Atom_64 System Image` or `Google APIs Intel x86 Atom System Image` or (for Apple M1 Silicon) `Google APIs ARM 64 v8a System Image`

Setup environment variables to use the android utlities just installed. Add the following lines in `~/.zshrc` or `~/.zprofile` (or `~/.bashrc` file if using bash shell)

```sh
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

then run 

```sh
source ~/.zshrc
```

Verify that `ANDROID_HOME` has been set by running `echo $ANDROID_HOME` and the appropriate directories have been added to your path by running `echo $PATH`.

> Please make sure that the correct Android SDK path is set. To find the actual location of the SDK in the Android Studio click on "Settings" dialog, under Languages & Frameworks → Android SDK.

### Clone the project

```sh
git clone https://github.com/Blockchain-Powered-eSIM/LPA.git
```

This project uses React Native's built-in command line interface. Rather than install and manage a specific version of the CLI globally, we recommend accessing the current version at runtime using `npx`, which ships with Node.js. With `npx react-native <command>`, the current stable version of the CLI will be downloaded and executed when the command is run.

> Please remove any globally installed react-native-cli package previously as it may cause unexpected issues
> ```sh 
> npm uninstall -g react-native-cli @react-native-community/cli
> ```

An Android device or an Android Virtual Device (AVD) setup is required to run the app.

To use a physical android device. just connect it to you computer and enable USB debugging. More details are available [here](https://reactnative.dev/docs/running-on-device)

To use an AVD for development and testing, create one using Android Studio Device Manager.

Open `./LPA/android`, to see the list of available Android Virtual Devices (AVDs) open "AVD Manager" in Android Studio. If no virtual device available, create a new one by following the instructions [here](https://developer.android.com/studio/run/managing-avds.html). Preferred image for testing is `UpsideDownCake API Level 34`. **Make sure that the Android version on your virtual device is greater than Android 10 (or API level 30)**

The project uses some react native libraries as dependencies. Run the follwing command (from the project working directory) to make sure all required libraries are installed before your first build.

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

#### Expected output:

```
 LOG  UseEffect Asking permission
 LOG  phNumber:  +15551234567
 LOG  retrievedHash:  null
 LOG  uniqueIdentifier:  7a8531a11075593c48b46867280656af40bd44f2d2bc4d6c51c0de91e8c337d5
 LOG  Private Key Encrypted
 LOG  eSJent1PDOHO36OJk3jyovoyicFW0v/cowrFQ0KJAf3Du1/k1W3ilgZ/SCyV81jP/4OM22CLOPax
 QqMao22tFm4T/7DY+zdUi6GLNecLhF6t2xhb2+Eerf1SZ2QLAlZ0sQYGB5Tqgi/Le4iwE+JMZ7ky
 wrkGTM0GUsAitn7jMuGh6T2tKo0j5zeg1BLD4r9jTIMLK3eoKxsydwe6PTHqbZoxx8MBm6d2gdkk
 k3/hici8YrFm0+dxfzILK9vbYGy86kmIvjosisRzSjnRmsFqUO3F1BeGm+tjfNR34Icz8kvIbz4x
 ZK+58/aA/9KTPNyrbmIKTeMSlmluJe4qaZUsnw==
 LOG  Encrypted Key Securely Stored
```

https://github.com/ManulParihar/LPA/assets/95626013/22823f13-bf1a-4b2e-91a7-c61307d05eed

<img width="1470" alt="ADBLogcatOutput" src="https://github.com/ManulParihar/LPA/assets/95626013/e07b40f4-7596-4cef-aa9f-d3fab3c144e2">

## Test Environment

The deployed code is tested on macOS 14.1.1 for Android OS,  
node version 19.5.0, JDK version 17.0.1, openjdk 17.0.10 and
OpenJDK Runtime Environment Zulu17.48+15-CA (build 17.0.10+7-LTS)

Refer to [package.json](https://github.com/Blockchain-Powered-eSIM/LPA/blob/main/package.json) for more details on versions of tools used for development and testing.

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

```java
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

```java
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

```java
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

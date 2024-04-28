This README provides an overview of the testing setup and execution process using Detox for end-to-end (E2E) testing and Jest for unit testing.

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- Android Studio (for Android testing) or Xcode (for iOS testing) installed
- React Native project set up and running

### Installation

1. Clone the repository: `git clone https://github.com/Blockchain-Powered-eSIM/LPA`
2. Navigate to the project directory: `cd LPA`
3. Install dependencies: `npm install`

### Configuration

- Detox configuration: Configure Detox in the `.detoxrc.js` file to specify test runner arguments, app configurations, device types, etc.
- Jest configuration: Configure Jest in the `e2e/jest.config.js` and `base.jest.config.js` files for unit and E2E testing settings.

_Make sure to run the app before running test because because of different emulator settings_

## Running Tests

### Unit Tests

- Run unit tests using Jest:
  `npm test`

### End-to-End (E2E) Tests with Detox

1. Build the app for testing:
   `npm run build`

2. Start the Detox test environment:
   `npm run test`

### Expected Results

```
> LPAapp@0.0.1 test
> detox test --configuration android.emu.debug

09:34:03.799 detox[78599] B jest --config e2e/jest.config.js
09:34:06.951 detox[78600] i firstTest.spec.js is assigned to emulator-5554 (Pixel_3a_API_34_extension_level_7_arm64-v8a)
09:34:06.953 detox[78600] i App Launch Test: should launch the app successfully
09:34:09.312 detox[78600] i App Launch Test: should launch the app successfully [OK]

09:34:09.313 detox[78600] i Modal Visibility Test: should initially hide the modal
09:34:09.444 detox[78600] i Modal Visibility Test: should initially hide the modal [OK]

09:34:09.445 detox[78600] i Unique ID Fetch Test: should fetch and display unique ID in modal
09:34:10.922 detox[78600] i Unique ID Fetch Test: should fetch and display unique ID in modal [OK]

09:34:10.924 detox[78600] i Modal Dismissal Test: should dismiss the modal when "Back" button is pressed
09:34:12.092 detox[78600] i Modal Dismissal Test: should dismiss the modal when "Back" button is pressed [OK]

 PASS  e2e/firstTest.spec.js (7.712 s)
  App Launch Test
    ✓ should launch the app successfully (2358 ms)
  Modal Visibility Test
    ✓ should initially hide the modal (131 ms)
  Unique ID Fetch Test
    ✓ should fetch and display unique ID in modal (1476 ms)
  Modal Dismissal Test
    ✓ should dismiss the modal when "Back" button is pressed (1167 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        7.783 s, estimated 8 s
Ran all test suites.
```

## Troubleshooting

### Test Failures

- If tests fail, review the error messages and logs provided by Jest and Detox for insights into the cause of the failure.
- Check for issues related to emulator/device setup, app launch, test environment configuration, etc.

### Emulator/Device Issues

- If the emulator or device does not respond or encounters errors, try restarting it.
- Ensure that the emulator/device is properly configured and has the necessary permissions and resources allocated.

### Configuration Errors

- Double-check the configuration settings in `.detoxrc.js` and `e2e/jest.config.js` for correctness and compatibility with your testing environment.

## Additional Resources

- [Detox Documentation](https://github.com/wix/Detox/blob/master/docs/README.md): Official Detox documentation for detailed usage instructions and troubleshooting tips.
- [Jest Documentation](https://jestjs.io/docs/getting-started): Official Jest documentation for comprehensive guides and API references.
- [React Native Documentation](https://reactnative.dev/docs/getting-started): Official React Native documentation for learning and reference.

# Error Scenario

## Unknown AVD Name

When attempting to wipe the data and restart an Android Virtual Device (AVD) emulator, the error message "PANIC: Unknown AVD name [avd_name]" is encountered. This error indicates that the specified AVD name is not recognized or does not exist.

### Error Message

```
PANIC: Unknown AVD name [avd_name], use -list-avds to see valid list.
HOME is defined but there is no file avd_name.ini in $HOME/.android/avd
(Note: Directories are searched in the order $ANDROID_AVD_HOME, $ANDROID_SDK_HOME/avd, and $HOME/.android/avd)
```

### Possible Causes

- Incorrect AVD name specified.
- AVD not created or configured properly.
- Emulator or AVD Manager misconfiguration.

## Resolution Steps

1. **List Available AVDs**: Open Terminal or Command Prompt and navigate to your Android SDK tools directory. Run the following command to list the available AVDs:
   emulator -list-avds

2. **Identify AVD Name**: Look for the name of the emulator you want to wipe in the list that's displayed.

3. **Run AVD Manager Command**: Once you've identified the correct AVD name, run the AVD Manager command with the correct AVD name to wipe its data:
   `emulator -avd your_avd_name -wipe-data`
   Replace `your_avd_name` with the name of the AVD you want to wipe.

4. **Wait for Emulator to Restart**: The emulator will restart with wiped data. Wait for it to finish booting up.

5. **Retry Tests**: Once the emulator is up and running again, retry running your Detox tests to see if the issue is resolved.

describe('App Launch Test', () => {
  beforeEach(async () => {
    await device.launchApp({permissions: {phone: 'YES'}});
  });

  it('should launch the app successfully', async () => {
    // Check if the app launched without any errors
    await expect(element(by.text('eSIM Wallet app'))).toBeVisible(); // Adjust the selector based on your root component
  });
});

describe('Modal Visibility Test', () => {
  beforeEach(async () => {
    await device.launchApp({permissions: {phone: 'YES'}});
  });

  it('should initially hide the modal', async () => {
    // Check if the modal is initially not visible
    await expect(element(by.id('toggleModalVisibility'))).not.toBeVisible();
  });
});

describe('Unique ID Fetch Test', () => {
  beforeEach(async () => {
    await device.launchApp({permissions: {phone: 'YES'}});
  });

  it('should fetch and display unique ID in modal', async () => {
    // Tap on the button to fetch the unique ID
    await element(by.text('Fetch Unique ID')).tap();

    // Check if the modal is visible
    await expect(element(by.text('Device Data'))).toBeVisible();

    // Check if the unique ID text is displayed
    await expect(element(by.text('Back'))).toBeVisible(); //since unique ID should not be exposed
  });
});

describe('Modal Dismissal Test', () => {
  beforeEach(async () => {
    await device.launchApp({permissions: {phone: 'YES'}});
  });

  it('should dismiss the modal when "Back" button is pressed', async () => {
    // Check if the modal is visible
    await expect(element(by.text('Device Data'))).toBeVisible();

    // Tap on the "Back" button
    await element(by.text('Back')).tap();

    // Check if the modal is hidden after tapping "Back" button
    await expect(element(by.id('isModalVisible'))).not.toBeVisible();
  });
});

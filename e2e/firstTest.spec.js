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

describe('Generate EC KeyPair Test', () => {
  beforeEach(async () => {
    await device.launchApp({permissions: {phone: 'YES'}});
  });

  it('should generate and display EC KeyPair', async () => {
    // Tap on the "Generate EC KeyPair" button
    await element(by.text('Generate EC KeyPair')).tap();

    // Check if the modal with the Master Keystore Address is visible
    await expect(element(by.text('Master Keystore Address'))).toBeVisible();

    // Check if the master key store address is displayed
//    await expect(element(by.type('Text'))).toBeVisible();

    // Tap on the "Back" button to dismiss the modal
    await element(by.text('Back')).tap();
  });
});

//describe('Org Data Fetch Test', () => {
//  beforeEach(async () => {
//    await device.launchApp({permissions: {phone: 'YES'}});
//  });
//
//  it('should fetch and display org data', async () => {
//    // Tap on the "Org" button
//    await element(by.text('Org')).tap();
//
//    // Check if the modal with the organization data is visible
//    await expect(element(by.text('Organization Data'))).toBeVisible();
//
//    // Check if the organization data is displayed
//    await expect(element(by.type('Identifying users uniquely for application based on eSIM'))).toBeVisible();
//
//    // Tap on the "Close" button to dismiss the modal
//    await element(by.text('Close')).tap();
//  });
//});

//describe('Catalogue Test', () => {
//  beforeEach(async () => {
//    await device.launchApp({permissions: {phone: 'YES'}});
//  });
//
//  it('should display the catalogue', async () => {
//    // Tap on the "Catalogue" button
//    await element(by.text('Catalogue')).tap();
//
//    // Check if the modal with the catalogue is visible
//    await expect(element(by.text('REGIONS'))).toBeVisible();
//
//    // Check if the regions are displayed
//    await expect(element(by.type('Global'))).toBeVisible();
//    await expect(element(by.type('Antarctica'))).toBeVisible();
//
//    // Tap on the "Close" button to dismiss the modal
//    await element(by.text('Close')).tap();
//  });
//});

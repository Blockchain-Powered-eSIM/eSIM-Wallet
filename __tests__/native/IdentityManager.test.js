import {NativeModules} from 'react-native';
import {by, element, waitFor} from 'detox';
import {
  getName,
  getDefaultPhoneNumber,
  generateIdentifier,
} from '../../android/app/src/main/java/com/lpaapp/IdentityManager/IdentityManagerModule.java';

jest.mock(
  '../../android/app/src/main/java/com/lpaapp/IdentityManager/IdentityManagerModule.java',
  () => ({
    getName: jest.fn(),
    getDefaultPhoneNumber: jest.fn(),
    generateIdentifier: jest.fn(),
  }),
);

describe('IdentityManagerNativeModule', () => {
  beforeAll(() => {
    NativeModules.IdentityManager = {
      getName,
      getDefaultPhoneNumber,
      generateIdentifier,
    };
  });

  describe('getName', () => {
    it('returns the name of the module', async () => {
      getName.mockReturnValueOnce('IdentityManager');
      const moduleName = await NativeModules.IdentityManager.getName();
      expect(moduleName).toBe('IdentityManager');
    });
  });

  describe('getDefaultPhoneNumber', () => {
    it('fetches the default phone number', async () => {
      const phoneNumber = '1234567890'; // Replace with a sample phone number
      getDefaultPhoneNumber.mockResolvedValueOnce(phoneNumber);
      const retrievedPhoneNumber =
        await NativeModules.IdentityManager.getDefaultPhoneNumber();
      expect(retrievedPhoneNumber).toBe(phoneNumber);
    });
  });

  describe('generateIdentifier', () => {
    it('generates a unique identifier', async () => {
      const phoneNumber = '1234567890'; // Replace with a sample phone number
      const uniqueIdentifier = 'sampleUniqueIdentifier'; // Replace with a sample unique identifier
      generateIdentifier.mockResolvedValueOnce(uniqueIdentifier);

      // Mock the UI interaction
      await element(by.text('Fetch Unique ID')).tap();
      await waitFor(element(by.id('uniqueID')))
        .toBeVisible()
        .withTimeout(5000);

      // Verify the identifier is fetched and displayed
      const retrievedIdentifier = await element(
        by.id('uniqueID'),
      ).getAttributes('text');
      expect(retrievedIdentifier).toBe(uniqueIdentifier);
    });
  });
});

import {NativeModules} from 'react-native';

// import {getName} from '../../android/app/src/main/java/com/lpaapp/IdentityManagerModule.java';

// jest.mock(
//   '../../android/app/src/main/java/com/lpaapp/IdentityManager/IdentityManagerModule.java',
//   () => ({
//     getName: jest.fn(),
//   }),
// );

// describe('IdentityManagerNativeModule', () => {
//   // beforeAll(() => {
//   //     NativeModules.IdentityManager = {
//   //         getName: jest.fn(),
//   //         getDefaultPhoneNumber: jest.fn(),
//   //     }
//   // });

//   describe('get name', () => {
//     it('returns name of the module', async () => {
//       const moduleName = await NativeModules.IdentityManager.getName();
//       expect(moduleName).toBe('IdentityManager');
//     });
//   });
// });

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native'); // use original implementation, which comes with mocks out of the box

  // mock modules/components created by assigning to NativeModules
  RN.NativeModules.ReanimatedModule = {
    configureProps: jest.fn(),
    createNode: jest.fn(),
    connectNodes: jest.fn(),
    connectNodeToView: jest.fn(),
  };

  // mock modules created through UIManager
  RN.UIManager.getViewManagerConfig = name => {
    if (name === 'SomeNativeModule') {
      return {someMethod: jest.fn()};
    }
    return {};
  };
  return RN;
});

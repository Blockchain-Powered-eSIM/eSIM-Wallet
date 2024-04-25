// import {
//     NativeModules,
// } from 'react-native';

// import { getName } from '../../android/app/src/main/java/com/lpaapp/'

// jest.mock('../../android/app/src/main/java/com/lpaapp/IdentityManager/IdentityManagerModule.java', () => ({
//     getName: jest.fn(),
// }));

// describe('IdentityManagerNativeModule', () => {

//     // beforeAll(() => {
//     //     NativeModules.IdentityManager = { 
//     //         getName: jest.fn(),
//     //         getDefaultPhoneNumber: jest.fn(),
//     //     } 
//     // });

//     describe('get name', () => {
//         it('returns name of the module', async () => {
//             const moduleName = await NativeModules.IdentityManager.getName();
//             expect(moduleName).toBe('IdentityManager');
//         });
//     });
// });

// describe('Example', () => {
// 	beforeAll(async () => {
// 		await device.launchApp();
// 	});

// 	beforeEach(async () => {
// 		await device.reloadReactNative();
// 	});

// 	it('should have welcome screen', async () => {
// 		await expect(element(by.id('welcome'))).toBeVisible();
// 	});

// 	it('should show hello screen after tap', async () => {
// 		await element(by.id('hello_button')).tap();
// 		await expect(element(by.text('Hello!!!'))).toBeVisible();
// 	});

// 	it('should show world screen after tap', async () => {
// 		await element(by.id('world_button')).tap();
// 		await expect(element(by.text('World!!!'))).toBeVisible();
// 	});
// });
import { NativeModules } from "react-native";
describe('IdentityManagerModule Test', () => {
	beforeAll(async () => {
		await device.launchApp();
	});

	beforeEach(async () => {
		await device.reloadReactNative();
	});

	it('should match module name', async () => {
		const moduleName = await NativeModules.IdentityManager.getName();
		expect(moduleName).should.equal("IdentityManager");
	});
});

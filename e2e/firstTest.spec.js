describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('should have welcome message', async () => {
    await expect(element(by.text('Welcome'))).toBeVisible();
  });
});

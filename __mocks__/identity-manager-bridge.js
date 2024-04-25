import {
    NativeModules,
} from 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';

describe('IdentityManagerNativeModule', () => {
    beforeAll(() => {
        NativeModules.IdentityManager = { test: jest.fn() }
    });
});

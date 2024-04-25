package com.lpaapp.EuiccBridge;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import com.lpaapp.ECKeyManagement.ECKeyManagementModule;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ECKeyManagementPackage implements ReactPackage {
    @NonNull
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new ECKeyManagementModule(reactContext));
        return modules;
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}

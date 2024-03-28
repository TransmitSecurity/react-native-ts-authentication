package com.tsauthentication;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.module.annotations.ReactModule;
import com.transmit.authentication.TSDeviceInfoError;
import com.transmit.authentication.TSWebAuthnAuthenticationError;
import com.transmit.authentication.AuthenticationResult;
import com.transmit.authentication.RegistrationResult;
import com.transmit.authentication.TSAuthCallback;
import com.transmit.authentication.TSAuthentication;
import com.transmit.authentication.TSWebAuthnRegistrationError;
import com.transmit.authentication.network.completereg.DeviceInfo;

import java.util.HashMap;

@ReactModule(name = TsAuthenticationModule.NAME)
public class TsAuthenticationModule extends ReactContextBaseJavaModule {
  public static final String NAME = "TsAuthentication";
  ReactApplicationContext reactContext;

  public TsAuthenticationModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  @ReactMethod
  @NonNull public void initialize(String clientId, String domain, String baseUrl, Promise promise) {

    if(reactContext.getCurrentActivity() != null) {
      TSAuthentication.initialize(
        reactContext,
        clientId
      );
      promise.resolve(true);
    }
  }

  // Registration

  @ReactMethod
  @NonNull public void registerWebAuthn(
    String username,
    String displayName,
    Promise promise) {

    if(reactContext.getCurrentActivity() != null) {
      Boolean isSupported = TSAuthentication.isWebAuthnSupported();
      if (!isSupported) {
        promise.reject(new Error("Unsupported platform"));
        return;
      }

      continueRegistration(username, displayName, promise);
    }
  }

  private void continueRegistration(String username, String displayName, Promise promise) {
    if(reactContext.getCurrentActivity() != null) {
      TSAuthentication.registerWebAuthn(
        reactContext.getCurrentActivity(),
        username,
        displayName,
        new TSAuthCallback<RegistrationResult, TSWebAuthnRegistrationError>() {
          @Override
          public void success(RegistrationResult registrationResult) {
            WritableMap map = new WritableNativeMap();
            map.putString("result",registrationResult.result());
            promise.resolve(map);
          }
          @Override
          public void error(TSWebAuthnRegistrationError tsWebAuthnRegistrationError) {
            promise.reject("result", tsWebAuthnRegistrationError.getEM());
          }
        }
      );
    }
  }

  // Authentication
  @ReactMethod
  @NonNull public void authenticateWebAuthn(String username, Promise promise) {
      if(reactContext.getCurrentActivity() != null) {
        TSAuthentication.authenticateWebAuthn(
          reactContext.getCurrentActivity(),
          username,
          new TSAuthCallback<AuthenticationResult, TSWebAuthnAuthenticationError>() {
            @Override
            public void success(AuthenticationResult authenticationResult) {
              WritableMap map = new WritableNativeMap();
              map.putString("result", authenticationResult.result());
              promise.resolve(map);
            }
            @Override
            public void error(TSWebAuthnAuthenticationError tsWebAuthnAuthenticationError) {
              promise.reject("result", tsWebAuthnAuthenticationError.toString());
            }
          });
      }
    }

  // Transaction
  @ReactMethod
  @NonNull public void signTransactionWebAuthn(String username, Promise promise) {
    if(reactContext.getCurrentActivity() != null) {
      TSAuthentication.signTransactionWebAuthn(
        reactContext.getCurrentActivity(),
        username,
        new TSAuthCallback<AuthenticationResult, TSWebAuthnAuthenticationError>() {
          @Override
          public void success(AuthenticationResult authenticationResult) {
            WritableMap map = new WritableNativeMap();
            map.putString("result", authenticationResult.result());
            promise.resolve(map);
          }

          @Override
          public void error(TSWebAuthnAuthenticationError tsWebAuthnAuthenticationError) {
            promise.reject("result", tsWebAuthnAuthenticationError.toString());
          }
        }
      );
    }
  }

  @ReactMethod
  @NonNull public void getDeviceInfo(Promise promise) {
    if(reactContext.getCurrentActivity() != null) {
      TSAuthentication.getDeviceInfo(
        reactContext.getCurrentActivity(),
        new TSAuthCallback<DeviceInfo, TSDeviceInfoError>() {
          @Override
          public void success(DeviceInfo deviceInfo) {
            WritableMap map = new WritableNativeMap();
            map.putString("publicKeyId", deviceInfo.getPublicKeyId());
            map.putString("publicKey", deviceInfo.getPublicKey());
            promise.resolve(map);
          }

          @Override
          public void error(TSDeviceInfoError tsDeviceInfoError) {
            promise.reject("result", tsDeviceInfoError.toString());
          }
        }
      );
    }
  }

  @ReactMethod
  @NonNull public void isWebAuthnSupported(Promise promise) {
    promise.resolve(TSAuthentication.isWebAuthnSupported());
  }
}


package com.tsauthentication;

import static androidx.work.ListenableWorker.Result.success;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.module.annotations.ReactModule;
import com.transmit.authentication.AuthenticationError;
import com.transmit.authentication.AuthenticationResult;
import com.transmit.authentication.RegistrationResult;
import com.transmit.authentication.TSAuthCallback;
import com.transmit.authentication.TSAuthentication;

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
      TSAuthentication.init(
        reactContext,
        baseUrl,
        clientId
      );
      promise.resolve(true);
    }
  }

  // Registration

  @ReactMethod
  @NonNull public void register(
    String username,
    String displayName,
    Promise promise) {
    if(reactContext.getCurrentActivity() != null) {
      TSAuthentication.isPlatformAuthenticatorSupported(
        reactContext.getCurrentActivity(),
        new TSAuthCallback<Boolean>() {
          @Override
          public void success(Boolean aBoolean) {
            continueRegistration(username, displayName, promise);
          }

          @Override
          public void error(@NonNull AuthenticationError authenticationError) {
            promise.reject(new Error("Unsupported platform"));
          }
        }
      );
    }
  }
  private void continueRegistration(String username, String displayName, Promise promise) {
    if(reactContext.getCurrentActivity() != null) {
      TSAuthentication.register(
        reactContext.getCurrentActivity(),
        username,
        displayName,
        new TSAuthCallback<RegistrationResult>() {
          @Override
          public void success(RegistrationResult registrationResult) {
            WritableMap map = new WritableNativeMap();
            map.putString(registrationResult.result(), NAME);
            promise.resolve(map);
          }

          @Override
          public void error(@NonNull AuthenticationError authenticationError) {
            promise.reject(NAME, authenticationError.toString());
          }
        }
      );
    }
  }

  // Authentication
  @ReactMethod
  @NonNull public void authenticate(String username, Promise promise) {
      if(reactContext.getCurrentActivity() != null) {
        TSAuthentication.authenticate(
          reactContext.getCurrentActivity(),
          username,
          new TSAuthCallback<AuthenticationResult>() {
            @Override
            public void success(AuthenticationResult authenticationResult) {
              WritableMap map = new WritableNativeMap();
              map.putString(authenticationResult.result(), NAME);
              promise.resolve(map);
            }

            @Override
            public void error(@NonNull AuthenticationError authenticationError) {
              promise.reject(NAME, authenticationError.toString());
            }
          }
        );
      }
    }

  @ReactMethod
  @NonNull public void signTransaction(String username, Promise promise) {
    if(reactContext.getCurrentActivity() != null) {
      TSAuthentication.signTransaction(
        reactContext.getCurrentActivity(),
        username,
        new TSAuthCallback<AuthenticationResult>() {
          @Override
          public void success(AuthenticationResult authenticationResult) {
            WritableMap map = new WritableNativeMap();
            map.putString(authenticationResult.result(), NAME);
            promise.resolve(map);
          }

          @Override
          public void error(@NonNull AuthenticationError authenticationError) {
            promise.reject(NAME, authenticationError.toString());
          }
        }
      );
    }
  }
}


package com.tsauthentication;

import android.app.Activity;
import android.content.Context;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

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
import com.transmit.authentication.biometrics.BiometricPromptTexts;
import com.transmit.authentication.biometrics.TSBiometricsAuthError;
import com.transmit.authentication.biometrics.TSBiometricsAuthResult;
import com.transmit.authentication.biometrics.TSBiometricsRegistrationError;
import com.transmit.authentication.biometrics.TSBiometricsRegistrationResult;
import com.transmit.authentication.exceptions.TSAuthenticationInitializeException;
import com.transmit.authentication.network.completereg.DeviceInfo;

import java.util.HashMap;
import java.util.Map;

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
  @NonNull
  public void initializeSDK() {
    try {
      TSAuthentication.initializeSDK(reactContext);
    } catch (TSAuthenticationInitializeException e) {
      throw new RuntimeException(e);
    }
  }

  @ReactMethod
  @NonNull
  public void initialize(String clientId, String domain, String baseUrl, Promise promise) {

    if (reactContext.getCurrentActivity() != null) {
      if (domain.length() > 0) {
        TSAuthentication.initialize(
            reactContext,
            clientId,
            baseUrl,
            domain
        );
      } else {
        TSAuthentication.initialize(
            reactContext,
            clientId,
            baseUrl,
            null
        );
      }
      promise.resolve(true);
    }
  }

  // Registration

  @ReactMethod
  @NonNull
  public void registerWebAuthn(
      String username,
      String displayName,
      Promise promise) {

    if (reactContext.getCurrentActivity() != null) {
      Boolean isSupported = TSAuthentication.isWebAuthnSupported();
      if (!isSupported) {
        promise.reject(new Error("Unsupported platform"));
        return;
      }

      continueRegistration(username, displayName, promise);
    }
  }

  private void continueRegistration(String username, String displayName, Promise promise) {
    if (reactContext.getCurrentActivity() != null) {
      TSAuthentication.registerWebAuthn(
          reactContext.getCurrentActivity(),
          username,
          displayName,
          new TSAuthCallback<RegistrationResult, TSWebAuthnRegistrationError>() {
            @Override
            public void success(RegistrationResult registrationResult) {
              WritableMap map = new WritableNativeMap();
              map.putString("result", registrationResult.result());
              promise.resolve(map);
            }

            @Override
            public void error(TSWebAuthnRegistrationError tsWebAuthnRegistrationError) {
              promise.reject("result", tsWebAuthnRegistrationError.getErrorMessage());
            }
          });
    }
  }

  // Authentication
  @ReactMethod
  @NonNull
  public void authenticateWebAuthn(String username, Promise promise) {
    if (reactContext.getCurrentActivity() != null) {
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
  @NonNull
  public void signTransactionWebAuthn(String username, Promise promise) {
    if (reactContext.getCurrentActivity() != null) {
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
          });
    }
  }

  // Native Biometrics

  @ReactMethod
  @NonNull
  public void registerNativeBiometrics(String username, Promise promise) {
    if (reactContext.getCurrentActivity() != null) {
      TSAuthentication.registerNativeBiometrics(
          reactContext.getCurrentActivity(),
          username,
          new TSAuthCallback<TSBiometricsRegistrationResult, TSBiometricsRegistrationError>() {
            @Override
            public void success(TSBiometricsRegistrationResult tsBiometricsRegistrationResult) {
              WritableMap map = new WritableNativeMap();
              map.putString("publicKeyId", tsBiometricsRegistrationResult.keyId());
              map.putString("publicKey", tsBiometricsRegistrationResult.publicKey());
              map.putString("os", "Android");
              promise.resolve(map);
            }

            @Override
            public void error(TSBiometricsRegistrationError tsBiometricsRegistrationError) {
              promise.reject("result", tsBiometricsRegistrationError.toString());
            }
          });
    }
  }

  @ReactMethod
  @NonNull
  public void authenticateNativeBiometrics(String username, String challenge, Promise promise) {
    if (reactContext.getCurrentActivity() != null) {

      AppCompatActivity appCompatActivity = getAppCompatActivity();
      if (appCompatActivity == null) {
        promise.reject("result", "current activity is not an instance of AppCompatActivity");
        return;
      }

      Map<String, String> biometricsString = getBiometricsStrings();
      BiometricPromptTexts promptTexts = new BiometricPromptTexts(
          biometricsString.get("titleTxt"),
          biometricsString.get("subtitleTxt"),
          biometricsString.get("cancelTxt"));

      TSAuthentication.authenticateNativeBiometrics(
          appCompatActivity,
          username,
          challenge,
          promptTexts,
          new TSAuthCallback<TSBiometricsAuthResult, TSBiometricsAuthError>() {
            @Override
            public void success(TSBiometricsAuthResult tsBiometricsAuthResult) {
              WritableMap map = new WritableNativeMap();
              map.putString("publicKeyId", tsBiometricsAuthResult.keyId());
              map.putString("signature", tsBiometricsAuthResult.signature());
              promise.resolve(map);
            }

            @Override
            public void error(TSBiometricsAuthError tsBiometricsAuthError) {
              promise.reject("result", tsBiometricsAuthError.toString());
            }
          });
    }
  }

  // region Approvals

  func approvalWebAuthn(
    username: String?,
    approvalData: [String: String],
    options: [String],
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  )


  @ReactMethod
  @NonNull
  public void approvalWebAuthn(String username, ReadableMap approvalData, ReadableArray options, Promise promise) {
    if (reactContext.getCurrentActivity() != null) {



    }
  }

  // region Helpers

  @Nullable
  private AppCompatActivity getAppCompatActivity() {
    Activity activity = reactContext.getCurrentActivity();
    if (activity instanceof AppCompatActivity) {
      return (AppCompatActivity) activity;
    } else {
      return null;
    }
  }

  private Map<String, String> getBiometricsStrings() {
    Context context = reactContext;

    String titleTxt = getStringResourceByName(context, "BiometricPromptTitle", "Authenticate with Biometrics");
    String subtitleTxt = getStringResourceByName(context, "BiometricPromptSubtitle",
        "Use your device biometrics to authenticate.");
    String cancelTxt = getStringResourceByName(context, "BiometricPromptCancel", "Cancel");

    Map<String, String> biometricsStrings = new HashMap<>();
    biometricsStrings.put("titleTxt", titleTxt);
    biometricsStrings.put("subtitleTxt", subtitleTxt);
    biometricsStrings.put("cancelTxt", cancelTxt);

    return biometricsStrings;
  }

  private String getStringResourceByName(Context context, String resourceName, String defaultValue) {
    int resId = context.getResources().getIdentifier(resourceName, "string", context.getPackageName());
    return resId != 0 ? context.getString(resId) : defaultValue;
  }

  @ReactMethod
  @NonNull
  public void getDeviceInfo(Promise promise) {
    if (reactContext.getCurrentActivity() != null) {
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
          });
    }
  }

  @ReactMethod
  @NonNull
  public void isWebAuthnSupported(Promise promise) {
    promise.resolve(TSAuthentication.isWebAuthnSupported());
  }
}

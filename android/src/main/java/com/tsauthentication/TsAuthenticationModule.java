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
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.module.annotations.ReactModule;
import com.transmit.authentication.TSDeviceInfoError;
import com.transmit.authentication.TSWebAuthnApprovalError;
import com.transmit.authentication.TSWebAuthnApprovalResult;
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
import com.transmit.authentication.biometrics.TSNativeBiometricsApprovalError;
import com.transmit.authentication.biometrics.TSNativeBiometricsApprovalResult;
import com.transmit.authentication.exceptions.TSAuthenticationInitializeException;
import com.transmit.authentication.DeviceInfo;
import com.transmit.authentication.network.startauth.TSAllowCredentials;
import com.transmit.authentication.network.startauth.TSCredentialRequestOptions;
import com.transmit.authentication.network.startauth.TSWebAuthnAuthenticationData;

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
            clientId
        );
      } else {
        TSAuthentication.initialize(
            reactContext,
            clientId
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

  @ReactMethod
  @NonNull
  public void approvalWebAuthn(String username, ReadableMap approvalData, ReadableArray options, Promise promise) {
    if (reactContext.getCurrentActivity() != null) {
      Map<String, String> approvalDataMap = new HashMap<>();
      for (Map.Entry<String, Object> entry : approvalData.toHashMap().entrySet()) {
        approvalDataMap.put(entry.getKey(), entry.getValue().toString());
      }

      TSAuthentication.approvalWebAuthn(
          reactContext.getCurrentActivity(),
          username,
          approvalDataMap,
          new TSAuthCallback<TSWebAuthnApprovalResult, TSWebAuthnApprovalError>() {
            @Override
            public void success(TSWebAuthnApprovalResult result) {
              WritableMap map = new WritableNativeMap();
              map.putString("result", result.result());
              promise.resolve(map);
            }

            @Override
            public void error(TSWebAuthnApprovalError error) {
              promise.reject("result", error.toString());
            }
          });
    }
  }

  @ReactMethod
  @NonNull
  public void approvalWebAuthnWithData(
      ReadableMap rawAuthenticationData,
      ReadableArray options,
      Promise promise) {
    if (reactContext.getCurrentActivity() != null) {
      Map<String, Object> authDataMap = rawAuthenticationData.toHashMap();
      TSWebAuthnAuthenticationData authData = this.convertWebAuthnAuthenticationData(authDataMap);

      TSAuthentication.approvalWebAuthn(
          reactContext.getCurrentActivity(),
          authData,
          new TSAuthCallback<TSWebAuthnApprovalResult, TSWebAuthnApprovalError>() {
            @Override
            public void success(TSWebAuthnApprovalResult result) {
              WritableMap map = new WritableNativeMap();
              map.putString("result", result.result());
              promise.resolve(map);
            }

            @Override
            public void error(TSWebAuthnApprovalError error) {
              promise.reject("result", error.toString());
            }
          });
    }
  }

  @ReactMethod
  @NonNull
  public void approvalNativeBiometrics(
      String username,
      String challenge,
      Promise promise) {
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

      TSAuthentication.approvalNativeBiometrics(
          appCompatActivity,
          username,
          challenge,
          promptTexts,
          new TSAuthCallback<TSNativeBiometricsApprovalResult, TSNativeBiometricsApprovalError>() {
            @Override
            public void success(TSNativeBiometricsApprovalResult result) {
              WritableMap map = new WritableNativeMap();
              map.putString("publicKeyId", result.keyId());
              map.putString("signature", result.signature());
              promise.resolve(map);
            }

            @Override
            public void error(TSNativeBiometricsApprovalError error) {
              promise.reject("result", error.toString());
            }
          });
    }
  }

  // region Helpers

  private TSWebAuthnAuthenticationData convertWebAuthnAuthenticationData(
      java.util.Map<String, Object> rawData) {

    String webAuthnSessionId = (String) rawData.get("webauthnSessionId");

    TSWebAuthnAuthenticationData authData = new TSWebAuthnAuthenticationData(
        webAuthnSessionId,
        new TSCredentialRequestOptions(
            (String) rawData.get("challenge"),
            (String) rawData.get("rawChallenge"),
            (String) rawData.get("userVerification"),
            null,
            null,
            (String) rawData.get("rpId"),
            null,
            (String) rawData.get("attestation")));

    return authData;
  }

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

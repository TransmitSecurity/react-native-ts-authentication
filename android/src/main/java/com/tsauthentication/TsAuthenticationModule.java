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
import com.transmit.authentication.TSAuthenticationInitOptions;
import com.transmit.authentication.TSSignError;
import com.transmit.authentication.TSSignResult;
import com.transmit.authentication.TSWebAuthnApiPaths;
import com.transmit.authentication.TSWebAuthnRegistrationError;
import com.transmit.authentication.biometrics.BiometricPromptTexts;
import com.transmit.authentication.biometrics.TSBiometricsAuthError;
import com.transmit.authentication.biometrics.TSBiometricsAuthResult;
import com.transmit.authentication.biometrics.TSBiometricsRegistrationError;
import com.transmit.authentication.biometrics.TSBiometricsRegistrationResult;
import com.transmit.authentication.biometrics.TSBiometricsUnregistrationError;
import com.transmit.authentication.biometrics.TSBiometricsUnregistrationResult;
import com.transmit.authentication.biometrics.TSNativeBiometricsStatus;
import com.transmit.authentication.crpto.totp.ITSRegisterTOTPCallback;
import com.transmit.authentication.crpto.totp.ITSTOTPGenerateTOTPCallback;
import com.transmit.authentication.crpto.totp.TSTOTPError;
import com.transmit.authentication.crpto.totp.TSTOTPRegistrationResult;
import com.transmit.authentication.crpto.totp.TSTOTPSecurityType;
import com.transmit.authentication.biometrics.TSNativeBiometricsApprovalError;
import com.transmit.authentication.biometrics.TSNativeBiometricsApprovalResult;
import com.transmit.authentication.exceptions.TSAuthenticationInitializeException;
import com.transmit.authentication.DeviceInfo;
import com.transmit.authentication.network.startauth.TSAllowCredentials;
import com.transmit.authentication.network.startauth.TSCredentialRequestOptions;
import com.transmit.authentication.network.startauth.TSWebAuthnAuthenticationData;
import com.transmit.authentication.pincode.TSPinCodeAuthenticationError;
import com.transmit.authentication.pincode.TSPinCodeAuthenticationResult;
import com.transmit.authentication.pincode.TSPinCodeRegistrationContext;
import com.transmit.authentication.pincode.TSPinCodeRegistrationError;
import com.transmit.authentication.pincode.TSPinCodeRegistrationResult;
import com.transmit.authentication.pincode.TSPinCodeUnregistrationContext;
import com.transmit.authentication.pincode.TSPinCodeUnregistrationError;
import com.transmit.authentication.pincode.TSPinCodeUnregistrationResult;
import com.transmit.authentication.webauthn.TSWebAuthnRegistrationData;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@ReactModule(name = TsAuthenticationModule.NAME)
public class TsAuthenticationModule extends ReactContextBaseJavaModule {

  public static final String NAME = "TsAuthentication";
  private ReactApplicationContext reactContext;
  private Map<String, Object> contextStore = new HashMap<>();


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
  public void initializeSDK(@Nullable String configurationFileName, Promise promise) {
    // configurationFileName is iOS-only (a custom plist name); Android always reads strings.xml.
    try {
      TSAuthentication.initializeSDK(reactContext);
      promise.resolve(true);
    } catch (Exception e) {
      // TSAuthenticationInitializeException (missing strings.xml values); not declared in the bytecode.
      promise.reject(TsErrorMapper.INITIALIZATION_ERROR, e.getMessage(), e);
    }
  }

  @ReactMethod
  @NonNull
  public void initialize(String clientId, String domain, String baseUrl, @Nullable ReadableMap initOptions, Promise promise) {
    if (clientId == null || clientId.isEmpty() || baseUrl == null || baseUrl.isEmpty()) {
      promise.reject(TsErrorMapper.INVALID_ARGUMENT, "Invalid params provided to .initialize");
      return;
    }

    TSAuthentication.initialize(
        reactContext,
        clientId,
        baseUrl,
        domain.length() > 0 ? domain : null,
        convertInitOptions(initOptions)
    );
    promise.resolve(true);
  }

  // Registration

  @ReactMethod
  @NonNull
  public void registerWebAuthn(
      String username,
      String displayName,
      Promise promise) {
    Activity activity = requireActivity(promise);
    if (activity == null) return;

    Boolean isSupported = TSAuthentication.isWebAuthnSupported();
    if (!isSupported) {
      promise.reject(TsErrorMapper.UNSUPPORTED_OS_VERSION, "Unsupported platform");
      return;
    }

    TSAuthentication.registerWebAuthn(
        activity,
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
            TsErrorMapper.reject(promise, tsWebAuthnRegistrationError);
          }
        });
  }

  // Authentication

  @ReactMethod
  @NonNull
  public void authenticateWebAuthn(String username, @Nullable ReadableArray options, Promise promise) {
    // options (e.g. preferLocalCredantials) are iOS-only; the Android SDK takes none.
    Activity activity = requireActivity(promise);
    if (activity == null) return;

    TSAuthentication.authenticateWebAuthn(
        activity,
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
            TsErrorMapper.reject(promise, tsWebAuthnAuthenticationError);
          }
        });
  }

  // Transaction

  // Exported under the JS name; the native Android API is signTransactionWebAuthn.
  @ReactMethod
  @NonNull
  public void signWebauthnTransaction(String username, @Nullable ReadableArray options, Promise promise) {
    Activity activity = requireActivity(promise);
    if (activity == null) return;

    TSAuthentication.signTransactionWebAuthn(
        activity,
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
            TsErrorMapper.reject(promise, tsWebAuthnAuthenticationError);
          }
        });
  }

  // WebAuthn with raw data

  // The registration data is the server JSON (webauthn_session_id, credential_creation_options), as a string.
  @ReactMethod
  @NonNull
  public void registerWebAuthnWithData(String rawRegistrationData, Promise promise) {
    Activity activity = requireActivity(promise);
    if (activity == null) return;

    TSWebAuthnRegistrationData registrationData = TSWebAuthnRegistrationData.createFromJsonString(rawRegistrationData);
    if (registrationData == null) {
      promise.reject(TsErrorMapper.INVALID_ARGUMENT, "Invalid rawRegistrationData");
      return;
    }

    TSAuthentication.registerWebAuthn(
        activity,
        registrationData,
        new TSAuthCallback<RegistrationResult, TSWebAuthnRegistrationError>() {
          @Override
          public void success(RegistrationResult registrationResult) {
            WritableMap map = new WritableNativeMap();
            map.putString("result", registrationResult.result());
            promise.resolve(map);
          }

          @Override
          public void error(TSWebAuthnRegistrationError tsWebAuthnRegistrationError) {
            TsErrorMapper.reject(promise, tsWebAuthnRegistrationError);
          }
        });
  }

  @ReactMethod
  @NonNull
  public void authenticateWebAuthnWithData(ReadableMap rawAuthenticationData, @Nullable ReadableArray options, Promise promise) {
    Activity activity = requireActivity(promise);
    if (activity == null) return;

    TSWebAuthnAuthenticationData authData = convertWebAuthnAuthenticationData(rawAuthenticationData.toHashMap());
    if (authData == null) {
      promise.reject(TsErrorMapper.INVALID_ARGUMENT, "Invalid rawAuthenticationData");
      return;
    }

    TSAuthentication.authenticateWebAuthn(
        activity,
        authData,
        new TSAuthCallback<AuthenticationResult, TSWebAuthnAuthenticationError>() {
          @Override
          public void success(AuthenticationResult authenticationResult) {
            WritableMap map = new WritableNativeMap();
            map.putString("result", authenticationResult.result());
            promise.resolve(map);
          }

          @Override
          public void error(TSWebAuthnAuthenticationError tsWebAuthnAuthenticationError) {
            TsErrorMapper.reject(promise, tsWebAuthnAuthenticationError);
          }
        });
  }

  @ReactMethod
  @NonNull
  public void signWebauthnTransactionWithData(ReadableMap rawAuthenticationData, @Nullable ReadableArray options, Promise promise) {
    Activity activity = requireActivity(promise);
    if (activity == null) return;

    TSWebAuthnAuthenticationData authData = convertWebAuthnAuthenticationData(rawAuthenticationData.toHashMap());
    if (authData == null) {
      promise.reject(TsErrorMapper.INVALID_ARGUMENT, "Invalid rawAuthenticationData");
      return;
    }

    TSAuthentication.signTransactionWebAuthn(
        activity,
        authData,
        new TSAuthCallback<AuthenticationResult, TSWebAuthnAuthenticationError>() {
          @Override
          public void success(AuthenticationResult authenticationResult) {
            WritableMap map = new WritableNativeMap();
            map.putString("result", authenticationResult.result());
            promise.resolve(map);
          }

          @Override
          public void error(TSWebAuthnAuthenticationError tsWebAuthnAuthenticationError) {
            TsErrorMapper.reject(promise, tsWebAuthnAuthenticationError);
          }
        });
  }

  // Native Biometrics

  @ReactMethod
  @NonNull
  public void registerNativeBiometrics(String username, Promise promise) {
    Activity activity = requireActivity(promise);
    if (activity == null) return;

    TSAuthentication.registerNativeBiometrics(
        activity,
        username,
        new TSAuthCallback<TSBiometricsRegistrationResult, TSBiometricsRegistrationError>() {
          @Override
          public void success(TSBiometricsRegistrationResult tsBiometricsRegistrationResult) {
            WritableMap map = new WritableNativeMap();
            map.putString("publicKeyId", tsBiometricsRegistrationResult.keyId());
            map.putString("publicKey", tsBiometricsRegistrationResult.publicKey());
            map.putString("os", "Android");
            map.putString("keyType", tsBiometricsRegistrationResult.keyType());
            promise.resolve(map);
          }

          @Override
          public void error(TSBiometricsRegistrationError tsBiometricsRegistrationError) {
            TsErrorMapper.reject(promise, tsBiometricsRegistrationError);
          }
        });
  }

  @ReactMethod
  @NonNull
  public void authenticateNativeBiometrics(String username, String challenge, Promise promise) {
    AppCompatActivity appCompatActivity = requireAppCompatActivity(promise);
    if (appCompatActivity == null) return;

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
            TsErrorMapper.reject(promise, tsBiometricsAuthError);
          }
        });
  }

  @ReactMethod
  @NonNull
  public void unregisterNativeBiometrics(String username, Promise promise) {
    try {
      TSAuthentication.unregisterNativeBiometrics(
          reactContext,
          username,
          new TSAuthCallback<TSBiometricsUnregistrationResult, TSBiometricsUnregistrationError>() {
            @Override
            public void success(TSBiometricsUnregistrationResult result) {
              WritableMap map = new WritableNativeMap();
              map.putString("publicKeyId", result.keyId());
              promise.resolve(map);
            }

            @Override
            public void error(TSBiometricsUnregistrationError error) {
              TsErrorMapper.reject(promise, error);
            }
          });
    } catch (Exception e) {
      // The SDK throws instead of calling back when it is not initialized.
      promise.reject(TsErrorMapper.NOT_INITIALIZED, e.getMessage(), e);
    }
  }

  // "Enrolled" mirrors iOS isNativeBiometricsEnrolled: biometrics are set up on the device,
  // even if they cannot be used right now (e.g. hardware temporarily unavailable).
  @ReactMethod
  @NonNull
  public void isNativeBiometricsEnrolled(Promise promise) {
    try {
      TSNativeBiometricsStatus status = TSAuthentication.getNativeBiometricsStatus(reactContext);
      promise.resolve(status != TSNativeBiometricsStatus.NonEnrolled);
    } catch (Exception e) {
      promise.reject(TsErrorMapper.NOT_INITIALIZED, e.getMessage(), e);
    }
  }

  @ReactMethod
  @NonNull
  public void getNativeBiometricsStatus(Promise promise) {
    try {
      promise.resolve(convertBiometricsStatus(TSAuthentication.getNativeBiometricsStatus(reactContext)));
    } catch (Exception e) {
      promise.reject(TsErrorMapper.NOT_INITIALIZED, e.getMessage(), e);
    }
  }

  // The Android SDK does not report the biometric modality.
  @ReactMethod
  @NonNull
  public void getNativeBiometricsType(Promise promise) {
    promise.resolve(null);
  }

  // region Approvals

  @ReactMethod
  @NonNull
  public void approvalWebAuthn(String username, ReadableMap approvalData, ReadableArray options, Promise promise) {
    Activity activity = requireActivity(promise);
    if (activity == null) return;

    Map<String, String> approvalDataMap = new HashMap<>();
    for (Map.Entry<String, Object> entry : approvalData.toHashMap().entrySet()) {
      approvalDataMap.put(entry.getKey(), entry.getValue().toString());
    }

    TSAuthentication.approvalWebAuthn(
        activity,
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
            TsErrorMapper.reject(promise, error);
          }
        });
  }

  @ReactMethod
  @NonNull
  public void approvalWebAuthnWithData(
      ReadableMap rawAuthenticationData,
      ReadableArray options,
      Promise promise) {
    Activity activity = requireActivity(promise);
    if (activity == null) return;

    Map<String, Object> authDataMap = rawAuthenticationData.toHashMap();

    if (authDataMap == null || authDataMap.isEmpty()) {
      promise.reject(TsErrorMapper.INVALID_ARGUMENT, "Invalid authentication data");
      return;
    }

    TSWebAuthnAuthenticationData authData = this.convertWebAuthnAuthenticationData(authDataMap);

    if (authData == null) {
      promise.reject(TsErrorMapper.INVALID_ARGUMENT, "Error converting authentication data.");
      return;
    }

    TSAuthentication.approvalWebAuthn(
        activity,
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
            TsErrorMapper.reject(promise, error);
          }
        });
  }

  @ReactMethod
  @NonNull
  public void approvalNativeBiometrics(
      String username,
      String challenge,
      Promise promise) {
    AppCompatActivity appCompatActivity = requireAppCompatActivity(promise);
    if (appCompatActivity == null) return;

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
            TsErrorMapper.reject(promise, error);
          }
        });
  }

  // region PIN Authenticator

  @ReactMethod
  @NonNull
  public void registerPinCode(String username, String pinCode, Promise promise) {
    TSAuthentication.registerPinCode(
      username,
      pinCode,
      new TSAuthCallback<TSPinCodeRegistrationResult, TSPinCodeRegistrationError>() {
          @Override
          public void success(TSPinCodeRegistrationResult result) {
            TSPinCodeRegistrationContext context = result.registrationContext();
            String contextIdentifier = generateContextIdentifier();
            storeContextWithIdentifier(contextIdentifier, context);

            WritableMap map = new WritableNativeMap();
            map.putString("publicKeyId", result.keyId());
            map.putString("publicKey", result.publicKey());
            map.putString("keyType", result.keyType());
            map.putString("contextIdentifier", contextIdentifier);

            promise.resolve(map);
          }

          @Override
          public void error(TSPinCodeRegistrationError error) {
            TsErrorMapper.reject(promise, error);
          }
        });
  }

  @ReactMethod
  @NonNull
  public void commitPinRegistration(String contextIdentifier, Promise promise) {
    TSPinCodeRegistrationContext context =
      (TSPinCodeRegistrationContext) getContextWithIdentifier(contextIdentifier);

    if (context == null) {
      promise.reject(TsErrorMapper.INVALID_ARGUMENT, "PIN Registration Context not found for the context identifier provided");
    } else {
      removeContextWithIdentifier(contextIdentifier);
      context.commit();
      promise.resolve(true);
    }
  }

  @ReactMethod
  @NonNull
  public void unregisterPinCode(String username, Promise promise) {
    TSAuthentication.unregisterPinCode(
      username,
      new TSAuthCallback<TSPinCodeUnregistrationResult, TSPinCodeUnregistrationError>() {
          @Override
          public void success(TSPinCodeUnregistrationResult result) {
            String contextIdentifier = generateContextIdentifier();
            storeContextWithIdentifier(contextIdentifier, result.unregistrationContext());

            WritableMap map = new WritableNativeMap();
            map.putString("publicKeyId", result.keyId());
            map.putString("contextIdentifier", contextIdentifier);
            promise.resolve(map);
          }

          @Override
          public void error(TSPinCodeUnregistrationError error) {
            TsErrorMapper.reject(promise, error);
          }
        });
  }

  @ReactMethod
  @NonNull
  public void commitPinUnregistration(String contextIdentifier, Promise promise) {
    Object context = getContextWithIdentifier(contextIdentifier);

    if (!(context instanceof TSPinCodeUnregistrationContext)) {
      promise.reject(TsErrorMapper.INVALID_ARGUMENT, "PIN Unregistration Context not found for the context identifier provided");
    } else {
      removeContextWithIdentifier(contextIdentifier);
      ((TSPinCodeUnregistrationContext) context).commit();
      promise.resolve(true);
    }
  }

  @ReactMethod
  @NonNull
  public void authenticatePinCode(String username, String pinCode, String challenge, Promise promise) {
    TSAuthentication.authenticatePinCode(username, pinCode, challenge, new TSAuthCallback<TSPinCodeAuthenticationResult, TSPinCodeAuthenticationError>() {
      @Override
      public void success(TSPinCodeAuthenticationResult result) {
        WritableMap map = new WritableNativeMap();
        map.putString("publicKeyId", result.keyId());
        map.putString("signature", result.signature());
        map.putString("challenge", result.challenge());

        promise.resolve(map);
      }

      @Override
      public void error(TSPinCodeAuthenticationError error) {
        TsErrorMapper.reject(promise, error);
      }
    });
  }

  // region Device key, logging

  @ReactMethod
  @NonNull
  public void signWithDeviceKey(String challenge, Promise promise) {
    TSAuthentication.signWithDeviceKey(
        reactContext,
        challenge,
        new TSAuthCallback<TSSignResult, TSSignError>() {
          @Override
          public void success(TSSignResult result) {
            WritableMap map = new WritableNativeMap();
            map.putString("signature", result.getSignedData());
            promise.resolve(map);
          }

          @Override
          public void error(TSSignError error) {
            TsErrorMapper.reject(promise, error);
          }
        });
  }

  @ReactMethod
  @NonNull
  public void setLoggingEnabled(boolean enabled, Promise promise) {
    TSAuthentication.setLoggingEnabled(enabled);
    promise.resolve(null);
  }

  // region TOTP

  // TOTP security types other than "none" show a biometric or device credential prompt, which
  // needs the foreground activity; "none" works without one.
  @ReactMethod
  @NonNull
  public void registerTOTP(String uri, String securityType, Promise promise) {
    TSTOTPSecurityType totpSecurityType = convertTOTPSecurityType(securityType);
    if (totpSecurityType == null) {
      promise.reject(TsErrorMapper.INVALID_ARGUMENT, "Invalid TOTP security type: " + securityType);
      return;
    }

    TSAuthentication.registerTOTP(totpContext(), uri, totpSecurityType, new ITSRegisterTOTPCallback() {
      @Override
      public void onSuccess(@NonNull TSTOTPRegistrationResult registrationResult) {
        WritableMap map = new WritableNativeMap();
        map.putString("uuid", registrationResult.getUuid());
        map.putString("issuer", registrationResult.getIssuer());
        map.putString("label", registrationResult.getLabel());
        promise.resolve(map);
      }

      @Override
      public void onFailed(@NonNull TSTOTPError error) {
        TsErrorMapper.reject(promise, error);
      }
    });
  }

  @ReactMethod
  @NonNull
  public void generateTOTPCode(String uuid, Promise promise) {
    TSAuthentication.generateTOTP(totpContext(), uuid, totpCodeCallback(promise));
  }

  @ReactMethod
  @NonNull
  public void generateTOTPCodeWithChallenge(String uuid, String challenge, Promise promise) {
    TSAuthentication.generateTOTPWithChallenge(totpContext(), uuid, challenge, totpCodeCallback(promise));
  }

  private ITSTOTPGenerateTOTPCallback totpCodeCallback(Promise promise) {
    return new ITSTOTPGenerateTOTPCallback() {
      @Override
      public void onSuccess(@NonNull String totpCode) {
        WritableMap map = new WritableNativeMap();
        map.putString("code", totpCode);
        promise.resolve(map);
      }

      @Override
      public void onFailed(@NonNull TSTOTPError error) {
        TsErrorMapper.reject(promise, error);
      }
    };
  }

  private Context totpContext() {
    Activity activity = reactContext.getCurrentActivity();
    return activity != null ? activity : reactContext;
  }

  @Nullable
  private TSTOTPSecurityType convertTOTPSecurityType(String rawType) {
    switch (rawType) {
      case "none": return TSTOTPSecurityType.None;
      case "biometric": return TSTOTPSecurityType.Biometric;
      case "devicePin": return TSTOTPSecurityType.DevicePin;
      case "devicePinOrBiometric": return TSTOTPSecurityType.DevicePinOrBiometric;
      default: return null;
    }
  }

  // region Context Store

  private String generateContextIdentifier() {
    return UUID.randomUUID().toString();
  }

  private void storeContextWithIdentifier(String identifier, Object context) {
    contextStore.put(identifier, context);
  }

  private void removeContextWithIdentifier(String identifier) {
    contextStore.remove(identifier);
  }

  private Object getContextWithIdentifier(String identifier) {
    return contextStore.get(identifier);
  }

  // region Helpers

  private TSWebAuthnAuthenticationData convertWebAuthnAuthenticationData(
    java.util.Map<String, Object> rawData) {

    String webAuthnSessionId = (String) rawData.get("webauthnSessionId");
    if (webAuthnSessionId == null || webAuthnSessionId.isEmpty()) {
      return null;
    }

    @SuppressWarnings("unchecked")
    java.util.Map<String, Object> rawCredentialRequestOptions =
      (java.util.Map<String, Object>) rawData.get("credentialRequestOptions");
    if (rawCredentialRequestOptions == null) {
      return null;
    }

    String challenge = (String) rawCredentialRequestOptions.get("challenge");
    String rawChallenge = (String) rawCredentialRequestOptions.get("rawChallenge");
    String userVerification = (String) rawCredentialRequestOptions.get("userVerification");

    Object allowCredentialObj = rawCredentialRequestOptions.get("allowCredentials");
    TSAllowCredentials[] allowCredentials = null;
    if (allowCredentialObj instanceof List) {
      List<?> allowCredentialsList = (List<?>) allowCredentialObj;
      allowCredentials = this.convertAllowCredentials(allowCredentialsList);
    }

    String rpId = (String) rawCredentialRequestOptions.get("rpId");
    Double timeout = (Double) rawCredentialRequestOptions.get("timeout");

    String attestation = (String) rawCredentialRequestOptions.get("attestation");

    Object transportsObj = rawCredentialRequestOptions.get("transports");
    JSONObject transportsJson = null;
    try {
      if (transportsObj instanceof List) {
        List<?> transportsList = (List<?>) transportsObj;
        JSONArray transportsArray = new JSONArray();
        for (Object t : transportsList) {
          if (t instanceof String) {
            transportsArray.put(t);
          }
        }
        transportsJson = new JSONObject();
        transportsJson.put("transports", transportsArray);
      }
    } catch (Exception e) {
      transportsJson = null;
    }

    TSCredentialRequestOptions credentialRequestOptions = new TSCredentialRequestOptions(
      challenge != null ? challenge : "",
      rawChallenge,
      userVerification,
      transportsJson,
      allowCredentials,
      rpId,
      timeout,
      attestation
    );

    TSWebAuthnAuthenticationData authData = new TSWebAuthnAuthenticationData(
      webAuthnSessionId,
      credentialRequestOptions
    );

    return authData;
  }

  @Nullable
  private TSAuthenticationInitOptions convertInitOptions(@Nullable ReadableMap rawOptions) {
    if (rawOptions == null || !rawOptions.hasKey("webAuthnApiPaths") || rawOptions.isNull("webAuthnApiPaths")) {
      return null;
    }
    ReadableMap paths = rawOptions.getMap("webAuthnApiPaths");
    if (paths == null || !paths.hasKey("startRegistration") || !paths.hasKey("startAuthentication")) {
      return null;
    }
    return new TSAuthenticationInitOptions(
        new TSWebAuthnApiPaths(paths.getString("startRegistration"), paths.getString("startAuthentication")));
  }

  // Shared with iOS (TSBiometricStatus) where the values overlap; the rest are Android-only.
  private String convertBiometricsStatus(TSNativeBiometricsStatus status) {
    switch (status) {
      case CanAuthenticate: return "available";
      case NonEnrolled: return "notEnrolled";
      case HardwareNotAvailable: return "notAvailable";
      case NoHarddware: return "noHardware";
      case SecurityUpdateRequired: return "securityUpdateRequired";
      case Unsupported: return "unsupported";
      default: return "unknown";
    }
  }

  @SuppressWarnings("unchecked")
  private TSAllowCredentials[] convertAllowCredentials(List<?> allowCredentialsArray) {
    List<TSAllowCredentials> result = new ArrayList<>();
    for (Object item : allowCredentialsArray) {
      if (item instanceof Map) {
        Map<String, Object> rawAllowCredential = (Map<String, Object>) item;
        String[] transports = null;
        Object transportsObj = rawAllowCredential.get("transports");
        if (transportsObj instanceof List) {
          List<?> transportsList = (List<?>) transportsObj;
          transports = transportsList.stream()
            .filter(String.class::isInstance)
            .map(String.class::cast)
            .toArray(String[]::new);
        }
        TSAllowCredentials data = new TSAllowCredentials(
          (String) rawAllowCredential.get("type"),
          (String) rawAllowCredential.get("id"),
          transports
        );
        result.add(data);
      }
    }
    return result.toArray(new TSAllowCredentials[0]);
  }

  @Nullable
  private Activity requireActivity(Promise promise) {
    Activity activity = reactContext.getCurrentActivity();
    if (activity == null) {
      rejectNoActivity(promise);
    }
    return activity;
  }

  private void rejectNoActivity(Promise promise) {
    promise.reject(TsErrorMapper.ACTIVITY_NOT_AVAILABLE, "This operation requires an Activity in the foreground");
  }

  @Nullable
  private AppCompatActivity requireAppCompatActivity(Promise promise) {
    Activity activity = requireActivity(promise);
    if (activity == null) return null;

    if (!(activity instanceof AppCompatActivity)) {
      promise.reject(TsErrorMapper.INVALID_ARGUMENT, "current activity is not an instance of AppCompatActivity");
      return null;
    }
    return (AppCompatActivity) activity;
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
    Activity activity = requireActivity(promise);
    if (activity == null) return;
    TSAuthentication.getDeviceInfo(
        activity,
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
            TsErrorMapper.reject(promise, tsDeviceInfoError);
          }
        });
  }

  @ReactMethod
  @NonNull
  public void isWebAuthnSupported(Promise promise) {
    promise.resolve(TSAuthentication.isWebAuthnSupported());
  }
}

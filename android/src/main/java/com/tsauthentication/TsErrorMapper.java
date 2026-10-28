package com.tsauthentication;

import com.facebook.react.bridge.Promise;
import com.transmit.authentication.pincode.TSPinCodeAuthenticationError;
import com.transmit.authentication.pincode.TSPinCodeRegistrationError;
import com.transmit.authentication.pincode.TSPinCodeUnregistrationError;
import com.transmit.authentication.crpto.totp.TSTOTPError;

import java.util.HashMap;
import java.util.Map;

class TsErrorMapper {

  static final String INVALID_ARGUMENT = "invalidArgument";
  static final String UNSUPPORTED_OS_VERSION = "unsupportedOSVersion";
  static final String INITIALIZATION_ERROR = "initializationError";
  static final String NOT_INITIALIZED = "notInitialized";
  static final String ACTIVITY_NOT_AVAILABLE = "activityNotAvailable";

  private static final String UNKNOWN = "unknown";
  private static final Map<String, String> CODES = new HashMap<>();

  static {
    CODES.put("UserCancelled", "userCanceled");
    CODES.put("UserCanceled", "userCanceled");
    CODES.put("Canceled", "userCanceled");
    CODES.put("NegativeButton", "userCanceled");

    CODES.put("UserNotFound", "credentialNotAvailable");
    CODES.put("NoCredentials", "credentialNotAvailable");
    CODES.put("NoRegisteredCredentials", "credentialNotAvailable");

    CODES.put("NoMatch", "authenticationFailed");
    CODES.put("UnableToProcess", "authenticationFailed");
    CODES.put("TimeOut", "authenticationFailed");

    CODES.put("GeneralPasskeyError", "webAuthnFailed");
    CODES.put("ClientNotFound", "webAuthnFailed");
    CODES.put("CredentialUnsupported", "webAuthnFailed");
    CODES.put("CustomCredentialsNotSupported", "webAuthnFailed");
    CODES.put("PasswordCredentialsNotSupported", "webAuthnFailed");
    CODES.put("UnexpectedTypeOfCredential", "webAuthnFailed");
    CODES.put("InterruptedError", "webAuthnFailed");
    CODES.put("CreateCredentialsInterrupted", "webAuthnFailed");
    CODES.put("ProviderConfigurationError", "webAuthnFailed");

    CODES.put("RequestCannotBeValidated", "invalidWebAuthnSession");
    CODES.put("InvalidDomain", "invalidDomain");
    CODES.put("NetworkError", "networkError");
    CODES.put("SDKNotInitialized", "notInitialized");
    CODES.put("Unsupported", UNSUPPORTED_OS_VERSION);

    CODES.put("RegistrationUsernameMismatch", INVALID_ARGUMENT);
    CODES.put("UserIdMismatch", INVALID_ARGUMENT);

    CODES.put("BiometricErrorHWUnavailable", "biometricsNotAvailable");
    CODES.put("BiometricErrorNoHardware", "biometricsNotAvailable");
    CODES.put("BiometricErrorUnsupported", "biometricsNotAvailable");
    CODES.put("BiometricErrorSecurityUpdateRequired", "biometricsNotAvailable");
    CODES.put("BiometricErrorStatusUnknown", "biometricsNotAvailable");
    CODES.put("BiometricErrorNonEnrolled", "biometricsNotEnrolled");
    CODES.put("NOT_REGISTERED", "biometricsNotRegistered");
    CODES.put("NotRegistered", "biometricsNotRegistered");
    CODES.put("NoRegisteredDeviceBiometricsAuthenticatorFound", "biometricsNotRegistered");
    CODES.put("Lockout", "biometricsLockedOut");
    CODES.put("LockoutPermanent", "biometricsLockedOut");
  }

  static void reject(Promise promise, Object error) {
    String name = error.getClass().getSimpleName();
    promise.reject(code(error, name), name);
  }

  private static String code(Object error, String name) {
    if (error instanceof TSPinCodeAuthenticationError
        || error instanceof TSPinCodeRegistrationError
        || error instanceof TSPinCodeUnregistrationError) {
      return "NotRegistered".equals(name) ? "pinCodeNotRegistered" : UNKNOWN;
    }
    // iOS reports every TOTP failure as totpError, so Android does the same.
    if (error instanceof TSTOTPError) {
      return "SDKNotInitialized".equals(name) ? "notInitialized" : "totpError";
    }
    String code = CODES.get(name);
    return code != null ? code : UNKNOWN;
  }
}

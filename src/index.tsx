import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-ts-authentication' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const TsAuthentication = NativeModules.TsAuthentication
  ? NativeModules.TsAuthentication
  : new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );


export namespace TSAuthenticationSDK {

  export interface TSRegistrationResult {
    result: string;
  }

  export interface TSAuthenticationResult {
    result: string;
  }

  export interface TSBiometricsRegistrationResult {
    publicKey: string;
    publicKeyId: string;
    os: string;
    keyType: string;
  }

  export interface TSPinCodeRegistrationCompletion {
    publicKeyId: string;
    publicKey: string;
    keyType: string;
    contextIdentifier: string;
  }

  export interface TSPinCodeAuthenticationCompletion {
    publicKeyId: string;
    signature: string;
    challenge: string;
  }

  export interface TSBiometricsAuthenticationResult {
    publicKeyId: string;
    signature: string;
  }

  export interface DeviceInfo {
    publicKeyId: string;
    publicKey: string;
  }

  export interface WebAuthnApiPaths {
    startRegistration: string;
    startAuthentication: string;
  }

  export interface InitOptions {
    webAuthnApiPaths?: WebAuthnApiPaths | null;
  }

  export interface TSSignResult {
    signature: string;
  }

  export interface TSBiometricsUnregistrationResult {
    publicKeyId: string;
  }

  export interface TSPinCodeUnregistrationCompletion {
    publicKeyId: string;
    contextIdentifier: string;
  }

  /**
   * `available`, `notEnrolled` and `notAvailable` are reported on both platforms.
   * iOS only: `permissionDenied`, `lockedOut`.
   * Android only: `noHardware`, `securityUpdateRequired`, `unsupported`.
   */
  export type NativeBiometricsStatus =
    | 'available'
    | 'notEnrolled'
    | 'notAvailable'
    | 'permissionDenied'
    | 'lockedOut'
    | 'noHardware'
    | 'securityUpdateRequired'
    | 'unsupported'
    | 'unknown';

  export type NativeBiometricsType = 'faceID' | 'touchID' | 'opticID' | 'none';

  export type TOTPSecurityType = 'none' | 'biometric' | 'devicePin' | 'devicePinOrBiometric';

  export interface TSTOTPRegistrationResult {
    uuid: string;
    issuer: string | null;
    label: string | null;
  }

  export interface TSTOTPCodeResult {
    code: string;
  }

  export type TSAuthenticationErrorCode =
    | 'userCanceled'
    | 'credentialNotAvailable'
    | 'authenticationFailed'
    | 'webAuthnFailed'
    | 'invalidWebAuthnSession'
    | 'invalidDomain'
    | 'networkError'
    | 'notInitialized'
    | 'unsupportedOSVersion'
    | 'requestIsRunning'
    | 'initializationError'
    | 'biometricsNotAvailable'
    | 'biometricsNotEnrolled'
    | 'biometricsNotRegistered'
    | 'biometricsLockedOut'
    | 'biometricsPermissionDenied'
    | 'pinCodeNotRegistered'
    | 'pinCodeDuplicateCommit'
    | 'totpError'
    | 'invalidArgument'
    | 'activityNotAvailable'
    | 'unknown';

  export interface TSAuthenticationError {
    code: TSAuthenticationErrorCode;
    message: string;
    userInfo?: {
      code: TSAuthenticationErrorCode;
      asAuthorizationErrorCode?: number;
      httpStatusCode?: number;
      serverMessage?: string;
    };
  }

  export interface ApprovalResults {
    result: string;
  }

  export interface UserData {
    id: string | null;
    name: string | null;
    displayName: string | null;
  }

  export interface AllowCredentials {
    id: string;
    name: string | null | undefined;
    displayName: string | null | undefined;
    type: string | null | undefined;
    transports?: object | null | undefined;
  }

  export interface WebAuthnAuthenticationCredentialRequestOptions {
    challenge: string;
    rawChallenge?: string | null | undefined;
    allowCredentials: AllowCredentials[] | null;
    userVerification: string | null;
    transports?: string[] | null | undefined;
    rpId: string | null;
    userData: UserData;
    attestation?: string | null | undefined;
  }

  export const enum WebAuthnAuthenticationOptions {
    preferLocalCredantials = "preferLocalCredantials"
  }

  export interface TSWebAuthnUserData {
    id: string | null;
    name: string | null;
    displayName: string | null;
  }

  export interface WebAuthnAuthenticationData {
    webauthnSessionId: string;
    credentialRequestOptions: WebAuthnAuthenticationCredentialRequestOptions;
  }
}

export interface TSAuthenticationSDKModule {
  /** `configurationFileName` (iOS only) names a plist other than TransmitSecurity.plist. Android always reads strings.xml. */
  initializeSDK: (configurationFileName?: string | null) => Promise<boolean>;
  initialize: (
    clientId: string,
    domain?: string | null | undefined,
    baseUrl?: string | null | undefined,
    initOptions?: TSAuthenticationSDK.InitOptions | null
  ) => Promise<boolean>;
  setLoggingEnabled: (enabled: boolean) => Promise<void>;
  registerWebAuthn: (username: string, displayName: string) => Promise<TSAuthenticationSDK.TSRegistrationResult>;
  /** `rawRegistrationData` is the registration data as returned by the server (`webauthn_session_id`, `credential_creation_options`). */
  registerWebAuthnWithData: (rawRegistrationData: { [key: string]: any }) => Promise<TSAuthenticationSDK.TSRegistrationResult>;
  /** `options` are applied on iOS only. */
  authenticateWebAuthn: (
    username: string,
    options?: TSAuthenticationSDK.WebAuthnAuthenticationOptions[]
  ) => Promise<TSAuthenticationSDK.TSAuthenticationResult>;
  authenticateWebAuthnWithData: (
    rawAuthenticationData: TSAuthenticationSDK.WebAuthnAuthenticationData,
    options?: TSAuthenticationSDK.WebAuthnAuthenticationOptions[]
  ) => Promise<TSAuthenticationSDK.TSAuthenticationResult>;
  /**
   * Signs a transaction for the user with WebAuthn. To approve a transaction with approval data
   * (amount, payee, ...), use `approvalWebAuthn`. `options` are applied on iOS only.
   */
  signWebauthnTransaction: (
    username: string,
    options?: TSAuthenticationSDK.WebAuthnAuthenticationOptions[]
  ) => Promise<TSAuthenticationSDK.TSAuthenticationResult>;
  signWebauthnTransactionWithData: (
    rawAuthenticationData: TSAuthenticationSDK.WebAuthnAuthenticationData,
    options?: TSAuthenticationSDK.WebAuthnAuthenticationOptions[]
  ) => Promise<TSAuthenticationSDK.TSAuthenticationResult>;
  registerNativeBiometrics: (username: string) => Promise<TSAuthenticationSDK.TSBiometricsRegistrationResult>;
  authenticateNativeBiometrics: (username: string, challenge: string) => Promise<TSAuthenticationSDK.TSBiometricsAuthenticationResult>;
  unregisterNativeBiometrics: (username: string) => Promise<TSAuthenticationSDK.TSBiometricsUnregistrationResult>;
  /** True when biometrics are set up on the device, even if they cannot be used right now. */
  isNativeBiometricsEnrolled: () => Promise<boolean>;
  getNativeBiometricsStatus: () => Promise<TSAuthenticationSDK.NativeBiometricsStatus>;
  /** Resolves `null` on Android, which does not report the biometric modality. */
  getNativeBiometricsType: () => Promise<TSAuthenticationSDK.NativeBiometricsType | null>;
  approvalWebAuthn: (
    username: string | null,
    approvalData: { [key: string]: string },
    options: TSAuthenticationSDK.WebAuthnAuthenticationOptions[]
  ) => Promise<TSAuthenticationSDK.ApprovalResults>;

  approvalWebAuthnWithData: (
    rawAuthenticationData: TSAuthenticationSDK.WebAuthnAuthenticationData,
    options: TSAuthenticationSDK.WebAuthnAuthenticationOptions[]
  ) => Promise<TSAuthenticationSDK.ApprovalResults>;

  approvalNativeBiometrics: (
    username: string,
    challenge: string
  ) => Promise<TSAuthenticationSDK.TSBiometricsAuthenticationResult>;

  registerPinCode: (username: string, pinCode: string) => Promise<TSAuthenticationSDK.TSPinCodeRegistrationCompletion>;
  commitPinRegistration: (contextIdentifier: string) => Promise<void>;
  authenticatePinCode(username: string, pinCode: string, challenge: string): Promise<TSAuthenticationSDK.TSPinCodeAuthenticationCompletion>;
  /** The PIN code stays registered until `commitPinUnregistration` is called with the returned `contextIdentifier`. */
  unregisterPinCode: (username: string) => Promise<TSAuthenticationSDK.TSPinCodeUnregistrationCompletion>;
  commitPinUnregistration: (contextIdentifier: string) => Promise<void>;

  /** Security types other than `none` prompt for biometrics or the device passcode when generating codes. */
  registerTOTP: (uri: string, securityType?: TSAuthenticationSDK.TOTPSecurityType) => Promise<TSAuthenticationSDK.TSTOTPRegistrationResult>;
  generateTOTPCode: (uuid: string) => Promise<TSAuthenticationSDK.TSTOTPCodeResult>;
  generateTOTPCodeWithChallenge: (uuid: string, challenge: string) => Promise<TSAuthenticationSDK.TSTOTPCodeResult>;

  signWithDeviceKey: (challenge: string) => Promise<TSAuthenticationSDK.TSSignResult>;
  getDeviceInfo: () => Promise<TSAuthenticationSDK.DeviceInfo>;
  isWebAuthnSupported: () => Promise<boolean>;
}

class AuthenticationSDK implements TSAuthenticationSDKModule {

  initializeSDK(configurationFileName?: string | null): Promise<boolean> {
    return TsAuthentication.initializeSDK(configurationFileName ?? null);
  }

  initialize(
    clientId: string,
    domain?: string | null | undefined,
    baseUrl?: string | null | undefined,
    initOptions?: TSAuthenticationSDK.InitOptions | null
  ): Promise<boolean> {
    const isDomain = domain ? domain : "";
    const isBaseUrl = baseUrl ? baseUrl : "https://api.transmitsecurity.io/";
    return TsAuthentication.initialize(clientId, isDomain, isBaseUrl, initOptions ?? null);
  }

  setLoggingEnabled(enabled: boolean): Promise<void> {
    return TsAuthentication.setLoggingEnabled(enabled);
  }

  registerWebAuthn(username: string, displayName: string): Promise<TSAuthenticationSDK.TSRegistrationResult> {
    return TsAuthentication.registerWebAuthn(username, displayName);
  }

  registerWebAuthnWithData(rawRegistrationData: { [key: string]: any }): Promise<TSAuthenticationSDK.TSRegistrationResult> {
    return TsAuthentication.registerWebAuthnWithData(JSON.stringify(rawRegistrationData));
  }

  authenticateWebAuthn(
    username: string,
    options: TSAuthenticationSDK.WebAuthnAuthenticationOptions[] = []
  ): Promise<TSAuthenticationSDK.TSAuthenticationResult> {
    return TsAuthentication.authenticateWebAuthn(username, options);
  }

  authenticateWebAuthnWithData(
    rawAuthenticationData: TSAuthenticationSDK.WebAuthnAuthenticationData,
    options: TSAuthenticationSDK.WebAuthnAuthenticationOptions[] = []
  ): Promise<TSAuthenticationSDK.TSAuthenticationResult> {
    return TsAuthentication.authenticateWebAuthnWithData(rawAuthenticationData, options);
  }

  signWebauthnTransaction(
    username: string,
    options: TSAuthenticationSDK.WebAuthnAuthenticationOptions[] = []
  ): Promise<TSAuthenticationSDK.TSAuthenticationResult> {
    return TsAuthentication.signWebauthnTransaction(username, options);
  }

  signWebauthnTransactionWithData(
    rawAuthenticationData: TSAuthenticationSDK.WebAuthnAuthenticationData,
    options: TSAuthenticationSDK.WebAuthnAuthenticationOptions[] = []
  ): Promise<TSAuthenticationSDK.TSAuthenticationResult> {
    return TsAuthentication.signWebauthnTransactionWithData(rawAuthenticationData, options);
  }

  registerNativeBiometrics(username: string): Promise<TSAuthenticationSDK.TSBiometricsRegistrationResult> {
    return TsAuthentication.registerNativeBiometrics(username);
  }

  authenticateNativeBiometrics(username: string, challenge: string): Promise<TSAuthenticationSDK.TSBiometricsAuthenticationResult> {
    return TsAuthentication.authenticateNativeBiometrics(username, challenge);
  }

  unregisterNativeBiometrics(username: string): Promise<TSAuthenticationSDK.TSBiometricsUnregistrationResult> {
    return TsAuthentication.unregisterNativeBiometrics(username);
  }

  isNativeBiometricsEnrolled(): Promise<boolean> {
    return TsAuthentication.isNativeBiometricsEnrolled();
  }

  getNativeBiometricsStatus(): Promise<TSAuthenticationSDK.NativeBiometricsStatus> {
    return TsAuthentication.getNativeBiometricsStatus();
  }

  getNativeBiometricsType(): Promise<TSAuthenticationSDK.NativeBiometricsType | null> {
    return TsAuthentication.getNativeBiometricsType();
  }

  approvalWebAuthn(
    username: string | null,
    approvalData: { [key: string]: string },
    options: TSAuthenticationSDK.WebAuthnAuthenticationOptions[]): Promise<TSAuthenticationSDK.ApprovalResults> {
    return TsAuthentication.approvalWebAuthn(username, approvalData, options);
  }

  approvalWebAuthnWithData(
    rawAuthenticationData: TSAuthenticationSDK.WebAuthnAuthenticationData,
    options: TSAuthenticationSDK.WebAuthnAuthenticationOptions[]): Promise<TSAuthenticationSDK.ApprovalResults> {
    return TsAuthentication.approvalWebAuthnWithData(rawAuthenticationData, options);
  }

  approvalNativeBiometrics(
    username: string,
    challenge: string
  ): Promise<TSAuthenticationSDK.TSBiometricsAuthenticationResult> {
    return TsAuthentication.approvalNativeBiometrics(username, challenge);
  }

  registerPinCode(username: string, pinCode: string): Promise<TSAuthenticationSDK.TSPinCodeRegistrationCompletion> {
    return TsAuthentication.registerPinCode(username, pinCode);
  }

  commitPinRegistration(contextIdentifier: string): Promise<void> {
    return TsAuthentication.commitPinRegistration(contextIdentifier);
  }

  authenticatePinCode(username: string, pinCode: string, challenge: string): Promise<TSAuthenticationSDK.TSPinCodeAuthenticationCompletion> {
    return TsAuthentication.authenticatePinCode(username, pinCode, challenge);
  }

  unregisterPinCode(username: string): Promise<TSAuthenticationSDK.TSPinCodeUnregistrationCompletion> {
    return TsAuthentication.unregisterPinCode(username);
  }

  commitPinUnregistration(contextIdentifier: string): Promise<void> {
    return TsAuthentication.commitPinUnregistration(contextIdentifier);
  }

  registerTOTP(uri: string, securityType: TSAuthenticationSDK.TOTPSecurityType = 'none'): Promise<TSAuthenticationSDK.TSTOTPRegistrationResult> {
    return TsAuthentication.registerTOTP(uri, securityType);
  }

  generateTOTPCode(uuid: string): Promise<TSAuthenticationSDK.TSTOTPCodeResult> {
    return TsAuthentication.generateTOTPCode(uuid);
  }

  generateTOTPCodeWithChallenge(uuid: string, challenge: string): Promise<TSAuthenticationSDK.TSTOTPCodeResult> {
    return TsAuthentication.generateTOTPCodeWithChallenge(uuid, challenge);
  }

  signWithDeviceKey(challenge: string): Promise<TSAuthenticationSDK.TSSignResult> {
    return TsAuthentication.signWithDeviceKey(challenge);
  }

  getDeviceInfo(): Promise<TSAuthenticationSDK.DeviceInfo> {
    return TsAuthentication.getDeviceInfo();
  }

  isWebAuthnSupported(): Promise<boolean> {
    return TsAuthentication.isWebAuthnSupported();
  }
}
export default new AuthenticationSDK();
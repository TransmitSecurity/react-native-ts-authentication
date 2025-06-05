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

  export const enum TSAuthenticationError {
    notInitialized,
    userNotFound,
    requestIsRunning,
    registrationFailed,
    authenticationFailed,
    invalidWebAuthnSession,
    genericServerError,
    networkError,
    passkeyError,
    unknown
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
  initializeSDK: () => Promise<boolean>;
  initialize: (clientId: string, domain?: string | null | undefined, baseUrl?: string | null | undefined) => Promise<boolean>;
  registerWebAuthn: (username: string, displayName: string) => Promise<TSAuthenticationSDK.TSRegistrationResult>;
  authenticateWebAuthn: (username: string) => Promise<TSAuthenticationSDK.TSAuthenticationResult>;
  signWebauthnTransaction: (username: string) => Promise<TSAuthenticationSDK.TSAuthenticationResult>;
  registerNativeBiometrics: (username: string) => Promise<TSAuthenticationSDK.TSBiometricsRegistrationResult>;
  authenticateNativeBiometrics: (username: string, challenge: string) => Promise<TSAuthenticationSDK.TSBiometricsAuthenticationResult>;
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
  
  getDeviceInfo: () => Promise<TSAuthenticationSDK.DeviceInfo>;
  isWebAuthnSupported: () => Promise<boolean>;
}

class AuthenticationSDK implements TSAuthenticationSDKModule {

  initializeSDK(): Promise<boolean> {
    return TsAuthentication.initializeSDK();
  }

  initialize(clientId: string, domain?: string | null | undefined, baseUrl?: string | null | undefined): Promise<boolean> {
    const isDomain = domain ? domain : "";
    const isBaseUrl = baseUrl ? baseUrl : "https://api.transmitsecurity.io/";
    return TsAuthentication.initialize(clientId, isDomain, isBaseUrl);
  }

  registerWebAuthn(username: string, displayName: string): Promise<TSAuthenticationSDK.TSRegistrationResult> {
    return TsAuthentication.registerWebAuthn(username, displayName);
  }

  authenticateWebAuthn(username: string): Promise<TSAuthenticationSDK.TSAuthenticationResult> {
    return TsAuthentication.authenticateWebAuthn(username);
  }

  signWebauthnTransaction(username: string): Promise<TSAuthenticationSDK.TSAuthenticationResult> {
    return TsAuthentication.signWebauthnTransaction(username);
  }

  registerNativeBiometrics(username: string): Promise<TSAuthenticationSDK.TSBiometricsRegistrationResult> {
    return TsAuthentication.registerNativeBiometrics(username);
  }

  authenticateNativeBiometrics(username: string, challenge: string): Promise<TSAuthenticationSDK.TSBiometricsAuthenticationResult> {
    return TsAuthentication.authenticateNativeBiometrics(username, challenge);
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

  getDeviceInfo(): Promise<TSAuthenticationSDK.DeviceInfo> {
    return TsAuthentication.getDeviceInfo();
  }

  isWebAuthnSupported(): Promise<boolean> {
    return TsAuthentication.isWebAuthnSupported();
  }
}
export default new AuthenticationSDK();
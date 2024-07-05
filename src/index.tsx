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
}

export interface TSAuthenticationSDKModule {
  initializeSDK: () => Promise<boolean>;
  initialize: (clientId: string, baseUrl: string) => Promise<boolean>;
  registerWebAuthn: (username: string, displayName: string) => Promise<TSAuthenticationSDK.TSRegistrationResult>;
  authenticateWebAuthn: (username: string) => Promise<TSAuthenticationSDK.TSAuthenticationResult>;
  signWebauthnTransaction: (username: string) => Promise<TSAuthenticationSDK.TSAuthenticationResult>;
  registerNativeBiometrics: (username: string) => Promise<TSAuthenticationSDK.TSBiometricsRegistrationResult>;
  authenticateNativeBiometrics: (username: string, challenge: string) => Promise<TSAuthenticationSDK.TSBiometricsAuthenticationResult>;
  getDeviceInfo: () => Promise<TSAuthenticationSDK.DeviceInfo>;
  isWebAuthnSupported: () => Promise<boolean>;
}

class AuthenticationSDK implements TSAuthenticationSDKModule {

  initializeSDK(): Promise<boolean> {
    return TsAuthentication.initializeSDK();
  }

  initialize(clientId: string, baseUrl: string): Promise<boolean> {
    return TsAuthentication.initialize(clientId, baseUrl);
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

  getDeviceInfo(): Promise<TSAuthenticationSDK.DeviceInfo> {
    return TsAuthentication.getDeviceInfo();
  }

  isWebAuthnSupported(): Promise<boolean> {
    return TsAuthentication.isWebAuthnSupported();
  }
}
export default new AuthenticationSDK();
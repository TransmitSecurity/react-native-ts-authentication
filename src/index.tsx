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

  export interface TSRegistrationCompletion {
    result: TSRegistrationResult;
    error: TSAuthenticationError;
  }

  export interface TSAuthenticationCompletion {
    result: TSAuthenticationResult;
    error: TSAuthenticationError;
  }

  export const enum BaseURL {
    us = "https://webauthn.identity.security/v1",
    eu = "https://webauthn.eu.identity.security/v1"
  }
}

export interface TSAuthenticationSDKModule {
  initialize: (clientId: string, domain: string, baseUrl: TSAuthenticationSDK.BaseURL) => Promise<boolean>;
  register: (username: string, displayName: string) => Promise<TSAuthenticationSDK.TSRegistrationCompletion>;
  authenticate: (username: string) => Promise<TSAuthenticationSDK.TSAuthenticationCompletion>;
}

class AuthenticationSDK implements TSAuthenticationSDKModule {

  initialize(clientId: string, domain: string, baseUrl: TSAuthenticationSDK.BaseURL): Promise<boolean> {
    return TsAuthentication.initialize(clientId, domain, baseUrl);
  }

  register(username: string, displayName: string): Promise<TSAuthenticationSDK.TSRegistrationCompletion> {
    return TsAuthentication.register(username, displayName);
  }

  authenticate(username: string): Promise<TSAuthenticationSDK.TSAuthenticationCompletion> {
    return TsAuthentication.authenticate(username);
  }

}
export default new AuthenticationSDK();
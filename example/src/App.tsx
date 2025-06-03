import * as React from 'react';
import { Alert, SafeAreaView } from 'react-native';
import TSAuthenticationSDKModule, { TSAuthenticationSDK } from 'react-native-ts-authentication';
import HomeScreen from './home';
import config from './config';
import localUserStore from './utils/local-user-store';
import MockServer from './utils/mock_server';
import LoggedIn from './logged-in';

const enum AppScreen {
  Home = 'Home',
  AuthenticatedUser = 'AuthenticatedUser'
}

export type State = {
  errorMessage: string,
  currentScreen: string,
  username: string,
  isNewlyRegistered: boolean
};

export type ExampleAppConfiguration = {
  clientId: string;
  baseUrl: string;
  secret: string;
}

export default class App extends React.Component<any, State> {

  private mockServer!: MockServer;

  constructor(props: any) {
    super(props);
    this.state = {
      errorMessage: '',
      currentScreen: AppScreen.Home,
      username: "",
      isNewlyRegistered: false
    };
  }

  componentDidMount(): void {
    this.onAppReady().catch(e => void e);
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        {
          this.state.currentScreen === AppScreen.Home ? (
            <HomeScreen 
              onStartAuthentication={this.onStartAuthentication}
              onStartNativeBiometrics={this.onStartNativeBiometrics}
              onApprovalWebAuthn={this.onApprovalWebAuthn}
              onApprovalWebAuthnWithData={this.onApprovalWebAuthnWithData}
              onApprovalNativeBiometrics={this.onApprovalNativeBiometrics}
              errorMessage={this.state.errorMessage}
            />
          ) : (
            <LoggedIn 
              username={this.state.username}
              onStartTransaction={this.onStartTransaction}
              onLogout={this.onLogout} 
              isNewlyRegistered={this.state.isNewlyRegistered} 
            />
          )
        }
      </SafeAreaView>
    );
  }

  // Transaction Process Handlers

  public onStartTransaction = async (rawUsername: string): Promise<void> => {
    const username = rawUsername.toLowerCase();
    this.setState({ errorMessage: '' });

    if (localUserStore.isUserIDStored(username)) {
      this.signTransaction(username);
    } else {
      console.log("User not registered");
      this.setState({ errorMessage: 'User not registered' });
    }
  }

  private signTransaction = async (username: string): Promise<void> => {
    try {
      const response = await TSAuthenticationSDKModule.signWebauthnTransaction(username);
      const accessToken = await this.mockServer.getAccessToken();
      const success = await this.mockServer.completeAuthentication(accessToken.token, response.result); // should change???
      if (success) {
        this.setState({ errorMessage: '' });
        console.log("Sign Transaction success");
      } else {
        this.setState({ errorMessage: 'Sign Transaction failed' });
      }
    } catch (error: any) {
      this.setState({ errorMessage: `${error}` });
    }
  }

  // Native Biometrics

  public onStartNativeBiometrics = async (rawUsername: string): Promise<void> => {
    if (rawUsername === '') {
      this.setState({ errorMessage: 'Please enter a username' });
      return;
    }

    const username = rawUsername.toLowerCase();
    this.setState({ errorMessage: '' });

    if (localUserStore.isUserIDStored(username)) {
      this.authenticateWithNativeBiometrics(username);
    } else {
      this.registerNativeBiometics(username);
    }
  }

   private registerNativeBiometics = async (username: string): Promise<void> => {
    try {
      const response = await TSAuthenticationSDKModule.registerNativeBiometrics(username);
      const accessToken = await this.mockServer.getAccessToken();
      const success = await this.mockServer.completeBiometricsRegistration(accessToken.token, response);
      
      if (success) {
        localUserStore.addUserID(username);
        this.navigateToAuthenticatedUserScreen(username, true);
      } else {
        this.setState({ errorMessage: 'Registration failed' });
      }
    } catch (error: any) {
      this.setState({ errorMessage: `${error}` });
    }
  }

  private authenticateWithNativeBiometrics = async (username: string): Promise<void> => {
    try {
      const challenge = this.randomString();
      const response = await TSAuthenticationSDKModule.authenticateNativeBiometrics(username, challenge);
      const accessToken = await this.mockServer.getAccessToken();
      const success = await this.mockServer.completeBiometricsAuthentication(accessToken.token, username, challenge, response);
      if (success) {
        this.navigateToAuthenticatedUserScreen(username, false);
      } else {
        this.setState({ errorMessage: 'Authentication failed' });
      }
    } catch (error: any) {
      this.setState({ errorMessage: `${error}` });
    }
  }

  // WebAuthn Registration / Authentication

  public onStartAuthentication = async (rawUsername: string): Promise<void> => {
    if (rawUsername === '') {
      this.setState({ errorMessage: 'Please enter a username' });
      return;
    }

    const username = rawUsername.toLowerCase();
    this.setState({ errorMessage: '' });

    if (localUserStore.isUserIDStored(username)) {
      this.authenticateWithWebAuthn(username);
    } else {
      const displayName = username + "_" + this.randomString();
      this.registerWebAuthn(username, displayName);
    }
  }

  private registerWebAuthn = async (username: string, displayName: string): Promise<void> => {
    try {
      const response = await TSAuthenticationSDKModule.registerWebAuthn(username, displayName);
      const accessToken = await this.mockServer.getAccessToken();
      const success = await this.mockServer.completeRegistration(accessToken.token, response.result, username);
      if (success) {
        localUserStore.addUserID(username);
        this.navigateToAuthenticatedUserScreen(username, true);
      } else {
        this.setState({ errorMessage: 'Registration failed' });
      }
    } catch (error: any) {
      this.setState({ errorMessage: `${error}` });
    }
  }

  private authenticateWithWebAuthn = async (username: string): Promise<void> => {
    try {
      const response = await TSAuthenticationSDKModule.authenticateWebAuthn(username);
      const accessToken = await this.mockServer.getAccessToken();
      const success = await this.mockServer.completeAuthentication(accessToken.token, response.result);
      if (success) {
        this.navigateToAuthenticatedUserScreen(username, false);
      } else {
        this.setState({ errorMessage: 'Authentication failed' });
      }
    } catch (error: any) {
      this.setState({ errorMessage: `${error}` });
    }
  }

  // Approvals WebAuthn

  public onApprovalWebAuthn = async (username: string, approvalData: { [key: string]: string; }) => {
    if (username === '') {
      this.setState({ errorMessage: 'Please enter a username' });
      return;
    }
    this.approvalWebAuthn(username, approvalData);
  }

  private approvalWebAuthn = async(username: string, approvalData: { [key: string]: string; }): Promise<void> => {
    try {
      const result = await TSAuthenticationSDKModule.approvalWebAuthn(username, approvalData, []);
      Alert.alert("Approval result: ", JSON.stringify(result));
    } catch (error: any) {
      this.setState({ errorMessage: `${error}` });
    }
  }

  // Approvals WebAuthn with Authentication Data

  public onApprovalWebAuthnWithData = async (rawAuthenticationData:  TSAuthenticationSDK.WebAuthnAuthenticationData) => {    
    if (rawAuthenticationData === null) {
      this.setState({ errorMessage: 'Please enter authentication data' });
      return;
    }
    this.approvalWebAuthnWithData(rawAuthenticationData);
  }

  private approvalWebAuthnWithData = async (rawAuthenticationData: TSAuthenticationSDK.WebAuthnAuthenticationData): Promise<void> => {
    try {
      const result = await TSAuthenticationSDKModule.approvalWebAuthnWithData(rawAuthenticationData, []);
      Alert.alert("Approval result: ", JSON.stringify(result));
    } catch (error: any) {
      this.setState({ errorMessage: `${error}` });
    }
  }

  // Approvals Native Biometrics

  public onApprovalNativeBiometrics = async (username: string) => {
    if (username === '') {
      this.setState({ errorMessage: 'Please enter a username' });
      return;
    }
    
    try {
      const result = await TSAuthenticationSDKModule.approvalNativeBiometrics(username, "challenge");
      Alert.alert("Approval result: ", JSON.stringify(result));
    }  catch (error: any) {
      this.setState({ errorMessage: `${error}` });
    }
  }

  // Navigation

  private navigateToAuthenticatedUserScreen = (username: string, isNewRegistration: boolean): void => {
    this.setState({
      currentScreen: AppScreen.AuthenticatedUser,
      username,
      isNewlyRegistered: isNewRegistration
    });
  }

  private onLogout = (): void => {
    this.setState({ currentScreen: AppScreen.Home, username: "" });
  }

  // App Configuration

  private onAppReady = async (): Promise<void> => {
    if (this.isAppConfigured()) {
      const appConfiguration: ExampleAppConfiguration = {
        clientId: config.clientId,
        baseUrl: `${config.baseUrl}`,
        secret: config.secret
      }

      this.configureExampleApp(appConfiguration);
    } else {
      console.error(`Please configure the app by updating the 'config.ts' file`);
    }
  }

  private configureExampleApp = async (appConfiguration: ExampleAppConfiguration): Promise<void> => {
    this.mockServer = new MockServer(
      appConfiguration.baseUrl,
      appConfiguration.clientId,
      appConfiguration.secret
    );

    if (!TSAuthenticationSDKModule.isWebAuthnSupported()) {
      this.setState({ errorMessage: 'WebAuthn is not supported on this device' });
      return;
    }

    await TSAuthenticationSDKModule.initialize(
      appConfiguration.clientId
    );

    const deviceInfo = await TSAuthenticationSDKModule.getDeviceInfo();
    console.log("Device Info: ", deviceInfo);
  }

  private isAppConfigured = (): boolean => {
    return !(config.clientId === "REPLACE_WITH_CLIENT_ID");
  }

  private randomString = (): string => {
    return (Math.random() + 1).toString(36).substring(7);
  }
}

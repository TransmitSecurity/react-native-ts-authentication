import * as React from 'react';
import { SafeAreaView } from 'react-native';
import TSAuthenticationSDKModule from 'react-native-ts-authentication';
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
            <HomeScreen onStartAuthentication={this.onStartAuthentication} errorMessage={this.state.errorMessage}
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

  // Authentication Process Handlers

  public onStartAuthentication = async (rawUsername: string): Promise<void> => {
    if (rawUsername === '') {
      this.setState({ errorMessage: 'Please enter a username' });
      return;
    }

    const username = rawUsername.toLowerCase();
    this.setState({ errorMessage: '' });

    if (localUserStore.isUserIDStored(username)) {
      this.authenticate(username);
    } else {
      const displayName = username + "_" + this.randomString();
      this.register(username, displayName);
    }
  }

  // Registration

  private register = async (username: string, displayName: string): Promise<void> => {
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

  // Authentication

  private authenticate = async (username: string): Promise<void> => {
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
      appConfiguration.clientId,
      `${appConfiguration.baseUrl}/cis/v1/`
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

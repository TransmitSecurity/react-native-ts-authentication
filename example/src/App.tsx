import * as React from 'react';
import { SafeAreaView } from 'react-native';
import TSAuthenticationSDKModule, { TSAuthenticationSDK } from 'react-native-ts-authentication';
import HomeScreen from './home';
import config from './config';
import localUserStore from './utils/local-user-store';

export type State = {
  errorMessage: string,
};

export type ExampleAppConfiguration = {
  clientId: string;
  domain: string;
  baseUrl: TSAuthenticationSDK.BaseURL;
}

export default class App extends React.Component<any, State> {

  constructor(props: any) {
    super(props);
    this.state = {
      errorMessage: '',
    };
  }

  componentDidMount(): void {
    this.onAppReady().catch(e => void e);
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <HomeScreen onStartAuthentication={this.onStartAuthentication} errorMessage={this.state.errorMessage} />
      </SafeAreaView>
    );
  }

  // Authentication Process Handlers

  onStartAuthentication = async (username: string): Promise<void> => {
    if (username === '') {
      this.setState({ errorMessage: 'Please enter a username' });
      return;
    }

    this.setState({ errorMessage: '' });

    if (localUserStore.isUserIDStored(username)) {
      this.authenticate(username);
    } else  {
      const displayName = username + "_" + this.randomString();
      this.register(username, displayName);
    }
  }

  private register = async (username: string, displayName: string): Promise<void> => {
    TSAuthenticationSDKModule.register(username, displayName);
  }

  private authenticate = async (username: string): Promise<void> => {

  }

  // App Configuration

  private onAppReady = async (): Promise<void> => {
    if (this.isAppConfigured()) {
      const appConfiguration: ExampleAppConfiguration = {
        clientId: config.clientId,
        domain: config.domain,
        baseUrl: TSAuthenticationSDK.BaseURL.us,
      }
      this.configureExampleApp(appConfiguration);
    } else {
      // this.showAppConfigurationDialog()
    }
  }

  private configureExampleApp = async (appConfiguration: ExampleAppConfiguration): Promise<void> => {
    
    TSAuthenticationSDKModule.initialize(
      appConfiguration.clientId, 
      appConfiguration.domain, 
      appConfiguration.baseUrl
    );
    
    // this.mockServer = new MockServer(
    //   appConfiguration.baseAPIURL,
    //   appConfiguration.clientId,
    //   appConfiguration.secret
    // );
    // IdentityVerification.initialize(appConfiguration.clientId);

    // this.registerForEvents();
    // this.requestCameraPermissions();

    // try {
    //   this.accessTokenResponse = await this.mockServer.getAccessToken();
    // } catch (error) {
    //   this.setState({ errorMessage: `${error}` });
    // }
  }

  private isAppConfigured = (): boolean => {
    return !(config.clientId === "REPLACE_WITH_CLIENT_ID" || config.domain === "REPLACE_WITH_DOMAIN");
  }

  private randomString = (): string => {
    return (Math.random() + 1).toString(36).substring(7);
  }
}

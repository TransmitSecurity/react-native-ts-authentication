import * as React from 'react';
import { Alert, SafeAreaView, View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import TSAuthenticationSDKModule, { TSAuthenticationSDK } from 'react-native-ts-authentication';
import HomeScreen, { type MoreAction } from './home';
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
  isNewlyRegistered: boolean,
  loading: boolean,
  homeKey: number,
  totpUUID: string | null,
  loggingEnabled: boolean
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
      isNewlyRegistered: false,
      loading: false,
      homeKey: 0,
      totpUUID: null,
      loggingEnabled: false
    };
  }

  componentDidMount(): void {
    this.onAppReady().catch(e => void e);
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {this.state.currentScreen === AppScreen.Home ? (
            <HomeScreen 
              key={this.state.homeKey}
              onStartAuthentication={this.onStartAuthentication}
              onStartNativeBiometrics={this.onStartNativeBiometrics}
              onApprovalWebAuthn={this.onApprovalWebAuthn}
              onApprovalWebAuthnWithData={this.onApprovalWebAuthnWithData}
              onApprovalNativeBiometrics={this.onApprovalNativeBiometrics}
              onRegisterPINCode={this.onRegisterPINCode}
              onAuthenticatePinCode={this.onAuthenticatePinCode}
              moreActions={this.moreActions()}
              errorMessage={this.state.errorMessage}
            />
          ) : (
            <LoggedIn 
              username={this.state.username}
              onStartTransaction={this.onStartTransaction}
              onLogout={this.onLogout} 
              isNewlyRegistered={this.state.isNewlyRegistered} 
            />
          )}
          {this.state.loading && (
            <View style={styles.spinnerOverlay} pointerEvents="auto">
              <View style={styles.spinnerCard}>
                <ActivityIndicator size="large" color="#4f8cff" />
                <View style={{ height: 16 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.spinnerText}>Please wait...</Text>
                </View>
              </View>
            </View>
          )}
        </View>
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

  // Signs with the username only. To approve a transaction with approval data (amount, payee, ...),
  // use approvalWebAuthn — see "Approval WebAuthn" on the home screen.
  private signTransaction = async (username: string): Promise<void> => {
    this.setState({ loading: true });
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
      this.logSdkError('signTransaction', error);
      this.setState({ errorMessage: `${error?.code}: ${error?.message}` });
    } finally {
      this.setState({ loading: false });
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
    this.setState({ loading: true });
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
      this.logSdkError('registerNativeBiometics', error);
      this.setState({ errorMessage: `${error?.code}: ${error?.message}` });
    } finally {
      this.setState({ loading: false });
    }
  }

  private authenticateWithNativeBiometrics = async (username: string): Promise<void> => {
    this.setState({ loading: true });
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
      this.logSdkError('authenticateWithNativeBiometrics', error);
      this.setState({ errorMessage: `${error?.code}: ${error?.message}` });
    } finally {
      this.setState({ loading: false });
    }
  }

  // WebAuthn Registration / Authentication

  public onStartAuthentication = async (rawUsername: string): Promise<void> => {
    if (rawUsername === '') {
      this.setState({ errorMessage: 'Please enter a username' });
      return;
    }
    this.setState({ loading: true });
    const username = rawUsername.toLowerCase();
    this.setState({ errorMessage: '' });
    try {
      if (localUserStore.isUserIDStored(username)) {
        await this.authenticateWithWebAuthn(username);
      } else {
        const displayName = username + "_" + this.randomString();
        await this.registerWebAuthn(username, displayName);
      }
    } catch (error: any) {
      this.logSdkError('onStartAuthentication', error);
      this.setState({ errorMessage: `${error?.code}: ${error?.message}` });
    } finally {
      this.setState({ loading: false });
    }
  }

  private registerWebAuthn = async (username: string, displayName: string): Promise<void> => {
    this.setState({ loading: true });
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
      this.logSdkError('registerWebAuthn', error);
      this.setState({ errorMessage: `${error?.code}: ${error?.message}` });

    } finally {
      this.setState({ loading: false });
    }
  }

  private authenticateWithWebAuthn = async (username: string): Promise<void> => {
    this.setState({ loading: true });
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
      this.logSdkError('authenticateWithWebAuthn', error);
      this.setState({ errorMessage: `${error?.code}: ${error?.message}` });
    } finally {
      this.setState({ loading: false });
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
    this.setState({ loading: true });
    try {
      const result = await TSAuthenticationSDKModule.approvalWebAuthn(username, approvalData, []);
      Alert.alert("Approval result: ", JSON.stringify(result));
    } catch (error: any) {
      this.logSdkError('approvalWebAuthn', error);
      this.setState({ errorMessage: `${error?.code}: ${error?.message}` });
    } finally {
      this.setState({ loading: false });
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
    this.setState({ loading: true });
    try {
      const result = await TSAuthenticationSDKModule.approvalWebAuthnWithData(rawAuthenticationData, []);
      Alert.alert("Approval result: ", JSON.stringify(result));
    } catch (error: any) {
      this.logSdkError('approvalWebAuthnWithData', error);
      this.setState({ errorMessage: `${error?.code}: ${error?.message}` });
    } finally {
      this.setState({ loading: false });
    }
  }

  // Approvals Native Biometrics

  public onApprovalNativeBiometrics = async (username: string) => {
    if (username === '') {
      this.setState({ errorMessage: 'Please enter a username' });
      return;
    }
    this.setState({ loading: true });
    try {
      const result = await TSAuthenticationSDKModule.approvalNativeBiometrics(username, "challenge");
      Alert.alert("Approval result: ", JSON.stringify(result));
    } catch (error: any) {
      this.logSdkError('onApprovalNativeBiometrics', error);
      this.setState({ errorMessage: `${error?.code}: ${error?.message}` });
    } finally {
      this.setState({ loading: false });
    }
  }

  // PIN Code Registration / Authentication

  private onRegisterPINCode = async (rawUsername: string, pinCode: string): Promise<boolean> => {
    if (rawUsername === '' || pinCode === '') {
      this.setState({ errorMessage: 'Please enter a username and PIN code' });
      return false;
    }
    this.setState({ loading: true });
    const username = rawUsername.toLowerCase();
    this.setState({ errorMessage: '' });
    try {
      const result = await TSAuthenticationSDKModule.registerPinCode(username, pinCode);
      console.log("Pin Code Registration Result: ", result);
      // Send the registration result to your server if needed, then commit pin registration.
      await TSAuthenticationSDKModule.commitPinRegistration(result.contextIdentifier);
      localUserStore.setHasRegisteredPIN(username, true);
      Alert.alert("PIN Code Registration", "PIN code registered successfully");
      return true;
    } catch (error: any) {
      this.logSdkError('onRegisterPINCode', error);
      this.setState({ errorMessage: `${error?.code}: ${error?.message}` });
      return false;
    } finally {
      this.setState({ loading: false });
    }
  }

  private onAuthenticatePinCode = async (username: string, pinCode: string): Promise<boolean> => {
    if (username === '' || pinCode === '') {
      this.setState({ errorMessage: 'Please enter a username and PIN code' });
      return false;
    }
    this.setState({ loading: true });
    
    const challenge = this.randomString();
    try {
      const result = await TSAuthenticationSDKModule.authenticatePinCode(username, pinCode, challenge);
      Alert.alert("Authentication result: ", JSON.stringify(result));
      return true;
    } catch (error: any) {
      this.logSdkError('onAuthenticatePinCode', error);
      this.setState({ errorMessage: `${error?.code}: ${error?.message}` });
      return false;
    } finally {
      this.setState({ loading: false });
    }
  }

  // More APIs

  private moreActions = (): MoreAction[] => [
    { title: 'Initialize from config file', onPress: () => this.runAndShow('initializeSDK', () => TSAuthenticationSDKModule.initializeSDK()) },
    { title: `Turn SDK logging ${this.state.loggingEnabled ? 'off' : 'on'}`, onPress: this.onToggleLogging },
    { title: 'Biometrics status', onPress: this.onBiometricsStatus },
    { title: 'Unregister Native Biometrics', onPress: (username) => this.withUsername(username, () =>
        this.runAndShow('unregisterNativeBiometrics', () => TSAuthenticationSDKModule.unregisterNativeBiometrics(username))) },
    { title: 'Unregister PIN', onPress: this.onUnregisterPinCode },
    { title: 'Sign with Device Key', onPress: () =>
        this.runAndShow('signWithDeviceKey', () => TSAuthenticationSDKModule.signWithDeviceKey(this.randomString())) },
    { title: 'Register TOTP', onPress: this.onRegisterTOTP },
    { title: 'Generate TOTP Code', onPress: () => this.withTOTP((uuid) =>
        this.runAndShow('generateTOTPCode', () => TSAuthenticationSDKModule.generateTOTPCode(uuid))) },
    { title: 'Generate TOTP Code with Challenge', onPress: () => this.withTOTP((uuid) =>
        this.runAndShow('generateTOTPCodeWithChallenge', () => TSAuthenticationSDKModule.generateTOTPCodeWithChallenge(uuid, this.randomString()))) },
    { title: 'Register WebAuthn With Data', onPress: (username) => this.withUsername(username, () =>
        this.runAndShow('registerWebAuthnWithData', () => TSAuthenticationSDKModule.registerWebAuthnWithData(this.mockRegistrationData(username)))) },
    { title: 'Authenticate WebAuthn With Data', onPress: (username) => this.withUsername(username, () =>
        this.runAndShow('authenticateWebAuthnWithData', () => TSAuthenticationSDKModule.authenticateWebAuthnWithData(this.mockAuthenticationData(username)))) },
    { title: 'Sign Transaction With Data', onPress: (username) => this.withUsername(username, () =>
        this.runAndShow('signWebauthnTransactionWithData', () => TSAuthenticationSDKModule.signWebauthnTransactionWithData(this.mockAuthenticationData(username)))) },
  ];

  private runAndShow = async (name: string, call: () => Promise<unknown>): Promise<unknown> => {
    this.setState({ loading: true, errorMessage: '' });
    try {
      const result = await call();
      Alert.alert(name, JSON.stringify(result ?? null));
      return result;
    } catch (error: any) {
      this.logSdkError(name, error);
      this.setState({ errorMessage: `${error?.code}: ${error?.message}` });
      return undefined;
    } finally {
      this.setState({ loading: false });
    }
  }

  private withUsername = (username: string, action: () => void): void => {
    if (username === '') {
      this.setState({ errorMessage: 'Please enter a username' });
      return;
    }
    action();
  }

  private withTOTP = (action: (uuid: string) => void): void => {
    if (!this.state.totpUUID) {
      this.setState({ errorMessage: 'Register TOTP first' });
      return;
    }
    action(this.state.totpUUID);
  }

  private onToggleLogging = async (): Promise<void> => {
    const enabled = !this.state.loggingEnabled;
    await TSAuthenticationSDKModule.setLoggingEnabled(enabled);
    this.setState({ loggingEnabled: enabled });
  }

  private onBiometricsStatus = (): void => {
    this.runAndShow('biometrics', async () => ({
      isEnrolled: await TSAuthenticationSDKModule.isNativeBiometricsEnrolled(),
      status: await TSAuthenticationSDKModule.getNativeBiometricsStatus(),
      type: await TSAuthenticationSDKModule.getNativeBiometricsType(),
    }));
  }

  private onUnregisterPinCode = (rawUsername: string): void => {
    this.withUsername(rawUsername, async () => {
      const username = rawUsername.toLowerCase();
      const result = await this.runAndShow('unregisterPinCode', () => TSAuthenticationSDKModule.unregisterPinCode(username)) as
        TSAuthenticationSDK.TSPinCodeUnregistrationCompletion | undefined;
      if (!result) return;
      // Tell your server the PIN authenticator was removed, then commit locally.
      await this.runAndShow('commitPinUnregistration', () => TSAuthenticationSDKModule.commitPinUnregistration(result.contextIdentifier));
      localUserStore.setHasRegisteredPIN(username, false);
      this.setState({ homeKey: this.state.homeKey + 1 });
    });
  }

  private onRegisterTOTP = (username: string): void => {
    const securityTypes: TSAuthenticationSDK.TOTPSecurityType[] = ['none', 'biometric', 'devicePin', 'devicePinOrBiometric'];
    Alert.alert('TOTP security type', undefined, [
      ...securityTypes.map((securityType) => ({
        text: securityType,
        onPress: async () => {
          // A sample authenticator URI; a real one comes from your TOTP registration flow.
          const uri = `otpauth://totp/Example:${encodeURIComponent(username || 'user')}?secret=JBSWY3DPEHPK3PXP&issuer=Example`;
          const result = await this.runAndShow('registerTOTP', () => TSAuthenticationSDKModule.registerTOTP(uri, securityType)) as
            TSAuthenticationSDK.TSTOTPRegistrationResult | undefined;
          if (result) this.setState({ totpUUID: result.uuid });
        },
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  // Mock payloads in the server format. They exercise the bridge; the server rejects them.
  private mockRegistrationData = (username: string) => ({
    webauthn_session_id: 'some-web-authn-session-id',
    credential_creation_options: {
      challenge: 'some-challenge-string',
      rp: { id: 'mock-rp-id', name: 'Mock RP' },
      user: { id: username, name: username, displayName: username },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      authenticatorSelection: { userVerification: 'preferred' },
      attestation: 'direct',
    },
  });

  private mockAuthenticationData = (username: string): TSAuthenticationSDK.WebAuthnAuthenticationData => ({
    webauthnSessionId: 'some-web-authn-session-id',
    credentialRequestOptions: {
      challenge: 'some-challenge-string',
      allowCredentials: null,
      userVerification: 'preferred',
      rpId: 'mock-rp-id',
      userData: { id: username, name: username, displayName: username },
    },
  });

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

  private logSdkError = (context: string, error: any): void => {
    console.log(`[${context}] code=${error?.code} message=${error?.message} userInfo=${JSON.stringify(error?.userInfo)}`);
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
      appConfiguration.clientId,
      null,
      appConfiguration.baseUrl,
      config.webAuthnApiPaths ? { webAuthnApiPaths: config.webAuthnApiPaths } : null
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

const styles = StyleSheet.create({
  spinnerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  spinnerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 180,
  },
  spinnerText: {
    fontSize: 17,
    color: '#4f8cff',
    fontWeight: '600',
    marginLeft: 6,
  },
});

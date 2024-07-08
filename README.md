# React Native - Transmit Security Authentication SDK

Add strong authentication with Passkeys to your native iOS and Android applications, while providing a native experience. This describes how to use the React Native module to register credentials and use them to authenticate your users.

## About Authentication SDK

This SDK provides a unified solution for implementing both Apple's public-private key authentication for passkeys on iOS and Google's Credential Manager API for passkeys on Android. It enables the integration of FIDO2-based biometric authentication seamlessly into your mobile applications, offering users a native experience instead of a browser-based one. With passkeys, credentials are securely stored by the device, leveraging iCloud Keychain on iOS and Google Password Manager on Android. These credentials are associated with your domain, facilitating secure sharing between your mobile app and website if applicable.

Using this module, you can easily integrate our Authentication SDK into your React Native app for seamless and secure user identity authentication.<br>
[Learn more about how you can boost your security with Transmit Security Authentication.](https://transmitsecurity.com/platform/full-stack-authentication)

## Understand the flow
We recommended that you read more about the verification flow required steps in our [iOS documentation](https://developer.transmitsecurity.com/guides/webauthn/quick_start_sdk_ios/) and [Android documentation](https://developer.transmitsecurity.com/guides/webauthn/quick_start_sdk_android/#Command-line)

## Configure your app
To integrate this module, you'll need to configure an application.

1. From the [Applications](https://portal.transmitsecurity.io/applications) page, [create a new application](https://developer.transmitsecurity.com/guides/user/create_new_application/) or use an existing one.
2. From the application settings:
    * For Client type , select native
    * For Redirect URI , enter your website URL. This is a mandatory field, but it isn't used for this flow.
    * Obtain your client ID and secret for API calls, which are autogenerated upon app creation.
    * Enable public sign-up if you manage users using an external system (e.g., external identity provider) or if you want to quickly test WebAuthn registration and authentication without first logging in using a different authentication method.
3. Refer to our iOS and Android documentation mentioned above to configure an auth method and associate your domain for Apple and Google. 

## Example project setup
#### Note: Configuring Google's assetlinks.json and Apple's apple-app-site-association according to the guidelines in our native SDKs documentation and the user-guides provided by Apple and Google can be a challenging task. However, it is crucial to complete this step accurately for both utilizing the example app and configuring your own application. Instead of attempting to configure this example directly, you are welcome to use it just as a code-reference to ensure proper implementation.

1. In your project, navigate to `example/src/config.ts` and configure the clientId, domain, secret and baseUrl using the configuration obtained from the Transmit portal.
2. Ensure you have all the necessary dependencies by running `yarn` in both the module's root folder and the example root folder.
3. Run the example app on a real device using Xcode or Android Studio. Alternatively, execute `yarn example ios` or `yarn example android`.
<br><br>
> **Important Security Note: Never store your `secret` in a front-end application.**
> 
> The example app utilizes a mock server to manage communication with the authentication platform. This mock server employs the `secret` you have specified in `example/src/config.ts` exclusively for demonstration purposes. It is paramount that you safeguard your `secret` in a secure and confidential location.

## Installation

```sh
npm install react-native-ts-authentication
```

#### iOS Setup
You might need to execute `pod install` in your project's `/ios` folder and set your minimum iOS target to 15.0 in your Podfile (e.g `platform :ios, 15.0`).

* Add project Capabilities as described [iOS quick start](https://developer.transmitsecurity.com/guides/webauthn/quick_start_sdk_ios/)
* Update YOUR Bundle ID and setup associated domains as described in the [iOS quick start](https://developer.transmitsecurity.com/guides/webauthn/quick_start_sdk_ios/)

#### Android Setup

Add to `app/build.gradle` under repositories

```gradle
repositories {
  google()
  maven {
    url('https://transmit.jfrog.io/artifactory/transmit-security-gradle-release-local/')
  }
}
```
Note:  
As for projects on Gradle 8+ and Kotlin 1.8+ build will fail if the JDK version between 
compileKotlin and compileJava and jvmTarget are not aligned. 

This won't be necessary anymore from React Native 0.73. More on this:
https://kotlinlang.org/docs/whatsnew18.html#obligatory-check-for-jvm-targets-of-related-kotlin-and-java-compile-tasks

## Usage

#### Module Setup
```js
import TSAuthenticationSDKModule from 'react-native-ts-authentication';

componentDidMount(): void {
    // Setup the module as soon your component is ready
    this.onAppReady().catch(e => void e);
}

private onAppReady = async (): Promise<void> => {
    /* Initialize the module with parameters: 
        1. ClientID obtained from the application settings in the Transmit portal
        2. BaseURL can be "https://api.transmitsecurity.io" | eu = "api.eu.transmitsecurity.io" | ca = "api.ca.transmitsecurity.io"

    */
    const baseURL = "https://api.transmitsecurity.io";

    TSAuthenticationSDKModule.initialize(
      "YOUR_CLIENT_ID",
      `${baseURL}/cis/v1`
    );
}
```

#### First time authentication (Register a user)
```js
onStartRegistrationProcess = async (): Promise<void> => {
    try {
        const response = await TSAuthenticationSDKModule.registerWebAuthn(username, displayName);
        // use the response.result string to complete a successful registration in your backend.
    } catch (error) {
        console.error(`Error during registration process: ${error}`);
    }
}
```

#### Start the authentication process
```js
onStartAuthenticationProcess = async (): Promise<void> => {
    try {
        const response = await TSAuthenticationSDKModule.authenticateWebAuthn(username);
        // use the response.result string to complete a successful authentication in your backend.
    } catch (error) {
        console.error(`Error authenticating the user: ${error}`);
    }
}
```

#### Sign a transaction
```js
onStartSignTransactionProcess = async (): Promise<void> => {
    try {
        const response = await TSAuthenticationSDKModule.signWebauthnTransaction(username);
        // use the response.result string to complete a signing a transaction in your backend.
    } catch (error) {
        console.error(`Error signing a transaction: ${error}`);
    }
}
```

#### Get Device Info
```js
onGetDeviceInfo = async (): Promise<void> => {
    try {
        const response = await TSAuthenticationSDKModule.getDeviceInfo();
    } catch (error) {
        console.error(`Error getting device info: ${error}`);
    }
}
```

#### Check if the device supports webAuthn
```js
onIsWebAuthenSupported = async (): Promise<void> => {
    try {
        const isSupported = await TSAuthenticationSDKModule.isWebAuthnSupported();
    } catch (error) {
        console.error(`Error checking if the device supports webAuthn: ${error}`);
    }
}
```

## Important Notes
1. Please take note that the example application uses a client-side mock server. In a production environment, a real server is required. Additionally, it is crucial to emphasize that storing the client secret in your front-end application is strictly discouraged for security reasons.

## Support
[Email us for support](info@transmitsecurity.com)

## Author

Transmit Security, https://github.com/TransmitSecurity

## License

This project is licensed under the MIT license. See the LICENSE file for more info.

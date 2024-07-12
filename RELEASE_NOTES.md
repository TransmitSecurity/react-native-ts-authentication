## 0.1.4 July 2024
### Content
#### Enhancements
1. Upgraded native SDKs to iOS `1.1.2` and Android `1.0.18`.
2. Added initializeSDK API to load configuration from `TransmitSecurity.plist` on iOS, and `strings.xml` on Android.
3. Removed `domain` parameter on `initialize` API.
4. Added biometrics authentication API.
5. `uses-sdk:minSdkVersion` Should be equal or greater then `23` to support native biometrics.
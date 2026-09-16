## 0.1.9 September 2026
### Content
#### Enhancements
1. Upgraded native SDKs to iOS `1.2.1` and Android `1.0.30`.
2. All APIs now reject with a stable `code` string that is identical on iOS and Android.
3. iOS errors now expose the underlying Apple error via `error.userInfo.asAuthorizationErrorCode`, so a dismissed passkey sheet (`ASAuthorizationError` `1001`) is reported as `userCanceled`.

#### Bug Fixes
1. Fixed `authenticateNativeBiometrics` on iOS never settling its promise when the failure was not a native biometrics error.

#### Breaking Changes
1. `error.code` was previously always the literal `"TSAuthentication"` on iOS. Applications comparing against that value must be updated to the new codes.
2. `TSAuthenticationSDK.TSAuthenticationError` is now an interface describing the rejected error, replacing the previous unused numeric enum. The error codes are available as `TSAuthenticationSDK.TSAuthenticationErrorCode`.

## 0.1.5 July 2024
### Content
#### Enhancements
1. Upgraded native SDKs to iOS `1.1.3` and Android `1.0.19`.
2. Added initializeSDK API to load configuration from `TransmitSecurity.plist` on iOS, and `strings.xml` on Android.
3. Added biometrics authentication API.
4. `uses-sdk:minSdkVersion` Should be equal or greater then `23` to support native biometrics.
5. Added support for custom domain in SDK initialize API.
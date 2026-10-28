## 0.2.0 October 2026
### Content
#### Enhancements
1. Upgraded the Android native SDK to `1.0.32` (core SDK `1.1.2`). Android apps now need `compileSdkVersion` 33 or higher. The iOS native SDK stays at `1.2.1`.
2. Added `signWithDeviceKey` to sign a challenge with the device key.
3. Added `isNativeBiometricsEnrolled`, `getNativeBiometricsStatus` and `getNativeBiometricsType`.
4. Added `unregisterNativeBiometrics`, and `unregisterPinCode` with `commitPinUnregistration`.
5. Added TOTP: `registerTOTP`, `generateTOTPCode` and `generateTOTPCodeWithChallenge`.
6. Added `registerWebAuthnWithData`, `authenticateWebAuthnWithData` and `signWebauthnTransactionWithData`, for WebAuthn data your backend has already started.
7. `initialize` takes optional init options with custom WebAuthn API paths.
8. `initializeSDK` takes an optional configuration file name (iOS only).
9. `authenticateWebAuthn` and `signWebauthnTransaction` take optional WebAuthn options (applied on iOS).
10. Added `setLoggingEnabled`.
11. Documented `approvalWebAuthn` as the API for approving a transaction with approval data.

#### Bug Fixes
1. Android: `initialize` ignored the `baseUrl` and `domain` arguments and always used the default base URL.
2. Android: `signWebauthnTransaction` failed because the native method was exported under a different name.
3. Android: `initializeSDK` now resolves, and rejects with `initializationError` when the configuration is missing, instead of throwing.
4. Android: APIs that need a foreground Activity now reject with the new `activityNotAvailable` code instead of never settling.
5. Android: PIN code APIs no longer require an `AppCompatActivity`.
6. Android: building an app with the New Architecture from a local checkout of this package no longer adds duplicate React Native classes.
7. iOS: plugin log messages are printed correctly.

## 0.1.9 September 2026
### Content
#### Enhancements
1. Upgraded native SDKs to iOS `1.2.1` and Android `1.0.30`.
2. All APIs now reject with a stable `code` string that is identical on iOS and Android.
3. iOS errors now expose the underlying Apple error via `error.userInfo.asAuthorizationErrorCode`, so a dismissed passkey sheet (`ASAuthorizationError` `1001`) is reported as `userCanceled`.
4. Backend failures on iOS are now reported as `networkError` with `error.userInfo.httpStatusCode` and `error.userInfo.serverMessage`, instead of being swallowed as a generic internal error.

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
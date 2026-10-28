#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TsAuthentication, NSObject)

RCT_EXTERN_METHOD(initializeSDK:(NSString *)configurationFileName withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(initialize:(NSString*)clientId domain:(NSString*)domain baseUrl:(NSString*)baseUrl initOptions:(NSDictionary *)initOptions withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(registerWebAuthn:(NSString *)username displayName:(NSString*)displayName withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(authenticateWebAuthn:(NSString *)username options:(NSArray *)options withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(signWebauthnTransaction:(NSString *)username options:(NSArray *)options withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(registerWebAuthnWithData:(NSString *)rawRegistrationData withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(authenticateWebAuthnWithData:(NSDictionary *)rawAuthenticationData options:(NSArray *)options withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(signWebauthnTransactionWithData:(NSDictionary *)rawAuthenticationData options:(NSArray *)options withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(registerNativeBiometrics:(NSString *)username withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(authenticateNativeBiometrics:(NSString *)username challenge:(NSString*)challenge withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(unregisterNativeBiometrics:(NSString *)username withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(isNativeBiometricsEnrolled:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getNativeBiometricsStatus:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getNativeBiometricsType:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(approvalWebAuthn:(NSString *)username approvalData:(NSDictionary*)approvalData options:(NSArray *)options withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(approvalWebAuthnWithData:(NSDictionary*)rawAuthenticationData options:(NSArray *)options withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(approvalNativeBiometrics:(NSString *)username challenge:(NSString*)challenge withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(registerPinCode:(NSString *)username pinCode:(NSString*)pinCode withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(commitPinRegistration:(NSString *)contextIdentifier withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(authenticatePinCode:(NSString *)username pinCode:(NSString*)pinCode challenge:(NSString*)challenge withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(unregisterPinCode:(NSString *)username withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(commitPinUnregistration:(NSString *)contextIdentifier withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(registerTOTP:(NSString *)uri securityType:(NSString *)securityType withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(generateTOTPCode:(NSString *)uuid withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(generateTOTPCodeWithChallenge:(NSString *)uuid challenge:(NSString *)challenge withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getDeviceInfo:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(isWebAuthnSupported:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(signWithDeviceKey:(NSString *)challenge withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setLoggingEnabled:(BOOL)enabled withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end

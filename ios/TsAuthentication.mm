#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TsAuthentication, NSObject)

RCT_EXTERN_METHOD(initializeSDK:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(initialize:(NSString*)clientId baseUrl:(NSString*)baseUrl withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(registerWebAuthn:(NSString *)username displayName:(NSString*)displayName withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(authenticateWebAuthn:(NSString *)username withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(signWebauthnTransaction:(NSString *)username withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(registerNativeBiometrics:(NSString *)username withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(authenticateNativeBiometrics:(NSString *)username challenge:(NSString*)challenge withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getDeviceInfo:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(isWebAuthnSupported:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end

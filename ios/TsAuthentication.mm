#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TsAuthentication, NSObject)

RCT_EXTERN_METHOD(initialize:(NSString*)clientId domain:(NSString*)domain baseUrl:(NSString*)baseUrl withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)

//RCT_EXTERN_METHOD(initialize:(NSString *)clientId domain:(NSString*)domain withBaseUrl:(NSString *)baseUrl withResolver:(RCTPromiseResolveBlock)resolve withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(register:(NSString *)username displayName:(NSString*)displayName withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(authenticate:(NSString *)username withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end

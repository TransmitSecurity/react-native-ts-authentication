import TSAuthenticationSDK
import TSCoreSDK

@objc(TsAuthentication)
class TsAuthentication: NSObject {
  
  private var contextStore: [String: AnyObject] = [:]
    
  // MARK: - SDK Init
  
  @objc(initializeSDK:withResolver:withRejecter:)
  func initializeSDK(
    _ configurationFileName: String?,
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      runBlockOnMain {
        do {
          let configuration = configurationFileName.flatMap {
            $0.isEmpty ? nil : TSAuthenticationConfiguration(configurationFileName: $0)
          }
          try TSAuthentication.shared.initializeSDK(configuration: configuration)
          resolve(true)
        } catch {
          logger.log("Finished initializeSDK with error: \(error)")
          self.rejectWith(reject, error)
        }
      }
    }
  
  @objc(initialize:domain:baseUrl:initOptions:withResolver:withRejecter:)
  func initialize(
    _ clientId: String,
    domain: String,
    baseUrl: String,
    initOptions: [String: Any]?,
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      guard !clientId.isEmpty, !baseUrl.isEmpty else {
        reject(TSErrorCode.invalidArgument.rawValue, "Invalid params provided to .initialize", nil)
        return
      }
      
      runBlockOnMain {
        TSAuthentication.shared.initialize(
          baseUrl: baseUrl,
          clientId: clientId,
          domain: domain.isEmpty ? nil : domain,
          initOptions: self.convertInitOptions(initOptions)
        )
        resolve(true)
      }
    }
  
  private func convertInitOptions(_ rawOptions: [String: Any]?) -> TSAuthenticationInitOptions? {
    guard let paths = rawOptions?["webAuthnApiPaths"] as? [String: Any],
          let startRegistration = paths["startRegistration"] as? String,
          let startAuthentication = paths["startAuthentication"] as? String else {
      return nil
    }
    
    return TSAuthenticationInitOptions(
      webAuthnApiPaths: WebAuthnApis(startAuthentication: startAuthentication, startRegistration: startRegistration)
    )
  }
  
  // MARK: - WebAuthn
  
  @objc(registerWebAuthn:displayName:withResolver:withRejecter:)
  func registerWebAuthn(
    _ username: String,
    displayName: String,
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      runBlockOnMain { [weak self] in
        TSAuthentication.shared.registerWebAuthn(
          username: username,
          displayName: displayName) { [weak self] results in
            guard let self = self else { return }
            switch results {
            case .success(let response):
              logger.log("Finished native registration with success")
              resolve(["result": response.result])
            case .failure(let error):
              logger.log("Finished native registration with error: \(error)")
              self.rejectWith(reject, error)
            }
          }
      }
    }
  
  @objc(authenticateWebAuthn:options:withResolver:withRejecter:)
  func authenticateWebAuthn(
    _ username: String,
    options: [String],
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      runBlockOnMain {
        TSAuthentication.shared.authenticateWebAuthn(username: username, options: self.convertWebAuthnOptions(options)) { [weak self] results in
          guard let self = self else { return }
          
          switch results {
          case .success(let response):
            resolve(["result": response.result])
          case .failure(let error):
            self.rejectWith(reject, error)
          }
        }
      }
    }
  
  // MARK: - Sign Transaction
  
  @objc(signWebauthnTransaction:options:withResolver:withRejecter:)
  func signWebauthnTransaction(
    _ username: String,
    options: [String],
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      runBlockOnMain {
        TSAuthentication.shared.signWebauthnTransaction(username: username, options: self.convertWebAuthnOptions(options)) { [weak self] results in
          guard let self = self else { return }
          
          switch results {
          case .success(let response):
            resolve(["result": response.result])
          case .failure(let error):
            self.rejectWith(reject, error)
          }
        }
      }
    }
  
  // MARK: - WebAuthn with raw data
  
  /// The registration data is the server JSON (`webauthn_session_id`, `credential_creation_options`), as a string.
  @objc(registerWebAuthnWithData:withResolver:withRejecter:)
  func registerWebAuthnWithData(
    _ rawRegistrationData: String,
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      guard let jsonData = rawRegistrationData.data(using: .utf8),
            let registrationData = try? TSWebAuthnRegistrationData(jsonData) else {
        reject(TSErrorCode.invalidArgument.rawValue, "Invalid rawRegistrationData", nil)
        return
      }
      
      runBlockOnMain {
        TSAuthentication.shared.registerWebAuthn(registrationData) { [weak self] results in
          guard let self = self else { return }
          
          switch results {
          case .success(let response):
            resolve(["result": response.result])
          case .failure(let error):
            self.rejectWith(reject, error)
          }
        }
      }
    }
  
  @objc(authenticateWebAuthnWithData:options:withResolver:withRejecter:)
  func authenticateWebAuthnWithData(
    _ rawAuthenticationData: [String: AnyHashable],
    options: [String],
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      guard let authenticationData = convertWebAuthnAuthenticationData(rawAuthenticationData) else {
        reject(TSErrorCode.invalidArgument.rawValue, "Invalid rawAuthenticationData", nil)
        return
      }
      
      runBlockOnMain {
        TSAuthentication.shared.authenticateWebAuthn(authenticationData, options: self.convertWebAuthnOptions(options)) { [weak self] results in
          guard let self = self else { return }
          
          switch results {
          case .success(let response):
            resolve(["result": response.result])
          case .failure(let error):
            self.rejectWith(reject, error)
          }
        }
      }
    }
  
  @objc(signWebauthnTransactionWithData:options:withResolver:withRejecter:)
  func signWebauthnTransactionWithData(
    _ rawAuthenticationData: [String: AnyHashable],
    options: [String],
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      guard let authenticationData = convertWebAuthnAuthenticationData(rawAuthenticationData) else {
        reject(TSErrorCode.invalidArgument.rawValue, "Invalid rawAuthenticationData", nil)
        return
      }
      
      runBlockOnMain {
        TSAuthentication.shared.signWebauthnTransaction(authenticationData, options: self.convertWebAuthnOptions(options)) { [weak self] results in
          guard let self = self else { return }
          
          switch results {
          case .success(let response):
            resolve(["result": response.result])
          case .failure(let error):
            self.rejectWith(reject, error)
          }
        }
      }
    }
  
  // MARK: - Native Biometrics
  
  @objc(registerNativeBiometrics:withResolver:withRejecter:)
  func registerNativeBiometrics(
    _ username: String,
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      runBlockOnMain { [weak self] in
        TSAuthentication.shared.registerNativeBiometrics(username: username) { [weak self] results in
          guard let self = self else { return }
          
          switch results {
          case .success(let response):
            let publicKey = response.publicKey
            let publicKeyId = response.publicKeyId
            resolve([
              "publicKey": publicKey,
              "publicKeyId": publicKeyId,
              "os": "iOS",
              "keyType": response.keyType
            ])
          case .failure(let error):
            self.rejectWith(reject, error)
          }
        }
      }
    }
  
  @objc(authenticateNativeBiometrics:challenge:withResolver:withRejecter:)
  func authenticateNativeBiometrics(
    _ username: String,
    challenge: String,
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      runBlockOnMain {
        TSAuthentication.shared.authenticateNativeBiometrics(
          username: username, challenge: challenge
        ) { [weak self] result in
          guard let self = self else { return }
          
          switch result {
          case .success(let response):
            let publicKeyId = response.publicKeyId
            let signature = response.signature
            resolve([
              "publicKeyId": publicKeyId,
              "signature": signature
            ])
          case .failure(let error):
            self.rejectWith(reject, error)
          }
        }
      }
    }
  
  @objc(unregisterNativeBiometrics:withResolver:withRejecter:)
  func unregisterNativeBiometrics(
    _ username: String,
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      runBlockOnMain {
        TSAuthentication.shared.unregistersNativeBiometrics(username: username) { [weak self] results in
          guard let self = self else { return }
          
          switch results {
          case .success(let response):
            resolve(["publicKeyId": response.publicKeyId])
          case .failure(let error):
            self.rejectWith(reject, error)
          }
        }
      }
    }
  
  @objc(isNativeBiometricsEnrolled:withRejecter:)
  func isNativeBiometricsEnrolled(
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      runBlockOnMain {
        resolve(TSAuthentication.isNativeBiometricsEnrolled())
      }
    }
  
  @objc(getNativeBiometricsStatus:withRejecter:)
  func getNativeBiometricsStatus(
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      runBlockOnMain {
        switch TSAuthentication.nativeBiometricsStatus() {
        case .available: resolve("available")
        case .notEnrolled: resolve("notEnrolled")
        case .notAvailable: resolve("notAvailable")
        case .permissionDenied: resolve("permissionDenied")
        case .lockedOut: resolve("lockedOut")
        @unknown default: resolve("unknown")
        }
      }
    }
  
  @objc(getNativeBiometricsType:withRejecter:)
  func getNativeBiometricsType(
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      runBlockOnMain {
        switch TSAuthentication.nativeBiometricsType() {
        case .faceID: resolve("faceID")
        case .touchID: resolve("touchID")
        case .opticID: resolve("opticID")
        case .none: resolve("none")
        @unknown default: resolve("none")
        }
      }
    }
  
  // MARK: - Approvals
  
  @objc(approvalWebAuthn:approvalData:options:withResolver:withRejecter:)
  func approvalWebAuthn(
    username: String?,
    approvalData: [String: String],
    options: [String],
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    
    runBlockOnMain {
      TSAuthentication.shared.approvalWebAuthn(approvalData: approvalData, username: username, options: self.convertWebAuthnOptions(options)) { [weak self] results in
        guard let self = self else { return }
        
        switch results {
        case .success(let result):
          resolve([
            "result": result.result
          ])
        case .failure(let error):
          self.rejectWith(reject, error)
        }
      }
    }
  }
  
  @objc(approvalWebAuthnWithData:options:withResolver:withRejecter:)
  func approvalWebAuthnWithData(
    rawAuthenticationData: [String: AnyHashable],
    options: [String],
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let authenticationData = convertWebAuthnAuthenticationData(rawAuthenticationData) else {
      reject(TSErrorCode.invalidArgument.rawValue, "Invalid rawAuthenticationData", nil)
      return
    }
    
    runBlockOnMain {
      TSAuthentication.shared.approvalWebAuthn(authenticationData, options: self.convertWebAuthnOptions(options)) { [weak self] results in
        guard let self = self else { return }
        
        switch results {
        case .success(let results):
          resolve([
            "result": results.result
          ])
        case .failure(let error):
          self.rejectWith(reject, error)
        }
      }
    }
  }
  
  @objc(approvalNativeBiometrics:challenge:withResolver:withRejecter:)
  func approvalNativeBiometrics(
    username: String,
    challenge: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    runBlockOnMain {
      TSAuthentication.shared.approvalNativeBiometrics(username: username, challenge: challenge)  { [weak self] results in
        guard let self = self else { return }
        
        switch results {
        case .success(let results):
          resolve([
            "publicKeyId": results.publicKeyId,
            "signature": results.signature
          ])
        case .failure(let error):
          self.rejectWith(reject, error)
        }
      }
    }
  }
  
  private func convertWebAuthnAuthenticationData(_ rawData: [String: AnyHashable]) -> TSAuthenticationSDK.TSWebAuthnAuthenticationData? {
    guard let credentialRequestOptions = rawData["credentialRequestOptions"] as? [String: AnyHashable],
          let webauthnSessionId = rawData["webauthnSessionId"] as? String else {
      return nil
    }
    
    let rawUserData: [String: AnyHashable]? = credentialRequestOptions["userData"] as? [String: AnyHashable]
    
    let userData = TSAuthenticationSDK.TSWebAuthnUserData(
      id: rawUserData?["id"] as? String,
      name: rawUserData?["name"] as? String,
      displayName: rawUserData?["displayName"] as? String
    )
    
    let optionsData = TSWebAuthnAuthenticationCredentialRequestOptionsData(
      challenge: credentialRequestOptions["challenge"] as? String,
      allowCredentials: convertAllowCredentials(credentialRequestOptions),
      userVerification: credentialRequestOptions["userVerification"] as? String,
      rpId: credentialRequestOptions["rpId"] as? String,
      user: userData
    )
    
    let authenticationData = TSAuthenticationSDK.TSWebAuthnAuthenticationData(
      webauthnSessionId: webauthnSessionId,
      credentialRequestOptions: optionsData
    )
    
    return authenticationData
  }
  
  private func convertAllowCredentials(_ credentialRequestOptions: [String: AnyHashable]) -> [TSWebAuthnAllowCredentialsData]? {
    guard let allowCredentialsArray = credentialRequestOptions["allowCredentials"] as? [[String: AnyHashable]] else {
      return nil
    }
    
    return allowCredentialsArray.map { rawAllowCredential in
      TSWebAuthnAllowCredentialsData(
        id: rawAllowCredential["id"] as? String,
        name: rawAllowCredential["name"] as? String,
        displayName: rawAllowCredential["displayName"] as? String
      )}
  }
  
  private func convertWebAuthnOptions(_ rawOptions: [String]) -> TSAuthenticationSDK.TSAuthentication.WebAuthnAuthenticationOptions {
    var options: TSAuthenticationSDK.TSAuthentication.WebAuthnAuthenticationOptions = []
    
    if rawOptions.firstIndex(of: "preferLocalCredantials") != nil {
      options.insert(.preferLocalCredantials)
    }
    
    return options
  }
  
  // MARK: - PIN Authenticator
  
  @objc(registerPinCode:pinCode:withResolver:withRejecter:)
  func registerPinCode(
    username: String,
    pinCode: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    runBlockOnMain {
      TSAuthentication.shared.registerPinCode(username: username, pinCode: pinCode) { [weak self] results in
        guard let self = self else { return }
        
        switch results {
        case .success(let response):
          
          let identifier = self.generateContextIdentifier()
          self.storeContextWithIdentifier(identifier, context: response.registrationContext)
          
          resolve([
            "publicKeyId": response.publicKeyId,
            "publicKey": response.publicKey,
            "keyType": response.keyType,
            "contextIdentifier": identifier
          ])
          
        case .failure(let error):
          self.rejectWith(reject, error)
        }
      }
    }
  }
  
  @objc(commitPinRegistration:withResolver:withRejecter:)
  func commitPinRegistration(
    contextIdentifier: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard !contextIdentifier.isEmpty, var pinRegistrationContext = getContextWithIdentifier(contextIdentifier) as? TSAuthenticationSDK.TSRegistrationContext else {
      reject(TSErrorCode.invalidArgument.rawValue, "Invalid context identifier", nil)
      return
    }
    
    removeContextWithIdentifier(contextIdentifier)
    
    do {
      try pinRegistrationContext.commit()
      resolve(true)
    } catch {
      self.rejectWith(reject, error)
    }
  }
  
  @objc(unregisterPinCode:withResolver:withRejecter:)
  func unregisterPinCode(
    username: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    runBlockOnMain {
      TSAuthentication.shared.unregisterPinCode(username: username) { [weak self] results in
        guard let self = self else { return }
        
        switch results {
        case .success(let response):
          let identifier = self.generateContextIdentifier()
          self.storeContextWithIdentifier(identifier, context: response.unregistrationContext as AnyObject)
          
          resolve([
            "publicKeyId": response.publicKeyId,
            "contextIdentifier": identifier
          ])
        case .failure(let error):
          self.rejectWith(reject, error)
        }
      }
    }
  }
  
  @objc(commitPinUnregistration:withResolver:withRejecter:)
  func commitPinUnregistration(
    contextIdentifier: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard !contextIdentifier.isEmpty, var pinUnregistrationContext = getContextWithIdentifier(contextIdentifier) as? TSAuthenticationSDK.TSRegistrationContext else {
      reject(TSErrorCode.invalidArgument.rawValue, "Invalid context identifier", nil)
      return
    }
    
    removeContextWithIdentifier(contextIdentifier)
    
    do {
      try pinUnregistrationContext.commit()
      resolve(true)
    } catch {
      self.rejectWith(reject, error)
    }
  }
  
  @objc(authenticatePinCode:pinCode:challenge:withResolver:withRejecter:)
  func authenticatePinCode(
    username: String,
    pinCode: String,
    challenge: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    runBlockOnMain {
      TSAuthentication.shared.authenticatePinCode(
        username: username,
        pinCode: pinCode,
        challenge: challenge
      ) { [weak self] results in
        guard let self = self else { return }
        
        switch results {
        case .success(let response):
          resolve([
            "publicKeyId": response.publicKeyId,
            "signature": response.signature,
            "challenge": response.challenge
          ])
        case .failure(let error):
          self.rejectWith(reject, error)
        }
      }
    }
  }
  
  // MARK: - Utility
  
  @objc(getDeviceInfo:withRejecter:)
  func getDeviceInfo(
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      runBlockOnMain {
        TSAuthentication.shared.getDeviceInfo() { [weak self] deviceInfo in
          guard let self = self else { return }
          
          switch deviceInfo {
          case .success(let response):
            let info = [
              "publicKeyId": response.publicKeyId,
              "publicKey": response.publicKey
            ]
            resolve(info)
          case .failure(let error):
            self.rejectWith(reject, error)
          }
        }
      }
    }
  
  @objc(isWebAuthnSupported:withRejecter:)
  func isWebAuthnSupported(
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      runBlockOnMain {
        let isSupported = TSAuthentication.isWebAuthnSupported()
        resolve(isSupported)
      }
    }
  
  @objc(signWithDeviceKey:withResolver:withRejecter:)
  func signWithDeviceKey(
    _ challenge: String,
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      runBlockOnMain {
        TSAuthentication.shared.signWithDeviceKey(challenge: challenge) { [weak self] results in
          guard let self = self else { return }
          
          switch results {
          case .success(let response):
            resolve(["signature": response.signature])
          case .failure(let error):
            self.rejectWith(reject, error)
          }
        }
      }
    }
  
  @objc(setLoggingEnabled:withResolver:withRejecter:)
  func setLoggingEnabled(
    _ enabled: Bool,
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      TSAuthentication.setLogLevel(enabled ? .debug : .off)
      resolve(nil)
    }
  
  // MARK: - TOTP
  
  @objc(registerTOTP:securityType:withResolver:withRejecter:)
  func registerTOTP(
    _ uri: String,
    securityType: String,
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      guard let totpSecurityType = convertTOTPSecurityType(securityType) else {
        reject(TSErrorCode.invalidArgument.rawValue, "Invalid TOTP security type: \(securityType)", nil)
        return
      }
      
      runBlockOnMain {
        TSAuthentication.shared.registerTOTP(URI: uri, securityType: totpSecurityType) { [weak self] results in
          guard let self = self else { return }
          
          switch results {
          case .success(let response):
            resolve([
              "uuid": response.uuid,
              "issuer": response.issuer as Any,
              "label": response.label as Any
            ])
          case .failure(let error):
            self.rejectWith(reject, error)
          }
        }
      }
    }
  
  @objc(generateTOTPCode:withResolver:withRejecter:)
  func generateTOTPCode(
    _ uuid: String,
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      runBlockOnMain {
        TSAuthentication.shared.generateTOTPCode(UUID: uuid) { [weak self] results in
          guard let self = self else { return }
          
          switch results {
          case .success(let response):
            resolve(["code": response.code])
          case .failure(let error):
            self.rejectWith(reject, error)
          }
        }
      }
    }
  
  @objc(generateTOTPCodeWithChallenge:challenge:withResolver:withRejecter:)
  func generateTOTPCodeWithChallenge(
    _ uuid: String,
    challenge: String,
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      runBlockOnMain {
        TSAuthentication.shared.generateTOTPCodeWithChallenge(UUID: uuid, challenge: challenge) { [weak self] results in
          guard let self = self else { return }
          
          switch results {
          case .success(let response):
            resolve(["code": response.code])
          case .failure(let error):
            self.rejectWith(reject, error)
          }
        }
      }
    }
  
  private func convertTOTPSecurityType(_ rawType: String) -> TSTOTPSecurityType? {
    switch rawType {
    case "none": return TSTOTPSecurityType.none
    case "biometric": return .biometric
    case "devicePin": return .devicePin
    case "devicePinOrBiometric": return .devicePinOrBiometric
    default: return nil
    }
  }
  
  // MARK: - Context Handler Management
  
  private func generateContextIdentifier() -> String {
    let uuid = UUID().uuidString
    return uuid
  }
  
  private func storeContextWithIdentifier(_ identifier: String, context: AnyObject) {
    contextStore[identifier] = context
  }
  
  private func removeContextWithIdentifier(_ identifier: String) {
    contextStore[identifier] = nil
  }
  
  private func getContextWithIdentifier(_ identifier: String) -> AnyObject? {
    return contextStore[identifier] as AnyObject?
  }
  
  private func rejectWith(_ reject: RCTPromiseRejectBlock, _ error: Error) {
    let rejection = tsRejection(error)
    reject(rejection.code, rejection.message, rejection.error)
  }
  
  // MARK: - Threading
  
  private func runBlockOnMain(_ block: @escaping () -> Void) {
    DispatchQueue.main.async {
      block()
    }
  }
}

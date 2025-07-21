import TSAuthenticationSDK

@objc(TsAuthentication)
class TsAuthentication: NSObject {
  
  private let kTag = "TSAuthentication"
  private var contextStore: [String: AnyObject] = [:]
    
  // MARK: - SDK Init
  
  @objc(initializeSDK:withRejecter:)
  func initializeSDK(
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      runBlockOnMain {
        do {
          try TSAuthentication.shared.initializeSDK()
          resolve(true)
        } catch {
          logger.log("Finished initializeSDK with error: \(error)")
          reject(self.kTag, nil, error)
        }
      }
    }
  
  @objc(initialize:domain:baseUrl:withResolver:withRejecter:)
  func initialize(
    _ clientId: String,
    domain: String,
    baseUrl: String,
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      guard !clientId.isEmpty, !baseUrl.isEmpty else {
        reject("Invalid params provided to .initialize", nil, nil)
        return
      }
      
      runBlockOnMain {
        if domain.count > 0 {
          TSAuthentication.shared.initialize(
            baseUrl: baseUrl,
            clientId: clientId,
            domain: domain
          )
        } else {
          TSAuthentication.shared.initialize(
            baseUrl: baseUrl,
            clientId: clientId
          )
        }
        resolve(true)
      }
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
              reject(self.kTag, error.localizedDescription, error)
            }
          }
      }
    }
  
  @objc(authenticateWebAuthn:withResolver:withRejecter:)
  func authenticateWebAuthn(
    _ username: String,
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      runBlockOnMain {
        TSAuthentication.shared.authenticateWebAuthn(username: username) { [weak self] results in
          guard let self = self else { return }
          
          switch results {
          case .success(let response):
            resolve(["result": response.result])
          case .failure(let error):
            reject(self.kTag, error.localizedDescription, error)
          }
        }
      }
    }
  
  // MARK: - Sign Transaction
  
  @objc(signWebauthnTransaction:withResolver:withRejecter:)
  func signWebauthnTransaction(
    _ username: String,
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
      runBlockOnMain {
        TSAuthentication.shared.signWebauthnTransaction(username: username) { [weak self] results in
          guard let self = self else { return }
          
          switch results {
          case .success(let response):
            resolve(["result": response.result])
          case .failure(let error):
            reject(self.kTag, error.localizedDescription, error)
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
            reject(self.kTag, error.localizedDescription, error)
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
            if case .nativeBiometricsError(let nativeBiometricsError) = error {
              reject(self.kTag, error.localizedDescription, nativeBiometricsError)
            }
          }
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
          reject(self.kTag, error.localizedDescription, error)
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
      reject(kTag, "Invalid rawAuthenticationData", nil)
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
          reject(self.kTag, error.localizedDescription, error)
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
          reject(self.kTag, error.localizedDescription, error)
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
          reject(self.kTag, error.localizedDescription, error)
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
      reject(self.kTag, "Invalid context identifier", nil)
      return
    }
    
    removeContextWithIdentifier(contextIdentifier)
    
    do {
      try pinRegistrationContext.commit()
      resolve(true)
    } catch {
      reject(self.kTag, error.localizedDescription, error)
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
          reject(self.kTag, error.localizedDescription, error)
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
            reject(self.kTag, error.localizedDescription, error)
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
  
  // MARK: - Threading
  
  private func runBlockOnMain(_ block: @escaping () -> Void) {
    DispatchQueue.main.async {
      block()
    }
  }
}

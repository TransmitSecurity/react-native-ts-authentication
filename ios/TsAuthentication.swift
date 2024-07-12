import TSAuthenticationSDK

@objc(TsAuthentication)
class TsAuthentication: NSObject {
    
    private let kTag = "TSAuthentication"
    
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
    
    @objc(initialize:baseUrl:withResolver:withRejecter:)
    func initialize(
        _ clientId: String,
        baseUrl: String,
        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        guard !clientId.isEmpty, !baseUrl.isEmpty else {
            reject("Invalid params provided to .initialize", nil, nil)
            return
        }
        
        runBlockOnMain {
            TSAuthentication.shared.initialize(
                baseUrl: baseUrl,
                clientId: clientId
            )
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
                            reject(self.kTag, nil, error)
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
                            "os": "iOS"
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
                            reject(self.kTag, error.localizedDescription, error)
                        }
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
    
    // MARK: - Threading
        
    private func runBlockOnMain(_ block: @escaping () -> Void) {
        DispatchQueue.main.async {
            block()
        }
    }
}

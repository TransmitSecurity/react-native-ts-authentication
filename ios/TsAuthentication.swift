import TSAuthenticationSDK

@objc(TsAuthentication)
class TsAuthentication: NSObject {
    
    private let kTag = "TSAuthentication"
    
    @objc(initialize:domain:baseUrl:withResolver:withRejecter:)
    func initialize(
        _ clientId: String,
        domain: String,
        baseUrl: String,
        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        guard !clientId.isEmpty, !domain.isEmpty, !baseUrl.isEmpty else {
            reject("Invalid params provided to .initialize", nil, nil)
            return
        }
        
        runBlockOnMain {
            TSAuthentication.shared.initialize(
                baseUrl: baseUrl,
                clientId: clientId,
                configuration: TSConfiguration(domain: domain)
            )
            resolve(true)
        }
    }
    
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

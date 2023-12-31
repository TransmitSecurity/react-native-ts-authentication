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
    
    @objc(register:displayName:withResolver:withRejecter:)
    func register(
        _ username: String,
        displayName: String,
        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
            runBlockOnMain { [weak self] in
                TSAuthentication.shared.register(
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
    
    @objc(authenticate:withResolver:withRejecter:)
    func authenticate(
        _ username: String,
        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
            
            runBlockOnMain {
                TSAuthentication.shared.authenticate(username: username) { [weak self] results in
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
    
    @objc(signTransaction:withResolver:withRejecter:)
    func signTransaction(
        _ username: String,
        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
            
            runBlockOnMain {
                TSAuthentication.shared.signTransaction(username: username) { [weak self] results in
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

    // MARK: - Threading
        
    private func runBlockOnMain(_ block: @escaping () -> Void) {
        DispatchQueue.main.async {
            block()
        }
    }
}

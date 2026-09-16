import Foundation
import AuthenticationServices
import TSAuthenticationSDK

enum TSErrorCode: String {
    case userCanceled
    case credentialNotAvailable
    case authenticationFailed
    case webAuthnFailed
    case invalidWebAuthnSession
    case invalidDomain
    case networkError
    case notInitialized
    case unsupportedOSVersion
    case requestIsRunning
    case initializationError
    case biometricsNotAvailable
    case biometricsNotEnrolled
    case biometricsNotRegistered
    case biometricsLockedOut
    case biometricsPermissionDenied
    case pinCodeNotRegistered
    case pinCodeDuplicateCommit
    case totpError
    case invalidArgument
    case unknown
}

struct TSRejection {
    let code: String
    let message: String
    let error: NSError

    init(_ code: TSErrorCode, _ message: String, asAuthorizationErrorCode: Int? = nil) {
        self.code = code.rawValue
        self.message = message

        var userInfo: [String: Any] = [
            "code": code.rawValue,
            NSLocalizedDescriptionKey: message
        ]
        if let asAuthorizationErrorCode = asAuthorizationErrorCode {
            userInfo["asAuthorizationErrorCode"] = asAuthorizationErrorCode
        }
        self.error = NSError(domain: "TSAuthentication", code: 0, userInfo: userInfo)
    }
}

func tsRejection(_ error: Error) -> TSRejection {
    let message = String(describing: error)

    guard let error = error as? TSAuthenticationError else {
        return TSRejection(.unknown, message)
    }

    switch error {
    case .notInitialized:
        return TSRejection(.notInitialized, message)
    case .unsupportedOSVersion:
        return TSRejection(.unsupportedOSVersion, message)
    case .requestIsRunning:
        return TSRejection(.requestIsRunning, message)
    case .networkError:
        return TSRejection(.networkError, message)
    case .initializationError:
        return TSRejection(.initializationError, message)
    case .webAuthnError(let webAuthnError):
        return tsWebAuthnRejection(webAuthnError, message)
    case .nativeBiometricsError(let biometricsError):
        return TSRejection(tsBiometricsCode(biometricsError), message)
    case .pinCodeError(let pinCodeError):
        return TSRejection(tsPinCodeCode(pinCodeError), message)
    case .totpError:
        return TSRejection(.totpError, message)
    case .internal:
        return TSRejection(.unknown, message)
    @unknown default:
        return TSRejection(.unknown, message)
    }
}

private func tsWebAuthnRejection(_ error: TSWebAuthnError, _ message: String) -> TSRejection {
    switch error {
    case .canceled:
        return TSRejection(.userCanceled, message, asAuthorizationErrorCode: ASAuthorizationError.Code.canceled.rawValue)
    case .userNotFound:
        return TSRejection(.credentialNotAvailable, message)
    case .invalidDomain:
        return TSRejection(.invalidDomain, message)
    case .invalidWebAuthnSession:
        return TSRejection(.invalidWebAuthnSession, message)
    case .failed(let asError):
        return TSRejection(asError?.code == .canceled ? .userCanceled : .authenticationFailed, message, asAuthorizationErrorCode: asError?.code.rawValue)
    case .invalidResponse(let asError), .notHandled(let asError), .notInteractive(let asError):
        return TSRejection(asError?.code == .canceled ? .userCanceled : .webAuthnFailed, message, asAuthorizationErrorCode: asError?.code.rawValue)
    case .internal:
        return TSRejection(.unknown, message)
    @unknown default:
        return TSRejection(.unknown, message)
    }
}

private func tsBiometricsCode(_ error: TSNativeBiometricsError) -> TSErrorCode {
    switch error {
    case .nativeBiometricsNotAvailable:
        return .biometricsNotAvailable
    case .nativeBiometricsNotEnrolled:
        return .biometricsNotEnrolled
    case .notRegistered:
        return .biometricsNotRegistered
    case .canceled, .userCanceled:
        return .userCanceled
    case .failure:
        return .authenticationFailed
    case .lockedOut:
        return .biometricsLockedOut
    case .permissionDenied:
        return .biometricsPermissionDenied
    case .internal:
        return .unknown
    @unknown default:
        return .unknown
    }
}

private func tsPinCodeCode(_ error: TSPinCodeError) -> TSErrorCode {
    switch error {
    case .notRegistered:
        return .pinCodeNotRegistered
    case .duplicateCommitRegistration:
        return .pinCodeDuplicateCommit
    case .internal:
        return .unknown
    @unknown default:
        return .unknown
    }
}

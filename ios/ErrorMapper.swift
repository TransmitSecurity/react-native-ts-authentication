import Foundation
import AuthenticationServices
import TSCoreSDK
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

    init(
        _ code: TSErrorCode,
        _ message: String,
        asAuthorizationErrorCode: Int? = nil,
        httpStatusCode: Int? = nil,
        serverMessage: String? = nil
    ) {
        self.code = code.rawValue
        self.message = message

        var userInfo: [String: Any] = [
            "code": code.rawValue,
            NSLocalizedDescriptionKey: message
        ]
        if let asAuthorizationErrorCode = asAuthorizationErrorCode {
            userInfo["asAuthorizationErrorCode"] = asAuthorizationErrorCode
        }
        if let httpStatusCode = httpStatusCode {
            userInfo["httpStatusCode"] = httpStatusCode
        }
        if let serverMessage = serverMessage {
            userInfo["serverMessage"] = serverMessage
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
        return tsBiometricsRejection(biometricsError, message)
    case .pinCodeError(let pinCodeError):
        return tsPinCodeRejection(pinCodeError, message)
    case .totpError:
        return TSRejection(.totpError, message)
    case .internal(let underlying):
        return tsInternalRejection(underlying, message)
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
    case .internal(let underlying):
        return tsInternalRejection(underlying, message)
    @unknown default:
        return TSRejection(.unknown, message)
    }
}

private func tsBiometricsRejection(_ error: TSNativeBiometricsError, _ message: String) -> TSRejection {
    switch error {
    case .nativeBiometricsNotAvailable:
        return TSRejection(.biometricsNotAvailable, message)
    case .nativeBiometricsNotEnrolled:
        return TSRejection(.biometricsNotEnrolled, message)
    case .notRegistered:
        return TSRejection(.biometricsNotRegistered, message)
    case .canceled, .userCanceled:
        return TSRejection(.userCanceled, message)
    case .failure:
        return TSRejection(.authenticationFailed, message)
    case .lockedOut:
        return TSRejection(.biometricsLockedOut, message)
    case .permissionDenied:
        return TSRejection(.biometricsPermissionDenied, message)
    case .internal(let underlying):
        return tsInternalRejection(underlying, message)
    @unknown default:
        return TSRejection(.unknown, message)
    }
}

private func tsPinCodeRejection(_ error: TSPinCodeError, _ message: String) -> TSRejection {
    switch error {
    case .notRegistered:
        return TSRejection(.pinCodeNotRegistered, message)
    case .duplicateCommitRegistration:
        return TSRejection(.pinCodeDuplicateCommit, message)
    case .internal(let underlying):
        return tsInternalRejection(underlying, message)
    @unknown default:
        return TSRejection(.unknown, message)
    }
}

private func tsInternalRejection(_ underlying: Error?, _ message: String) -> TSRejection {
    guard let requestError = underlying as? TSRequestError else {
        return TSRejection(.unknown, message)
    }

    var httpStatusCode: Int?
    if case .requestError(let errorCode) = requestError.errorCode {
        httpStatusCode = errorCode
    }

    return TSRejection(
        tsRequestCode(requestError.errorCode),
        message,
        httpStatusCode: httpStatusCode,
        serverMessage: requestError.errorMessage
    )
}

private func tsRequestCode(_ code: TSRequestErrorCode) -> TSErrorCode {
    switch code {
    case .noInternet, .noResponse, .invalidURL, .unauthorized, .unexpectedStatusCode, .forbiddenUrl, .requestError:
        return .networkError
    case .invalidResponse, .decodingError, .encodingError, .encriptionError, .unknown:
        return .unknown
    @unknown default:
        return .unknown
    }
}

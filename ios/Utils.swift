//
//  Utils.swift
//  react-native-ts-authentication
//
//  Created by Shachar Udi on 12/6/23.
//

import Foundation

let logger = Logger()
class Logger {
    func log(_ message: String) {
        NSLog("@%", "TSAuthentication: \(message)")
    }
}

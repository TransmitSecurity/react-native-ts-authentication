# react-native-ts-authentication

React Native module for Transmit Security Authentication SDK

## Installation

```sh
npm install react-native-ts-authentication
```

platform :ios, 15.0


verify these end points:
  export const enum BaseURL {
    us = "https://webauthn.identity.security/v1",
    eu = "https://webauthn.eu.identity.security/v1"
  }
probably they are wrong. one taken from the github repo, another from the portal documentation.

ios setup
https://developer.transmitsecurity.com/guides/webauthn/quick_start_sdk_ios/


update bundle id and setup associated domains iOS format example: webcredentials:shopcart.userid-stg.io (instruct to follow the tutorial for each platform)

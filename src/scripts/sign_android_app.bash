#!/bin/bash


# Export the signing certificate in DER format, hash, base64 encode, trim  '=' and url encode

keytool -exportcert -alias <your-keystore-alias> -keystore <your-keystore> | openssl sha256 -binary | openssl base64 | sed 's/=//g'| sed s/\\+/-/g | sed s/\\//_/g | sed -E s/=+\$//


.. next - sign the app and try the script
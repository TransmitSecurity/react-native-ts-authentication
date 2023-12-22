#!/bin/bash

# Edit the following variables to match your keystore and app:
KEY_STORE_ALIAS="YOUR_KEY_STORE_ALIAS"
PATH_KEY_STORE_ALIAS_FOLDER="PATH_TO_KEY_STORE_FOLDER"
KEY_STORE_FILE_NAME_IN_FOLDER="YOUR_KEY_STORE_FILE_NAME_IN_FOLDER"

cd $PATH_KEY_STORE_ALIAS_FOLDER
# Export the signing certificate in DER format, hash, base64 encode, trim  '=' and url encode

echo "Generating key hash for Android app..."
keytool -exportcert -alias $KEY_STORE_ALIAS -keystore $KEY_STORE_FILE_NAME_IN_FOLDER | openssl sha256 -binary | openssl base64 | sed 's/=//g'| sed s/\\+/-/g | sed s/\\//_/g | sed -E s/=+\$//

echo "All done."
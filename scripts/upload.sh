#!/bin/bash
IPA_PATH=$1
DESTINATION=greenwich.ipa

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [[ -z "$IPA_PATH" ]]; then
  echo "No IPA path is given"
  exit 1
fi

if [[ ! -f "$IPA_PATH" ]]; then
  echo "IPA $IPA_PATH does not exist"
  exit 1
fi

pushd $DIR
# use google cloud instead of checking in IPA file
# cp -f $IPA_PATH $DESTINATION

echo GOOGLE_APPLICATION_CREDENTIALS=$DIR/credentials.json node upload.js "$IPA_PATH" "$DESTINATION"
popd

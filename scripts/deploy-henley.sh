#!/bin/bash
IPA_PATH=$1
DESTINATION=/Volumes/Kingston/git/chowkapo.bitbucket.io/henley/henley.ipa
DATE=$(date +%Y%m%d-%H%M)
DATEDISPLAY=$(date +'%Y-%m-%d %H:%M')
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

GOOGLE_APPLICATION_CREDENTIALS=$DIR/credentials.json node upload.js "$IPA_PATH" "$( basename $DESTINATION )"
popd

pushd "$( dirname "$DESTINATION" )"
pwd
ls -l
jq ".ios.updated=\"$DATEDISPLAY\"" app.json > app-$DATE.json
mv app-$DATE.json app.json
git commit -m "app deployed $DATEDISPLAY" .
git push

popd

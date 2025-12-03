#!/bin/bash

set -o pipefail

# use command-line argument "--deploy" to include deployment after build
to_deploy=0

for arg in "$@"; do
	case $arg in
		--deploy)
			to_deploy=1
			;;
	esac
done

echo "Unlock keychain to sign codes"
security unlock-keychain -p "$KEY_CHAIN_UNLOCK_PASSWORD"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DATE=$(date +%Y%m%d-%H%M)
DATEDISPLAY=$(date +'%Y-%m-%d %H:%M')
APP=GreenwichApp
APP_FOLDER=GreenwichApp
pushd $DIR

cd ..
mkdir -p builds/$APP-$DATE

cd mobile/$APP_FOLDER
xcodebuild -workspace ios/$APP.xcworkspace/ -scheme $APP -destination 'generic/platform=iOS' build -allowProvisioningUpdates -showBuildTimingSummary
if [[ $? -ne 0 ]]; then
  echo "❌ xcodebuild failed!"
  exit 1
fi

xcodebuild -workspace ios/$APP.xcworkspace/ -scheme $APP -sdk iphoneos -configuration Release archive -archivePath ../../builds/$APP-$DATE/app.xcarchive -allowProvisioningUpdates -showBuildTimingSummary
if [[ $? -ne 0 ]]; then
  echo "❌ xcodebuild failed!"
  exit 1
fi

cat > ../../builds/ExportOptions.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>compileBitcode</key>
	<false/>
	<key>destination</key>
	<string>export</string>
	<key>method</key>
	<string>release-testing</string>
	<key>signingStyle</key>
	<string>automatic</string>
	<key>stripSwiftSymbols</key>
	<true/>
	<key>teamID</key>
	<string>6GAM4N9LG4</string>
	<key>thinning</key>
	<string>&lt;none&gt;</string>
</dict>
</plist>
EOF

xcodebuild -exportArchive -archivePath ../../builds/$APP-$DATE/app.xcarchive -exportOptionsPlist ../../builds/ExportOptions.plist -exportPath ../../builds/$APP-$DATE

if [[ -f ../../builds/$APP-$DATE/GreenwichApp.ipa ]]; then
	echo "IPA generated successfully"
	if [ "$to_deploy" -eq 1 ]; then
		echo "Deployment will now proceed"
		cd $DIR
		./deploy-greenwich.sh ../builds/$APP-$DATE/$APP.ipa
	else
		cd $DIR
		echo "No deployment will be performed. IPA found below:"
		ls -l "../builds/$APP-$DATE/$APP.ipa"
		echo "To deploy, run \"./deploy.sh ../builds/$APP-$DATE/$APP.ipa\""
	fi
else
	echo "No IPA is exported. Please check log messages"
fi

popd


#!/bin/bash
#
#install jq before run this script (apt install jq)
#
BRANCH=${PWD##*/}
mkdir ../_ext/ > /dev/null 2>&1
cd ../_ext/
rm -rf $BRANCH/
cp -fr ../$BRANCH $BRANCH/
cd ./$BRANCH/
rm -rf themes-src/
rm -rf dropfeeds.code-workspace
rm -rf README.md
rm -rf makeExt.sh
rm -rf eslint.sh
rm -rf .git/
rm -rf .vscode/
rm -rf .eslintrc.json
rm -rf .gitignore
VERSION=$(jq -r '.version' manifest.json)
rm -rf ../drop_feeds-$VERSION.zip
zip -r ../drop_feeds-$VERSION.zip * >/dev/null
cd ..
cd ../$BRANCH/
echo "Extension created"

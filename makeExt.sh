#!/bin/bash
#
#install jq before run this script (apt install jq)
#
NAME=drop_feeds
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
rm -rf ../$NAME-$VERSION.zip
zip -r ../$NAME-$VERSION.zip * >/dev/null
cd ..
cd ../$BRANCH/
echo "Extension created"

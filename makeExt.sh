#!/bin/bash
BRANCH=${PWD##*/}
mkdir ../_ext/  >/dev/null
cd ../_ext/
rm -rf $BRANCH/
cp -fr ../$BRANCH $BRANCH/
cd ./$BRANCH/
rm -rf resources/resources-src/
rm -rf dropfeeds.code-workspace
rm -rf README.md
rm -rf makeExt.sh
rm -rf .git/
rm -rf .vscode/
rm -rf .eslintrc.json
rm -rf .gitignore
zip -r ../$BRANCH.zip * >/dev/null
cd ..
cp -fr $BRANCH.zip drop-feeds.zip
cd ../$BRANCH/

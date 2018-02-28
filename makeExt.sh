#!/bin/bash
BRANCH=${PWD##*/}
rm -rf ../$BRANCH-ext/
cp -fr . ../$BRANCH-ext/
rm -rf ../$BRANCH-ext/resources/resources-src/
rm -rf ../$BRANCH-ext/dropfeeds.code-workspace
rm -rf ../$BRANCH-ext/README.md
rm -rf ../$BRANCH-ext/.git/
rm -rf ../$BRANCH-ext/.vscode/
rm -rf ../$BRANCH-ext/.eslintrc.json
rm -rf ../$BRANCH-ext/.gitignore
cd ../$BRANCH-ext/
zip -r ../$BRANCH.zip *
cd ..
cp -fr $BRANCH.zip drop-feeds.zip
rm -rf $BRANCH-ext/

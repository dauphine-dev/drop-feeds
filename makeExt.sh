#!/bin/bash
#
#install jq before run this script (apt install jq   or   https://stedolan.github.io/jq/download/)
#
NAME=drop_feeds
BRANCH=${PWD##*/}
INITIAL_DIR=${PWD}
#update files list
for d in $INITIAL_DIR/themes/*/ ; do
    cd $d
    find . ! -name '*.list' -type f >files.list
done
for d in $INITIAL_DIR/themes/_renderTab/*/ ; do
    cd $d
    find . ! -name '*.list' -type f >files.list
done
for d in $INITIAL_DIR/themes/_renderTab/_templates/*/ ; do
    cd $d
    find . ! -name '*.list' -type f >files.list
done
for d in $INITIAL_DIR/themes/_editor/*/ ; do
    cd $d
    find . ! -name '*.list' -type f >files.list
done
cd $INITIAL_DIR
rm -rf themes/_renderTab/files.list
rm -rf themes/_renderTab/_templates/_any/files.list
rm -rf themes/_renderTab/_templates/_error/files.list
rm -rf themes/_templates/files.list
rm -rf themes/_editor/files.list
rm -rf themes/_export/files.list
#create a working folder in parent directory named '_ext'
mkdir ../_ext/ > /dev/null 2>&1
#copy all files in the working folder
cd $INITIAL_DIR
cd ../_ext/
rm -rf $BRANCH/
cp -fr $INITIAL_DIR $BRANCH/
#cleanup unnecessary files
cd $INITIAL_DIR
cd ../_ext/$BRANCH
rm -rf themes-src/
rm -rf dropfeeds.code-workspace
rm -rf README.md
rm -rf *.sh
rm -rf .git/
rm -rf .vscode/
rm -rf .eslintrc.json
rm -rf .gitignore
#zip files
cd $INITIAL_DIR
cd ../_ext/$BRANCH
VERSION=$(jq -r '.version' manifest.json)
rm -rf ../$NAME-$VERSION.zip
zip -r ../$NAME-$VERSION.zip * >/dev/null
#finishing...
cd $INITIAL_DIR
echo "Extension created"

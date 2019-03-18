#/bin/sh
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

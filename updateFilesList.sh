#/bin/sh
NAME=drop_feeds
BRANCH=${PWD##*/}
CUR_DIR=${PWD}
#update files list
for d in $CUR_DIR/themes/*/ ; do
    cd $d
    find . -type f >files.list
done
for d in $CUR_DIR/themes/_renderTab/*/ ; do
    cd $d
    find . -type f >files.list
done
for d in $CUR_DIR/themes/_renderTab/_templates/*/ ; do
    cd $d
    find . -type f >files.list
done
cd $CUR_DIR
rm -rf themes/_renderTab/files.list
rm -rf themes/_renderTab/_templates/_any/files.list
rm -rf themes/_renderTab/_templates/_error/files.list
rm -rf themes/_templates/files.list

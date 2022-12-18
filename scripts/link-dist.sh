CWD="${HOME}/${SOURCE:-github.com}/Duxxie/platform"

SOURCE="${PWD}/dist"
TARGET="${PWD}/test/dialogic-js"

rm -rf ${TARGET}
ln -s ${SOURCE} ${TARGET}
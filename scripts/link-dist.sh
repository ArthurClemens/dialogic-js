
SOURCE="${PWD}/dist"
TARGET="${PWD}/test/dialogic-js"

rm -rf ${TARGET}
ln -s ${SOURCE} ${TARGET}
rm -f "${TARGET}"/*.d.ts
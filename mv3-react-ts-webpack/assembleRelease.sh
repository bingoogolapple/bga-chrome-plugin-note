#!/usr/bin/env bash

yarn build
rm ./build/*.map
rm ./build/*/*/*.map
rm ./build/*/*/*.LICENSE.txt

cp -r ./build ./mv3-react-ts-webpack
zip -qr mv3-react-ts-webpack.zip ./mv3-react-ts-webpack
rm -rf ./mv3-react-ts-webpack
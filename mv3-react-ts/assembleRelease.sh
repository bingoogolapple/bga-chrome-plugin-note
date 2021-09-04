#!/usr/bin/env bash

yarn build
rm ./build/*.map
rm ./build/*/*/*.map
rm ./build/*/*/*.LICENSE.txt
zip -qr build.zip ./build

#!/usr/bin/env bash

pnpm release
rm ./dist/*.map
rm ./dist/*/*.map

cp -r ./dist ./mv3-react-ts-vite
zip -qr mv3-react-ts-vite.zip ./mv3-react-ts-vite
rm -rf ./mv3-react-ts-vite
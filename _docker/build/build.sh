#!/usr/bin/env sh

echo BUILD START - REACT

cd ./source

echo +++ NPM INSTALL +++
npm install

echo +++ REACT BUILD +++
npm run build

echo BUILD END - REACT

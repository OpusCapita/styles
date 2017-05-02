#!/bin/sh  a href="../../

rm -rf .gh-pages-tmp build  &&
mkdir .gh-pages-tmp &&
npm run build-less &&
npm run npm-build &&
cp -R build/client/* .gh-pages-tmp &&
rm -rf .gh-pages-tmp/resources/less  &&
sed -i -e "s/url('../url('resources/g" .gh-pages-tmp/main.css &&
sed -i -e "s/src=\"..\//src=\"resources\//g" .gh-pages-tmp/*.html &&
sed -i -e "s/src=\"..\/..\/img\//src=\"..\/..\/resources\/img\//g" .gh-pages-tmp/demo/html/*.html 
sed -i -e "s/href=\"..\/..\/\"/href=\"..\/..\/index.html\"/g" .gh-pages-tmp/demo/html/*.html 


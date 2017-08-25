#!/bin/sh

sed -i '' -e "s/url(\"img/url(\"resources\/img/g" dist/npm/index.css &&
sed -i '' -e "s/url('../url('resources/g" dist/npm/index.css &&

sed -i '' -e "s/src=\"..\//src=\"resources\//g" dist/npm/*.html &&
sed -i '' -e "s/src=\"..\/..\/img\//src=\"..\/..\/resources\/img\//g" dist/npm/demo/html/*.html
sed -i '' -e "s/href=\"..\/..\/\"/href=\"..\/..\/index.html\"/g" dist/npm/demo/html/*.html

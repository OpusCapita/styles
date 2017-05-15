#!/bin/sh

sed -i -e "s/url(\"img/url(\"resources\/img/url(/g" main.css &&
sed -i -e "s/src=\"..\//src=\"resources\//g" dist/*.html &&
sed -i -e "s/src=\"..\/..\/img\//src=\"..\/..\/resources\/img\//g" dist/demo/html/*.html
sed -i -e "s/href=\"..\/..\/\"/href=\"..\/..\/index.html\"/g" dist/demo/html/*.html

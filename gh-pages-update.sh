#!/bin/sh

rm -rf .gh-pages-tmp build &&
mkdir .gh-pages-tmp &&
npm run build-less &&
npm run npm-build &&
cp -R build/client/* .gh-pages-tmp &&
rm -rf .gh-pages-tmp/resources/less &&
sed -i -e "s/url('../url('resources/g" .gh-pages-tmp/main.css &&
sed -i -e "s/src=\"..\//src=\"resources\//g" .gh-pages-tmp/*.html &&
sed -i -e "s/src=\"..\/..\/img\//src=\"..\/..\/resources\/img\//g" .gh-pages-tmp/demo/html/*.html &&
sed -i -e "s/href=\"..\/..\/\"/href=\"..\/..\/index.html\"/g" .gh-pages-tmp/demo/html/*.html &&

git checkout gh-pages &&
git reset --hard &&
git pull &&
git ls-files | grep -v -e "\(^\.gitignore$\|^\.gitattributes$\|^\.gh-pages-tmp$\)" | xargs rm -rf &&
find . -type d -empty -delete &&
mv .gh-pages-tmp/* . &&
rm -rf .gh-pages-tmp &&
git add -A . &&
git commit -m "Update gh-pages" &&
git push --force origin gh-pages &&
git checkout master

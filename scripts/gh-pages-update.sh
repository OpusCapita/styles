#!/bin/sh

rm -rf .gh-pages-tmp build &&
mkdir .gh-pages-tmp &&
npm run build-less &&
npm run application-build &&
cp -R dist/application/client/* .gh-pages-tmp &&
rm -rf .gh-pages-tmp/less &&

git checkout gh-pages &&
git reset --hard &&
git pull &&
git ls-files | grep -v -e "\(^\.gitignore$\|^\.gitattributes$\|^\.gh-pages-tmp$\)" | xargs rm -rf &&
rm -rf demo &&
mv .gh-pages-tmp/* . &&
rm -rf .gh-pages-tmp &&
git add -u . &&
git add -A ./demo /css /fonts /img &&
git commit -m "Update gh-pages" &&
# git push --force origin gh-pages &&
git checkout master

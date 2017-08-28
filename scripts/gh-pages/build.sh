#!/bin/sh

npm start compile-css &&
rm -rf .gh-pages-tmp &&
mkdir .gh-pages-tmp &&
cp -R dist/css/* .gh-pages-tmp
cp -R src/client/* .gh-pages-tmp

# rm -rf .gh-pages-tmp/less &&
#
# git checkout gh-pages &&
# git reset --hard &&
# git pull &&
# git ls-files | grep -v -e "\(^\.gitignore$\|^\.gitattributes$\|^\.gh-pages-tmp$\)" | xargs rm -rf &&
# rm -rf demo &&
# mv .gh-pages-tmp/* . &&
# rm -rf .gh-pages-tmp &&
# git add -u . &&
# git add -A ./demo /css /fonts /img &&
# git commit -m "Update gh-pages" &&
# # git push --force origin gh-pages &&
# git checkout master

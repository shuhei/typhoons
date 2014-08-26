#!/usr/bin/env bash
set -e

rm -rf _deploy
git clone -b gh-pages --single-branch git@github.com:shuhei/typhoons.git _deploy

gulp clean
gulp build
pushd _deploy
git rm -rf .
cp -r ../public/* ./
git add -A
git commit -m "Update at `date`."
git push origin gh-pages
popd

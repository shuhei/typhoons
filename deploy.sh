#!/usr/bin/env bash
set -e

gulp clean
gulp build
pushd _deploy
git rm -rf .
cp -r ../public/* ./
git add -A
git commit -m "Update at `date`."
git push origin gh-pages
popd

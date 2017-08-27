#!/bin/bash

cat PID | xargs kill
git pull
npm install || true
browserify public/javascripts/ensutils.js --s ensDappStart > public/javascripts/dist.js
nohup npm start 2>&1 >> run.log &

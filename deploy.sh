#!/bin/bash

#browserify public/javascripts/ensutils.js --s ensDappStart > public/javascripts/dist.js
git add .
git commit -m "auto"
git push
ssh root@47.74.129.237 <<START
cd /root/workspace/eth-cms
sh run.sh
START

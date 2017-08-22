#!/bin/bash

git add .
git commit -m "auto"
git push
ssh root@47.74.129.237 <<START
cd /root/worksapce/nodercms
sh run.sh
START

#!/bin/bash

cat PID | xargs kill
git pull
npm install || true

nohup npm start 2>&1 >> run.log &

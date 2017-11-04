#!/bin/bash

cat PID | xargs kill
git pull
npm install || true

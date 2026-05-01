#!/bin/sh

# build frontend
cd frontend
npm install
npm run build

# start backend
cd ../backend
npm install
npm run start
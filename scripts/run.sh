#!/bin/bash

# Start mognodb server
mongod --port 27017 --dbpath ./database --smallfiles

# Clear db 
mongo charades_label --eval "db.dropDatabase()"

# Start server 
cd ../
nodemon index.js
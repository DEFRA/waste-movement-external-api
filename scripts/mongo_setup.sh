#!/bin/bash
set -e

# Start MongoDB in the background with replica set configuration
mongod --replSet rs0 --bind_ip_all --dbpath /data/db &
MONGO_PID=$!

# Brief wait for mongod to start accepting connections
sleep 3

# Initialize the replica set (idempotent - safe to run multiple times)
mongosh --quiet --eval "
  try {
    rs.status();
  } catch(err) {
    if (err.codeName === 'NotYetInitialized') {
      rs.initiate({
        _id: 'rs0',
        members: [{ _id: 0, host: 'mongodb:27017' }]
      });
    }
  }
"

# Keep the script running
wait $MONGO_PID
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

# Insert test client data
mongosh --quiet --eval "
  const db = db.getSiblingDB('dwt-client-sync');
  db.clients.insertMany([
    {
      clientName: 'Test Client 1',
      clientId: '7g31h2mmo7b4ncjav6icb4ekfm',
      tenantServiceName: 'waste-movement-backend'
    },
    {
      clientName: 'Test Client 2',
      clientId: '1tspaa2pb2cs1t1skbdi5fap8e',
      tenantServiceName: 'waste-movement-backend'
    }
  ]);
"

# Keep the script running
wait $MONGO_PID

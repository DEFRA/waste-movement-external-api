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
  // Upsert so restarting with an existing volume doesn't hit the unique
  // index dwt-client-sync creates on tenantServiceName and clientId
  [
  {
    clientName: 'Test Client 1',
    clientId: '1234567890abcdef1234567890',
    tenantServiceName: 'waste-movement-external-api'
  },
  {
    clientName: 'Test Client 2',
    clientId: '0987654321fedcba0987654321',
    tenantServiceName: 'waste-movement-external-api'
  },
  {
    clientName: 'Test Client 3',
    clientId: 'abcdefghijklmnopqrstuvwxyz',
    tenantServiceName: 'waste-movement-external-api'
  }
  ].forEach((client) =>
    db.clients.updateOne(
      { tenantServiceName: client.tenantServiceName, clientId: client.clientId },
      { \$set: client },
      { upsert: true }
    )
  );
"

# Keep the script running
wait $MONGO_PID

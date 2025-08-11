# JWT Authentication Testing Guide

This document provides instructions on how to test the JWT authentication implementation in the Waste Movement External API.

## Prerequisites

- The API server is running
- You have a tool to make HTTP requests (e.g., curl, Postman)

## JWT Token Generation

For testing purposes, you can generate a JWT token with the required `client_id` claim using the instructions provided in the CDP Portal:

https://portal.cdp-int.defra.cloud/documentation/how-to/apis.md#what-are-the-login-urls-for-my-api-

## Testing Endpoints

### 1. Health Check (No Authentication Required)

```bash
curl -X GET http://localhost:3001/health
```

Expected response:

```json
{
  "message": "success"
}
```

### 2. Authentication Test Endpoint

```bash
curl -X GET http://localhost:3001/auth/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:

```json
{
  "authenticated": true,
  "clientId": "test-client-123"
}
```

### 3. Create Receipt Movement (Authentication Required)

```bash
curl -X POST http://localhost:3001/movements/receive \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "your": "payload",
    "according": "to",
    "schema": "requirements"
  }'
```

### 4. Update Receipt Movement (Authentication Required)

```bash
curl -X PUT http://localhost:3001/movements/some-tracking-id/receive \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "your": "payload",
    "according": "to",
    "schema": "requirements"
  }'
```

## Testing Authentication Failures

### 1. Missing Token

```bash
curl -X GET http://localhost:3001/auth/test
```

Expected response: 401 Unauthorized

### 2. Invalid Token

```bash
curl -X GET http://localhost:3001/auth/test \
  -H "Authorization: Bearer invalid.token.here"
```

Expected response: 401 Unauthorized

### 3. Token Without client_id

Generate a token without the `client_id` claim and test:

```bash
curl -X GET http://localhost:3001/auth/test \
  -H "Authorization: Bearer TOKEN_WITHOUT_CLIENT_ID"
```

Expected response: 401 Unauthorized

## Troubleshooting

- Ensure the token hasn't expired (if you've set an expiration time).
- Check the server logs for more detailed error messages.

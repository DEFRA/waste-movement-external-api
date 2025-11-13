# Waste Movement External API

External-facing REST API service for recording and managing waste movement receipts. This service allows carriers, receivers, and other authorised parties to create and update waste movement records as part of DEFRA's waste tracking system.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Development](#development)
  - [Available Scripts](#available-scripts)
  - [Running Tests](#running-tests)
  - [Code Quality](#code-quality)
  - [MongoDB Locks](#mongodb-locks)
  - [Proxy Configuration](#proxy-configuration)
- [Environments](#environments)
- [Docker](#docker)
- [CI/CD](#cicd)
- [Additional Resources](#additional-resources)
- [Updating Dependencies](#updating-dependencies)
- [Licence](#licence)

## Overview

The Waste Movement External API provides endpoints for:

- **Creating waste movement receipts** when waste is received by a facility
- **Updating existing movements** with waste tracking IDs
- **Accessing reference data** (EWC codes, disposal/recovery codes, hazardous property codes, container types, POP names)

This service integrates with DEFRA's waste tracking infrastructure to generate unique tracking IDs and persist movement data.

## Key Features

- JWT-based authentication via AWS Cognito
- Comprehensive request validation using Joi schemas
- OpenAPI/Swagger documentation available at `/documentation`
- MongoDB-backed persistence with distributed locking
- CloudWatch metrics and distributed tracing
- Full test coverage with Jest

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Hapi.js
- **Database**: MongoDB
- **Authentication**: JWT with AWS Cognito
- **Validation**: Joi
- **Testing**: Jest
- **Logging**: Pino with ECS format
- **API Docs**: Swagger/OpenAPI (hapi-swagger)

## Prerequisites

- Node.js (see .nvmrc for required version, use [nvm](https://github.com/creationix/nvm) for version management)
- npm
- Docker and Docker Compose (for local development)

## Getting Started

### 1. Clone and Install

```bash
cd waste-movement-external-api
nvm use
npm install
```

### 2. Local Development with Docker Compose

Start the full local environment (includes LocalStack and MongoDB):

```bash
docker compose up --build -d
```

The API will be available at `http://localhost:3001`

### 3. Development Without Docker

Run the service directly with watch mode:

```bash
npm run dev
```

Note: You'll need to configure MongoDB and other dependencies manually.

### 4. Verify Setup

Check the health endpoint:

```bash
curl http://localhost:3001/health
```

Access Swagger documentation at: `http://localhost:3001/documentation`

## Authentication

### JWT Authentication (Production)

The API uses JWT tokens issued by AWS Cognito. To access authenticated endpoints:

1. **Obtain a token** from the [CDP Portal](https://cdp-portal.defra.gov.uk)
2. **Include the token** in the Authorization header:

```bash
curl -X POST http://localhost:3001/movements/receive \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

### Local Development

JWT authentication is **disabled by default** in local environments. You can test endpoints without tokens.

For detailed JWT authentication testing instructions, see [JWT_AUTHENTICATION_TESTING.md](./JWT_AUTHENTICATION_TESTING.md).

## API Endpoints

### Movement Endpoints (Require Authentication)

| Method | Endpoint                               | Description                                 |
| :----- | :------------------------------------- | :------------------------------------------ |
| `POST` | `/movements/receive`                   | Create a new waste movement receipt         |
| `PUT`  | `/movements/{wasteTrackingId}/receive` | Update an existing receipt with tracking ID |

### Reference Data Endpoints

| Method | Endpoint                                     | Description                        |
| :----- | :------------------------------------------- | :--------------------------------- |
| `GET`  | `/reference-data/ewc-codes`                  | European Waste Catalogue codes     |
| `GET`  | `/reference-data/disposal-or-recovery-codes` | Treatment disposal/recovery codes  |
| `GET`  | `/reference-data/hazardous-property-codes`   | Hazardous waste property codes     |
| `GET`  | `/reference-data/container-types`            | Waste container type options       |
| `GET`  | `/reference-data/pop-names`                  | Persistent Organic Pollutant names |

### Utility Endpoints

| Method | Endpoint     | Description                             |
| :----- | :----------- | :-------------------------------------- |
| `GET`  | `/health`    | Health check (no authentication)        |
| `GET`  | `/auth/test` | JWT authentication test (non-prod only) |

### API Documentation

Interactive API documentation with request/response examples is available at:

```
http://localhost:3001/documentation
```

## Development

### Available Scripts

```bash
# Development
npm run dev              # Run with watch mode
npm run dev:debug        # Run with debugger

# Testing
npm test                 # Run all tests with coverage
npm run test:watch       # Watch mode for TDD

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Prettier
npm run format:check     # Check formatting

# Production
npm start                # Start production server
```

### Running Tests

Run unit tests:

```bash
npm test
```

Run integration tests (requires Docker Compose):

```bash
docker compose up -d
npm run test:integration
```

### Code Quality

This project follows DEFRA code standards. Before committing:

- Code is automatically formatted with Prettier
- ESLint checks are run via Husky pre-commit hooks
- PRs must pass all tests and linting checks

### MongoDB Locks

For distributed write operations, use MongoDB locks via `server.locker`:

```javascript
async function doStuff(server) {
  await using lock = await server.locker.lock('unique-resource-name')

  if (!lock) {
    // Lock unavailable
    return
  }

  // do stuff
  // lock automatically released
}
```

Helper methods available in `src/common/helpers/mongo-lock.js`.

### Proxy Configuration

The service uses a forward proxy (configured via `GLOBAL_AGENT`). HTTP clients using `undici`, `@hapi/wreck`, or `axios` automatically use the proxy.

For custom HTTP clients:

```javascript
import { ProxyAgent } from 'undici'

await fetch(url, {
  dispatcher: new ProxyAgent({
    uri: proxyUrl,
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10
  })
})
```

## Environments

The service supports multiple environments:

- `local` - Local development (auth disabled)
- `dev` - Development environment
- `test` - Testing environment
- `perf-test` - Performance testing
- `ext-test` - External testing
- `prod` - Production

Configuration is managed via Convict in `src/config.js`.

## Docker

### Build Development Image

```bash
docker build --target development --tag waste-movement-external-api:dev .
```

### Build Production Image

```bash
docker build --tag waste-movement-external-api:latest .
```

### Docker Compose

Local environment includes LocalStack (AWS services) and MongoDB:

```bash
docker compose up --build -d
docker compose down
```

## CI/CD

GitHub Actions workflows automate:

- **Pull Request Checks**: Formatting, linting, tests, Docker build, SonarCloud scan
- **Publishing**: Automatic builds and deployments to AWS ECR on merge to main
- **Hotfix Deployments**: Expedited deployment workflow for urgent fixes

SonarCloud integration provides code quality and test coverage analysis.

## Additional Resources

- [JWT Authentication Testing Guide](./JWT_AUTHENTICATION_TESTING.md)
- [API Documentation (Swagger)](http://localhost:3001/documentation) - when running locally
- [SonarCloud Project](https://sonarcloud.io/project/overview?id=DEFRA_waste-movement-external-api)

## Updating Dependencies

Use [npm-check-updates](https://github.com/raineorshine/npm-check-updates):

```bash
ncu --interactive --format group
```

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government licence v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

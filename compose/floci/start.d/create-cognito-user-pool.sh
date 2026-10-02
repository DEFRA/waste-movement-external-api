#!/bin/sh
# Creates the local Cognito user pool that the external API trusts, with the
# seeded "Test Client" ids from compose/mongo_setup.sh as app clients.
# Floci keeps the pool (and its signing key) on the floci-data volume, so this
# only does anything on the first start.
set -e

POOL_ID=eu-west-2_LOCAL
SCOPE_SERVER=waste-movement-external-api-resource-srv

if aws cognito-idp describe-user-pool --user-pool-id "$POOL_ID" >/dev/null 2>&1; then
  echo "Cognito user pool $POOL_ID already exists"
  exit 0
fi

# floci:* tags pin the pool id, use each client's name as its id and give
# every client the secret "local"
aws cognito-idp create-user-pool \
  --pool-name waste-movement-local \
  --user-pool-tags "{\"floci:override-id\":\"$POOL_ID\",\"floci:override-cognito-client-id\":\"use-name\",\"floci:override-cognito-client-secret\":\"local\"}"

aws cognito-idp create-resource-server \
  --user-pool-id "$POOL_ID" \
  --identifier "$SCOPE_SERVER" \
  --name "$SCOPE_SERVER" \
  --scopes ScopeName=access,ScopeDescription=access

for client_id in 1234567890abcdef1234567890 0987654321fedcba0987654321 abcdefghijklmnopqrstuvwxyz; do
  aws cognito-idp create-user-pool-client \
    --user-pool-id "$POOL_ID" \
    --client-name "$client_id" \
    --generate-secret \
    --allowed-o-auth-flows client_credentials \
    --allowed-o-auth-scopes "$SCOPE_SERVER/access" \
    --allowed-o-auth-flows-user-pool-client
done

echo "Created Cognito user pool $POOL_ID"

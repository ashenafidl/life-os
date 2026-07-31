#!/bin/sh
set -e

node dist/db/migrate.js

echo "Seeding reference data..."
node dist/db/seed.js

echo "Starting server..."
exec node server.js
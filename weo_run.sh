#!/bin/bash
# Check if the correct number of arguments are provided
if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <app_version>"
    exit 1
fi

APP_VERSION=$1
echo "Starting app version: $APP_VERSION"
# Set environment variables based on the app version
if [ "$APP_VERSION" = "v1" ]; then
    echo "Setting environment variables for v1"
    export NODE_ENV=production
    export DB_NAME=WEODB
    export PORT=4000
    # add more environment variables for this version as needed
elif [ "$APP_VERSION" = "v2" ]; then
    echo "Setting environment variables for v2"
    export NODE_ENV=production
    export DB_NAME=WEODBV2
    export PORT=4001
    # add more environment variables for this version as needed
else
    echo "Unknown app version: $APP_VERSION"
    exit 1
fi

# Run the Node.js app
rm -rf dist && npx tsc && pm2 -f dist/index.js --name weo-api-$APP_VERSION

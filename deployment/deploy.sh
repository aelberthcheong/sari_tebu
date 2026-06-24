#!/usr/bin/env bash
set -e
PROJECT_DIR="/home/akunsialbert/Projects/Sari-Tebu"
BACKEND_DIR="$PROJECT_DIR/backend"

cd $BACKEND_DIR

git -C $PROJECT_DIR pull
BUILD_VERSION=$(git -C $PROJECT_DIR rev-parse HEAD)

echo "$(date --utc +%FT%TZ): Releasing new server version. $BUILD_VERSION"
OLD_CONTAINER=$(docker ps -q --filter "name=server")

echo "$(date --utc +%FT%TZ): Running Build..."
docker compose build

echo "$(date --utc +%FT%TZ): Scaling server up..."
docker compose up -d --no-deps --scale server=2 --no-recreate server

sleep 30

echo "$(date --utc +%FT%TZ): Scaling old server down..."
docker container rm -f $OLD_CONTAINER

docker compose up -d --no-deps --scale server=1 --no-recreate server
echo "$(date --utc +%FT%TZ): Done."
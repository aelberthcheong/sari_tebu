#!/usr/bin/env bash
PROJECT_DIR="/home/akunsialbert/Projects/Sari-Tebu"
BACKEND_DIR="$PROJECT_DIR/backend"

cd $BACKEND_DIR

git -C $PROJECT_DIR pull
BUILD_VERSION=$(git -C $PROJECT_DIR rev-parse HEAD)
echo "$(date --utc +%FT%TZ): Releasing new server version. $BUILD_VERSION"
echo "$(date --utc +%FT%TZ): Running Build..."
docker compose rm -f
docker compose build
OLD_CONTAINER=$(docker ps -aqf "name=sari-tebu-server")
echo "$(date --utc +%FT%TZ): Scaling server up..."
BUILD_VERSION=$BUILD_VERSION docker compose up -d --no-deps --scale server=2 --no-recreate server
sleep 30
echo "$(date --utc +%FT%TZ): Scaling old server down..."
docker container rm -f $OLD_CONTAINER
docker compose up -d --no-deps --scale server=1 --no-recreate server
echo "$(date --utc +%FT%TZ): Reloading caddy..."
CADDY_CONTAINER=$(docker ps -aqf "name=sari-tebu-caddy")
docker exec $CADDY_CONTAINER caddy reload -c /etc/caddy/Caddyfile
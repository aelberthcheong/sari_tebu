#!/usr/bin/env bash
set -e
SARI_TEBU_DIR="/home/akunsialbert/Projects/Sari-Tebu"

echo "$(date --utc +%FT%TZ): Fetching remote repository..."
git -C $SARI_TEBU_DIR fetch origin

UPSTREAM=${1:-'@{u}'}                # HEAD refererence commit pada upstream
LOCAL=$(git rev-parse @)             # HEAD local main branch
REMOTE=$(git rev-parse "$UPSTREAM")  # HEAD remote main branch
BASE=$(git merge-base @ "$UPSTREAM") # Latest commit yang local dan remote memiliki base commit nya sama

if [ $LOCAL = $REMOTE ]; then
    echo "$(date --utc +%FT%TZ): No changes detected in git"
    exit 0
fi

if [ $REMOTE = $BASE ]; then
    echo "$(date --utc +%FT%TZ): Local changes detected, stashing"
    git -C $SARI_TEBU_DIR stash
fi

git -C $SARI_TEBU_DIR clean -fd
git -C $SARI_TEBU_DIR reset --hard origin/main

BUILD_VERSION=$(git -C $SARI_TEBU_DIR rev-parse HEAD)
echo "$(date --utc +%FT%TZ): Changes detected, deploying new version: $BUILD_VERSION"

OLD_SERVER_CONTAINERS=$(docker ps -q --filter "name=sari-tebu-production-server")
OLD_FRONTEND_CONTAINERS=$(docker ps -q --filter "name=sari-tebu-production-frontend")

echo "$(date --utc +%FT%TZ): Running Build..."
make build

echo "$(date --utc +%FT%TZ): Scaling up..."
make scale-up
sleep 30

echo "$(date --utc +%FT%TZ): Scaling old containers down..."
if [ -n "$OLD_SERVER_CONTAINERS" ]; then
    docker container rm -f $OLD_SERVER_CONTAINERS
fi
if [ -n "$OLD_FRONTEND_CONTAINERS" ]; then
    docker container rm -f $OLD_FRONTEND_CONTAINERS
fi
make scale-down

echo "$(date --utc +%FT%TZ): Performing migrations..."
make migrate

echo "$(date --utc +%FT%TZ): Done."
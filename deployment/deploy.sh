#!/usr/bin/env bash

set -e

# Pastikan berada pada Project root directory terlebih dahulu
cd /home/akunsialbert/Projects/sari_tebu

echo "$(date --utc +%FT%TZ): Fetching remote repository..."
git fetch origin

upstream=${1:-'@{u}'}                # HEAD refererence commit pada upstream
local=$(git rev-parse @)             # HEAD local main branch
remote=$(git rev-parse "$upstream")  # HEAD remote main branch
base=$(git merge-base @ "$upstream") # Latest commit yang local dan remote memiliki base commit nya sama

if [ $local = $remote ]; then
    echo "$(date --utc +%FT%TZ): No changes detected in git"
    exit 0
fi

if [ $remote = $base ]; then
    echo "$(date --utc +%FT%TZ): local changes detected, stashing"
    git stash
fi

# Hapus semua untracked files
git clean -fd
git reset --hard origin/main

build_version=$(git rev-parse HEAD)
echo "$(date --utc +%FT%TZ): Changes detected, deploying new version: $build_version"

pushd deployment > /dev/null

id_api_container_lama=$(docker ps -q --filter "name=sari-tebu-production-api")
id_web_container_lama=$(docker ps -q --filter "name=sari-tebu-production-web")

echo "$(date --utc +%FT%TZ): Running Build..."
make build

echo "$(date --utc +%FT%TZ): Scaling up..."
make scale-up

echo "$(date --utc +%FT%TZ): Waiting for new containers to become healthy..."

# Loop maksimum 16 kali x 5 detik = 90 detik total timeout
# Jika melewati maka exit
timeout_rounds=16
while [ $timeout_rounds -gt 0 ]; do
    unhealthy=$(docker ps --filter "name=sari-tebu-production-api" --filter "name=sari-tebu-production-web" --filter "health=unhealthy" -q)
    if [ -n "$unhealthy" ]; then
        echo "$(date --utc +%FT%TZ): New container reported UNHEALTHY, aborting deployment"
        docker ps --filter "name=sari-tebu-production-api" --filter "name=sari-tebu-production-web" --filter "health=unhealthy"
        exit 1
    fi

    if ! docker ps --filter "name=sari-tebu-production-api" --filter "name=sari-tebu-production-web" --filter "health=starting" | grep -q "starting"; then
        echo "$(date --utc +%FT%TZ): New containers are healthy!"
        break
    fi

    sleep 5
    timeout_rounds=$((timeout_rounds - 1))
done

if [ $timeout_rounds -eq 0 ]; then
    echo "$(date --utc +%FT%TZ): Healthcheck timeout reached, aborting deployment"
    exit 1
fi

echo "$(date --utc +%FT%TZ): Scaling old containers down..."
if [ -n "$id_api_container_lama" ]; then
    docker container rm -f "$id_api_container_lama"
fi
if [ -n "$id_web_container_lama" ]; then
    docker container rm -f "$id_web_container_lama"
fi

make scale-down

echo "$(date --utc +%FT%TZ): Done."

popd > /dev/null
#!/usr/bin/env bash

set -e
project_dir="/home/akunsialbert/Projects/Sari-Tebu"

echo "$(date --utc +%FT%TZ): Fetching remote repository..."
git -C $project_dir fetch origin

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
    git -C $project_dir stash
fi

#
# Hapus semua untracked files
#
git -C $project_dir clean -fd
git -C $project_dir reset --hard origin/main

build_version=$(git -C $project_dir rev-parse HEAD)
echo "$(date --utc +%FT%TZ): Changes detected, deploying new version: $build_version"

#
# Jalankan migrasi sebelum container baru running agar versi baru 
# kode aplikasi tidak pakai schema lama.
# 
# kalau gagal, tampilkan error log tapi jangan hentikan deployment
#
echo "$(date --utc +%FT%TZ): Performing pending migrations on new version: $build_version"
if make -C $project_dir migrate; then
    echo "$(date --utc +%FT%TZ): Database migration completed successfully"
else 
    echo "$(date --utc +%FT%TZ): Database migration FAILED!"
fi

id_server_container_lama=$(docker ps -q --filter "name=sari-tebu-production-server")
id_frontend_container_lama=$(docker ps -q --filter "name=sari-tebu-production-frontend")

echo "$(date --utc +%FT%TZ): Running Build..."
make -C $project_dir build

#
# TODO(AELBERTH): Tolong di-perbaiki, jangan biarkan sleep aja. Pada suatu saat scaling time 
#                 akan melebihi dari 30 detik dan disaat itulah bakal ada masalah
#
echo "$(date --utc +%FT%TZ): Scaling up..."
make -C $project_dir scale-up
sleep 30

echo "$(date --utc +%FT%TZ): Scaling old containers down..."
if [ -n "$id_server_container_lama" ]; then
    docker container rm -f $id_server_container_lama
fi
if [ -n "$id_frontend_container_lama" ]; then
    docker container rm -f $id_frontend_container_lama
fi

make -C $project_dir scale-down

echo "$(date --utc +%FT%TZ): Done."
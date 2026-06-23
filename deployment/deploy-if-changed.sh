#!/usr/bin/env bash
PROJECT_DIR="/home/akunsialbert/Projects/Sari-Tebu"
DEPLOY_SCRIPT="/home/akunsialbert/Projects/Sari-Tebu/deployment/deploy.sh"

cd $PROJECT_DIR

echo "$(date --utc +%FT%TZ): Fetching remote repository..."
git fetch
UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")
BASE=$(git merge-base @ "$UPSTREAM")
if [ $LOCAL = $REMOTE ]; then
    echo "$(date --utc +%FT%TZ): No changes detected in git"
elif [ $LOCAL = $BASE ]; then
    BUILD_VERSION=$(git rev-parse HEAD)
    echo "$(date --utc +%FT%TZ): Changes detected, deploying new version: $BUILD_VERSION"
    $DEPLOY_SCRIPT
elif [ $REMOTE = $BASE ]; then
    echo "$(date --utc +%FT%TZ): Local changes detected, stashing"
    git stash
    $DEPLOY_SCRIPT
else
    echo "$(date --utc +%FT%TZ): Git is diverged, unexpected (Uh oh)."
fi
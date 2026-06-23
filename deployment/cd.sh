#!/usr/bin/env bash
LOCK_FILE="/home/akunsialbert/Projects/Sari-Tebu/sari-tebu.lock"
cd /home/akunsialbert/Projects/Sari-Tebu
flock -n $LOCK_FILE /home/akunsialbert/Projects/Sari-Tebu/deployment/deploy-if-changed.sh >> /home/akunsialbert/Projects/Sari-Tebu/deployment.log 2>&1
#!/usr/bin/env bash

# Kenapa pakai lock?
# 
# Karena cron trigger tiap menit disaat dimana deployment butuh lebih dari semenit, maka cron trigger untuk kedua dan ketiga kalinya akan 
# di-ignore dan akan di run pada menit berikutnya

DEPLOYMENT_DIR="/home/akunsialbert/Projects/Sari-Tebu/deployment"
LOCK_FILE="$DEPLOYMENT_DIR/deployment.lock"
LOG_FILE="$DEPLOYMENT_DIR/deployment.log"
cd $DEPLOYMENT_DIR
flock -n $LOCK_FILE $DEPLOYMENT_DIR/deploy-if-changed.sh >> $LOG_FILE 2>&1
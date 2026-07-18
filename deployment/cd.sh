#!/usr/bin/env bash

# Pastikan berada pada Deployment directory terlebih dahulu
cd /home/akunsialbert/Projects/Sari-Tebu/deployment

# Kenapa pakai lock?
# 
# Karena cron trigger tiap menit disaat dimana deployment butuh lebih dari semenit, maka cron trigger untuk kedua dan ketiga kalinya akan 
# di-ignore dan akan di run pada menit berikutnya
flock -n deployment.lock deploy.sh >> deployment.log 2>&1
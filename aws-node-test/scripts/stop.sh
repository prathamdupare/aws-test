#!/bin/bash
cd /home/ec2-user/api || exit 0
pm2 stop my-node-api || true

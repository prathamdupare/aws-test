#!/bin/bash
set -e
cd /home/ec2-user/api
sudo chown -R ec2-user:ec2-user /home/ec2-user/api
npm ci --omit=dev

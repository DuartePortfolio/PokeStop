#!/usr/bin/env bash
set -euo pipefail

STACK_NAME=${1:-pokestop}

echo "Building images for stack '${STACK_NAME}'..."

docker build -t pokestop/authentication-service:latest ./authentication-service
docker build -t pokestop/user-service:latest ./user-service
docker build -t pokestop/team-service:latest ./team-service
docker build -t pokestop/pokedex-service:latest ./pokedex-service
docker build -t pokestop/collection-service:latest ./collection-service
docker build -t pokestop/encounter-service:latest ./encounter-service

echo "Images built. Creating or updating swarm stack using docker-stack.yml..."

docker stack deploy -c docker-stack.yml ${STACK_NAME}

echo "Deployed stack '${STACK_NAME}'. To remove: docker stack rm ${STACK_NAME}" 

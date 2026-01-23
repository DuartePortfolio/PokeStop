Quick Start — Deploy PokeStop on Docker Swarm
=============================================

Prerequisites
- Docker Engine with Swarm initialized (single-node swarm is fine)
- Bash shell

Build images and deploy (local single-node swarm):

```bash
# make script executable
chmod +x ./scripts/build_and_deploy_swarm.sh

# Initialize a swarm (if not already):
docker swarm init --advertise-addr 127.0.0.1

# Build images and deploy the stack
./scripts/build_and_deploy_swarm.sh pokestop

# Inspect services
docker stack services pokestop

# To remove the stack
docker stack rm pokestop
```

Notes
- The script builds local images tagged as `pokestop/<service>:latest` and then runs `docker stack deploy -c docker-stack.yml pokestop`.
- On multi-node swarms you should push images to a registry and update `docker-stack.yml` to reference registry image paths.

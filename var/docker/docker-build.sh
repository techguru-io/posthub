#!/bin/bash

set -o xtrace

docker rmi localhost/posthub || true
docker build --target dist -t localhost/posthub -f Dockerfile.dev .
docker build --target devcontainer -t localhost/posthub-devcontainer -f Dockerfile.dev .

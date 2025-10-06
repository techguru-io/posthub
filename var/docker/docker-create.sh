#!/usr/bin/env bash

docker kill posthub || true 
docker rm posthub || true 
docker create --name posthub -p 3000:3000 -p 4200:4200 localhost/posthub

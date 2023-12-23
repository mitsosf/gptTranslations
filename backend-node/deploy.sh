#!/bin/bash
docker build --tag gpt-tranlsations-node-api:latest .
docker-compose down
docker-compose up -d
#!/bin/sh

set -e

docker stop abp_autores || true
docker rm abp_autores || true

docker run -d --name abp_autores --env-file=$(pwd)/config.env jchancehud/abp-autores:latest

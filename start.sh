#!/bin/sh

set -e

docker run -d --name abp_autores --env-file=$(pwd)/config.env jchancehud/abp-autores:latest

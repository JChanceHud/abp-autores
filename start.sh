#!/bin/sh

docker run --env-file=$(pwd)/config.env -it --rm $(docker build . -q)
